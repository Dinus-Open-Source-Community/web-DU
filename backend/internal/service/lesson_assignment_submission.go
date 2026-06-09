package service

import (
	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"
	"errors"
	"fmt"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type submissionPayload struct {
	PlainText       string
	RichText        json.RawMessage
	FileDescription string
	QuizAnswers     json.RawMessage
	File            *multipart.FileHeader
	RemoveFile      bool
}

// @Summary      Submit lesson assignment (Enrollment User)
// @Description  Create your submission. Text assignments: multipart with optional file (max 10MB per file if allow_file_submission). Quiz assignments: JSON or multipart field quiz_answers — scored automatically vs quiz_payload (correctOptionId, passingScore).
// @Tags         Lesson Assignment Submission
// @Accept       json
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string  true  "Lesson UID"
// @Param        plain_text       formData  string  false  "Plain text (when allowed)"
// @Param        rich_text        formData  string  false  "Rich text JSON (when allowed)"
// @Param        file_description formData  string  false  "Required when assignment requires file description"
// @Param        quiz_answers     formData  string  false  "JSON object of questionId -> chosenOptionId (quiz assignments)"
// @Param        file             formData  file    false  "Attachment when allow_file_submission is true"
// @Param        body             body      dto.LessonAssignmentSubmissionUpsertRequest  false  "JSON body when not using multipart"
// @Success      201  {object}  map[string]any  "Submission created"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden or submission closed"
// @Failure      404  {object}  map[string]any  "Not found"
// @Failure      409  {object}  map[string]any  "Already submitted — use PUT to update"
// @Failure      413  {object}  map[string]any  "File too large"
// @Router       /lessons/{id}/assignment/submission [post]
func CreateLessonAssignmentSubmissionFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	lesson, module, ok := loadLessonAndModuleForAssignment(c)
	if !ok {
		return
	}

	enrolled, err := canSubmitLessonAssignmentAsEnrolledParticipant(user.Uid, module.CourseUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate enrollment", "data": nil, "error": err.Error()})
		return
	}
	if !enrolled {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Only enrolled participants can submit assignments for this course", "data": nil, "error": nil})
		return
	}

	var assignment entity.LessonAssignment
	if err := database.DB.Where("lesson_uid = ?", lesson.Uid).First(&assignment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Lesson assignment not found", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load assignment", "data": nil, "error": err.Error()})
		return
	}

	if err := assertAssignmentAcceptsSubmission(&assignment, time.Now()); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": err.Error(), "data": nil, "error": err.Error()})
		return
	}

	var existing entity.LessonAssignmentSubmission
	if err := database.DB.Where("lesson_assignment_uid = ? AND user_uid = ?", assignment.Uid, user.Uid).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": "You already submitted this assignment; use PUT /lessons/{id}/assignment/submission to update", "data": nil, "error": nil})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to check existing submission", "data": nil, "error": err.Error()})
		return
	}

	payload, perr := parseSubmissionUpsert(c)
	if perr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request data", "data": nil, "error": perr.Error()})
		return
	}

	if err := validateSubmissionAgainstAssignment(&assignment, payload, nil); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil, "error": err.Error()})
		return
	}

	bucket := utils.GetBucketAssignments()
	if bucket == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "MINIO_BUCKET_ASSIGNMENTS is not configured", "data": nil, "error": nil})
		return
	}

	fileURL := ""
	origName := ""
	if payload.File != nil {
		if payload.File.Size > utils.MaxLessonAssignmentSubmissionAttachmentBytes {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{"success": false, "message": "File exceeds maximum size of 10MB", "data": nil, "error": nil})
			return
		}
		urlStr, err := utils.UploadFile(payload.File, bucket)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to upload file", "data": nil, "error": err.Error()})
			return
		}
		fileURL = urlStr
		origName = payload.File.Filename
	}

	plainTextEnc, err := utils.Encrypt(strings.TrimSpace(payload.PlainText))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt plain_text", "data": nil, "error": err.Error()})
		return
	}
	origNameEnc, err := utils.Encrypt(origName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt file_original_filename", "data": nil, "error": err.Error()})
		return
	}
	fileDescEnc, err := utils.Encrypt(strings.TrimSpace(payload.FileDescription))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt file_description", "data": nil, "error": err.Error()})
		return
	}

	row := entity.LessonAssignmentSubmission{
		LessonAssignmentUid:  assignment.Uid,
		UserUid:              user.Uid,
		PlainText:            plainTextEnc,
		RichText:             payload.RichText,
		FileURL:              fileURL,
		FileOriginalFilename: origNameEnc,
		FileDescription:      fileDescEnc,
		QuizAnswers:          payload.QuizAnswers,
		AttemptCount:         1,
	}

	if err := applyQuizAutoGradeToSubmission(&row, &assignment); err != nil {
		if fileURL != "" {
			tryDeleteAssignmentObject(fileURL)
		}
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Cannot grade quiz submission", "data": nil, "error": err.Error()})
		return
	}

	if err := database.DB.Create(&row).Error; err != nil {
		if fileURL != "" {
			tryDeleteAssignmentObject(fileURL)
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to save submission", "data": nil, "error": err.Error()})
		return
	}
	if err := recordSubmissionAttempt(&row, row.AttemptCount); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to save submission attempt history", "data": nil, "error": err.Error()})
		return
	}

	utils.DecryptFields(&row.PlainText, &row.FileOriginalFilename, &row.FileDescription, &row.Feedback)
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Submission recorded successfully", "data": row, "error": nil})
}

// @Summary      Update lesson assignment submission (Enrollment User)
// @Description  Edit your submission when resubmit rules allow. Quiz submissions are re-scored automatically after update.
// @Tags         Lesson Assignment Submission
// @Accept       json
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Lesson UID"
// @Success      200  {object}  map[string]any  "Submission updated"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden or resubmit not allowed"
// @Failure      404  {object}  map[string]any  "Submission not found"
// @Router       /lessons/{id}/assignment/submission [put]
func UpdateLessonAssignmentSubmissionFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	lesson, module, ok := loadLessonAndModuleForAssignment(c)
	if !ok {
		return
	}

	enrolled, err := canSubmitLessonAssignmentAsEnrolledParticipant(user.Uid, module.CourseUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate enrollment", "data": nil, "error": err.Error()})
		return
	}
	if !enrolled {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Only enrolled participants can update submissions for this course", "data": nil, "error": nil})
		return
	}

	var assignment entity.LessonAssignment
	if err := database.DB.Where("lesson_uid = ?", lesson.Uid).First(&assignment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Lesson assignment not found", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load assignment", "data": nil, "error": err.Error()})
		return
	}

	if err := assertAssignmentAcceptsSubmission(&assignment, time.Now()); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": err.Error(), "data": nil, "error": err.Error()})
		return
	}

	var row entity.LessonAssignmentSubmission
	if err := database.DB.Where("lesson_assignment_uid = ? AND user_uid = ?", assignment.Uid, user.Uid).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "No submission found; use POST to create one", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load submission", "data": nil, "error": err.Error()})
		return
	}

	maxAttempts := maxSubmissionAttempts(&assignment)
	if row.AttemptCount >= maxAttempts {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Maximum submission attempts reached", "data": nil, "error": nil})
		return
	}

	payload, perr := parseSubmissionUpsert(c)
	if perr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request data", "data": nil, "error": perr.Error()})
		return
	}

	merged := mergePayloadForUpdate(&row, payload)
	if err := validateSubmissionAgainstAssignment(&assignment, merged, &row); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil, "error": err.Error()})
		return
	}

	bucket := utils.GetBucketAssignments()
	if bucket == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "MINIO_BUCKET_ASSIGNMENTS is not configured", "data": nil, "error": nil})
		return
	}

	oldURL := row.FileURL
	newURL := row.FileURL
	newFileOriginalName := row.FileOriginalFilename // sudah berupa plaintext setelah AfterFind
	if merged.RemoveFile {
		if oldURL != "" {
			tryDeleteAssignmentObject(oldURL)
		}
		newURL = ""
		newFileOriginalName = ""
	}
	if payload.File != nil {
		if payload.File.Size > utils.MaxLessonAssignmentSubmissionAttachmentBytes {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{"success": false, "message": "File exceeds maximum size of 10MB", "data": nil, "error": nil})
			return
		}
		urlStr, err := utils.UploadFile(payload.File, bucket)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to upload file", "data": nil, "error": err.Error()})
			return
		}
		if newURL != "" && newURL != urlStr {
			tryDeleteAssignmentObject(newURL)
		}
		newURL = urlStr
		newFileOriginalName = payload.File.Filename
	}

	plainTextNew := strings.TrimSpace(merged.PlainText)
	fileDescNew := strings.TrimSpace(merged.FileDescription)

	if assignment.RequireFileDescription && newURL != "" && fileDescNew == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "file_description is required when submitting a file", "data": nil, "error": nil})
		return
	}

	plainTextEnc, err := utils.Encrypt(plainTextNew)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt plain_text", "data": nil, "error": err.Error()})
		return
	}
	fileOriginalNameEnc, err := utils.Encrypt(newFileOriginalName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt file_original_filename", "data": nil, "error": err.Error()})
		return
	}
	fileDescEnc, err := utils.Encrypt(fileDescNew)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt file_description", "data": nil, "error": err.Error()})
		return
	}
	feedbackEnc, err := utils.Encrypt(row.Feedback)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt feedback", "data": nil, "error": err.Error()})
		return
	}

	row.FileURL = newURL
	row.PlainText = plainTextEnc
	row.RichText = merged.RichText
	row.QuizAnswers = merged.QuizAnswers
	row.FileOriginalFilename = fileOriginalNameEnc
	row.FileDescription = fileDescEnc
	row.Feedback = feedbackEnc

	if err := applyQuizAutoGradeToSubmission(&row, &assignment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Cannot grade quiz submission", "data": nil, "error": err.Error()})
		return
	}

	row.AttemptCount++

	if err := database.DB.Save(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to update submission", "data": nil, "error": err.Error()})
		return
	}
	if err := recordSubmissionAttempt(&row, row.AttemptCount); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to save submission attempt history", "data": nil, "error": err.Error()})
		return
	}

	utils.DecryptFields(&row.PlainText, &row.FileOriginalFilename, &row.FileDescription, &row.Feedback)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Submission updated successfully", "data": row, "error": nil})
}

// @Summary      Get my lesson assignment submissions (Enrollment User)
// @Description  Returns all submission attempts for the authenticated user as an array. Each item includes answer content and grading (score_percent, passed, feedback, has_feedback, is_graded, quiz counts).
// @Tags         Lesson Assignment Submission
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Lesson UID"
// @Success      200  {object}  map[string]any  "submissions array + attempt metadata"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      404  {object}  map[string]any  "Not found"
// @Router       /lessons/{id}/assignment/submission [get]
func GetMyLessonAssignmentSubmissionFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	lesson, module, ok := loadLessonAndModuleForAssignment(c)
	if !ok {
		return
	}

	enrolled, err := canSubmitLessonAssignmentAsEnrolledParticipant(user.Uid, module.CourseUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate enrollment", "data": nil, "error": err.Error()})
		return
	}
	if !enrolled {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Only enrolled participants can view their submission for this course", "data": nil, "error": nil})
		return
	}

	var assignment entity.LessonAssignment
	if err := database.DB.Where("lesson_uid = ?", lesson.Uid).First(&assignment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Lesson assignment not found", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load assignment", "data": nil, "error": err.Error()})
		return
	}

	var row entity.LessonAssignmentSubmission
	if err := database.DB.Where("lesson_assignment_uid = ? AND user_uid = ?", assignment.Uid, user.Uid).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "No submission yet", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load submission", "data": nil, "error": err.Error()})
		return
	}

	if err := ensureSubmissionAttemptsBackfilled(&row); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load submission history", "data": nil, "error": err.Error()})
		return
	}

	attempts, err := listSubmissionAttemptsForUser(row.Uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load submission history", "data": nil, "error": err.Error()})
		return
	}

	// Sinkronkan grading terbaru dari baris submission utama (mis. penilaian manual mentor).
	if len(attempts) > 0 {
		latest := &attempts[len(attempts)-1]
		latest.ScorePercent = row.ScorePercent
		latest.Passed = row.Passed
		latest.QuizCorrectCount = row.QuizCorrectCount
		latest.QuizQuestionCount = row.QuizQuestionCount
		latest.Feedback = row.Feedback
		latest.GradedAt = row.GradedAt
		latest.IsAutoGraded = row.IsAutoGraded
	}

	submissions := make([]gin.H, 0, len(attempts))
	for _, attempt := range attempts {
		submissions = append(submissions, buildSubmissionAttemptItem(attempt))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Submissions retrieved successfully",
		"data": gin.H{
			"lesson_uid":            lesson.Uid,
			"assignment_uid":        assignment.Uid,
			"submission_uid":          row.Uid,
			"total_attempts":          len(submissions),
			"latest_attempt_number":   row.AttemptCount,
			"max_attempts":          maxSubmissionAttempts(&assignment),
			"submissions":           submissions,
		},
		"error": nil,
	})
}

// @Summary      List lesson assignment submissions (Admin / Mentor)
// @Description  Returns all participant submissions for this lesson's assignment. Requires admin or mentor assigned to the course.
// @Tags         Lesson Assignment Submission
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Lesson UID"
// @Success      200  {object}  map[string]any  "List of submissions"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      404  {object}  map[string]any  "Lesson assignment not found"
// @Router       /lessons/{id}/assignment/submissions [get]
func ListLessonAssignmentSubmissionsForStaffFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	lesson, module, ok := loadLessonAndModuleForAssignment(c)
	if !ok {
		return
	}

	allowed, err := canManageCourseByRole(user, module.CourseUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate access", "data": nil, "error": err.Error()})
		return
	}
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Admin or assigned mentor only", "data": nil, "error": nil})
		return
	}

	var assignment entity.LessonAssignment
	if err := database.DB.Where("lesson_uid = ?", lesson.Uid).First(&assignment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Lesson assignment not found", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load assignment", "data": nil, "error": err.Error()})
		return
	}

	var submissions []entity.LessonAssignmentSubmission
	if err := preloadSubmissionRelations(
		database.DB.Where("lesson_assignment_uid = ?", assignment.Uid),
	).Order("updated_at DESC").Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to list submissions", "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Submissions retrieved successfully",
		"data": gin.H{
			"lesson_uid":     lesson.Uid,
			"assignment_uid": assignment.Uid,
			"submissions":    submissionsToResponse(submissions),
		},
		"error": nil,
	})
}

// @Summary      Get one lesson assignment submission (Admin / Mentor)
// @Description  Returns a single submission by UID for this lesson's assignment. Requires admin or mentor assigned to the course.
// @Tags         Lesson Assignment Submission
// @Produce      json
// @Security     BearerAuth
// @Param        id             path  string  true  "Lesson UID"
// @Param        submissionUid  path  string  true  "Submission UID"
// @Success      200  {object}  map[string]any  "Submission"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      404  {object}  map[string]any  "Not found"
// @Router       /lessons/{id}/assignment/submissions/{submissionUid} [get]
func GetLessonAssignmentSubmissionForStaffFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	lesson, module, ok := loadLessonAndModuleForAssignment(c)
	if !ok {
		return
	}

	allowed, err := canManageCourseByRole(user, module.CourseUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate access", "data": nil, "error": err.Error()})
		return
	}
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Admin or assigned mentor only", "data": nil, "error": nil})
		return
	}

	submissionID, ok := resolveUIDParam(c, "lesson_assignment_submissions", "submissionUid", "submission")
	if !ok {
		return
	}

	var assignment entity.LessonAssignment
	if err := database.DB.Where("lesson_uid = ?", lesson.Uid).First(&assignment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Lesson assignment not found", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load assignment", "data": nil, "error": err.Error()})
		return
	}

	var row entity.LessonAssignmentSubmission
	if err := preloadSubmissionRelations(
		database.DB.Where("uid = ? AND lesson_assignment_uid = ?", submissionID, assignment.Uid),
	).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Submission not found", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load submission", "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Submission retrieved successfully", "data": submissionToResponse(row), "error": nil})
}

func assertAssignmentAcceptsSubmission(a *entity.LessonAssignment, now time.Time) error {
	if a.Status == entity.LessonAssignmentStatusDitutup {
		return errors.New("assignment is closed")
	}
	if a.Status != entity.LessonAssignmentStatusTerbit {
		return errors.New("assignment is not published for submission")
	}
	if now.After(a.DeadlineAt) {
		return errors.New("assignment deadline has passed")
	}
	return nil
}

func maxSubmissionAttempts(a *entity.LessonAssignment) int {
	if !a.AllowResubmit {
		return 1
	}
	if a.MaxResubmitCount == nil || *a.MaxResubmitCount < 1 {
		return 1
	}
	return 1 + *a.MaxResubmitCount
}

func parseSubmissionUpsert(c *gin.Context) (*submissionPayload, error) {
	ct := c.GetHeader("Content-Type")
	if strings.HasPrefix(ct, "multipart/form-data") {
		if err := c.Request.ParseMultipartForm(12 << 20); err != nil {
			return nil, err
		}
		p := &submissionPayload{
			PlainText:       c.PostForm("plain_text"),
			FileDescription: c.PostForm("file_description"),
			RemoveFile:      strings.EqualFold(c.PostForm("remove_file"), "true") || c.PostForm("remove_file") == "1",
		}
		if qs := strings.TrimSpace(c.PostForm("quiz_answers")); qs != "" {
			p.QuizAnswers = json.RawMessage(qs)
		}
		if rt := strings.TrimSpace(c.PostForm("rich_text")); rt != "" {
			normalized, err := normalizeRichTextPayload(rt)
			if err != nil {
				return nil, fmt.Errorf("invalid rich_text: %w", err)
			}
			p.RichText = normalized
		}
		fh, err := c.FormFile("file")
		if err == nil {
			p.File = fh
		} else if err != http.ErrMissingFile {
			return nil, err
		}
		return p, nil
	}

	var body dto.LessonAssignmentSubmissionUpsertRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		return nil, err
	}
	p := &submissionPayload{
		PlainText:       body.PlainText,
		FileDescription: body.FileDescription,
		RemoveFile:      body.RemoveFile,
	}
	if body.RichText != nil {
		normalized, err := normalizeRichTextPayload(body.RichText)
		if err != nil {
			return nil, fmt.Errorf("invalid rich_text: %w", err)
		}
		if len(normalized) > 0 {
			p.RichText = normalized
		}
	}
	if body.QuizAnswers != nil {
		b, err := json.Marshal(body.QuizAnswers)
		if err != nil {
			return nil, fmt.Errorf("quiz_answers must be JSON-serializable: %w", err)
		}
		p.QuizAnswers = json.RawMessage(b)
	}
	return p, nil
}

func mergePayloadForUpdate(existing *entity.LessonAssignmentSubmission, inc *submissionPayload) *submissionPayload {
	out := &submissionPayload{
		PlainText:       inc.PlainText,
		RichText:        inc.RichText,
		FileDescription: inc.FileDescription,
		QuizAnswers:     inc.QuizAnswers,
		File:            inc.File,
		RemoveFile:      inc.RemoveFile,
	}
	if strings.TrimSpace(out.PlainText) == "" {
		out.PlainText = existing.PlainText
	}
	if len(out.RichText) == 0 {
		out.RichText = existing.RichText
	}
	if len(out.QuizAnswers) == 0 {
		out.QuizAnswers = existing.QuizAnswers
	}
	if strings.TrimSpace(inc.FileDescription) == "" && inc.File == nil && !inc.RemoveFile {
		out.FileDescription = existing.FileDescription
	} else {
		out.FileDescription = inc.FileDescription
	}
	return out
}

func validateSubmissionAgainstAssignment(a *entity.LessonAssignment, p *submissionPayload, prior *entity.LessonAssignmentSubmission) error {
	switch a.TaskType {
	case entity.LessonAssignmentTaskTypeQuiz:
		if p.File != nil {
			return errors.New("file upload is not allowed for quiz assignments")
		}
		if len(strings.TrimSpace(p.PlainText)) > 0 || len(p.RichText) > 0 {
			return errors.New("use quiz_answers for quiz assignments, not plain_text or rich_text")
		}
		if len(p.QuizAnswers) == 0 {
			return errors.New("quiz_answers is required")
		}
		return validateQuizAnswersAgainstPayload(a.QuizPayload, p.QuizAnswers)

	case entity.LessonAssignmentTaskTypeText:
		if len(p.QuizAnswers) > 0 {
			return errors.New("quiz_answers is only valid for quiz assignments")
		}
		if p.File != nil && !a.AllowFileSubmission {
			return errors.New("file submission is not allowed for this assignment")
		}
		if p.File != nil && p.File.Size > utils.MaxLessonAssignmentSubmissionAttachmentBytes {
			return errors.New("file exceeds maximum size of 10MB")
		}
		hasPlain := len(strings.TrimSpace(p.PlainText)) > 0
		hasRich := len(p.RichText) > 0 && string(p.RichText) != "null"
		hasNewFile := p.File != nil
		hasStoredFile := prior != nil && prior.FileURL != "" && !p.RemoveFile
		if hasPlain && !a.AllowPlainTextSubmission {
			return errors.New("plain text submission is not allowed for this assignment")
		}
		if hasRich && !a.AllowRichTextSubmission {
			return errors.New("rich text submission is not allowed for this assignment")
		}
		effectiveHasFile := hasNewFile || hasStoredFile
		if a.RequireFileDescription && effectiveHasFile && strings.TrimSpace(p.FileDescription) == "" {
			return errors.New("file_description is required when submitting a file")
		}
		if !hasPlain && !hasRich && !hasNewFile && !hasStoredFile {
			return errors.New("provide at least one of: plain_text, rich_text, or file (according to enabled submission types)")
		}
		return nil
	default:
		return errors.New("unsupported assignment task type")
	}
}

func validateQuizAnswersAgainstPayload(quizPayload json.RawMessage, answers json.RawMessage) error {
	var qp struct {
		Questions []struct {
			ID string `json:"id"`
		} `json:"questions"`
	}
	if err := json.Unmarshal(quizPayload, &qp); err != nil {
		return errors.New("assignment quiz configuration is invalid")
	}
	var ans map[string]interface{}
	if err := json.Unmarshal(answers, &ans); err != nil {
		return errors.New("quiz_answers must be a JSON object")
	}
	if len(ans) == 0 {
		return errors.New("quiz_answers cannot be empty")
	}
	for _, q := range qp.Questions {
		if q.ID == "" {
			continue
		}
		if _, ok := ans[q.ID]; !ok {
			return fmt.Errorf("missing answer for question id %q", q.ID)
		}
	}
	return nil
}

func tryDeleteAssignmentObject(fileURL string) {
	bucket := utils.GetBucketAssignments()
	b, key, err := utils.BucketAndObjectFromPublicURL(fileURL)
	if err != nil || b != bucket {
		return
	}
	_ = utils.DeleteFile(bucket, key)
}
