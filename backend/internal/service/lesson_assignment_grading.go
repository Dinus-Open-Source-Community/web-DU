package service

import (
	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const defaultQuizPassingPercent = 70.0

// gradeQuizSubmission compares quiz_answers to correctOptionId per question in quiz_payload.
// Score is (correct / total_questions) * 100. Passing uses passingScore from payload when set (0–100), else 70.
func gradeQuizSubmission(quizPayload json.RawMessage, answers json.RawMessage) (scorePercent float64, passed bool, correctN int, totalN int, err error) {
	var qp struct {
		Questions []struct {
			ID              string `json:"id"`
			CorrectOptionID string `json:"correctOptionId"`
		} `json:"questions"`
		PassingScore *float64 `json:"passingScore"`
	}
	if err := json.Unmarshal(quizPayload, &qp); err != nil {
		return 0, false, 0, 0, errors.New("invalid quiz configuration")
	}
	var ans map[string]interface{}
	if err := json.Unmarshal(answers, &ans); err != nil {
		return 0, false, 0, 0, errors.New("invalid quiz answers")
	}

	passThreshold := defaultQuizPassingPercent
	if qp.PassingScore != nil {
		passThreshold = *qp.PassingScore
	}

	for _, q := range qp.Questions {
		if strings.TrimSpace(q.ID) == "" {
			continue
		}
		totalN++
		if strings.TrimSpace(q.CorrectOptionID) == "" {
			continue
		}
		raw, ok := ans[q.ID]
		if !ok {
			continue
		}
		if normalizeQuizAnswer(raw) == normalizeQuizAnswer(q.CorrectOptionID) {
			correctN++
		}
	}

	if totalN == 0 {
		return 0, false, 0, 0, errors.New("quiz has no gradable questions")
	}

	scorePercent = float64(correctN) / float64(totalN) * 100
	scorePercent = math.Round(scorePercent*1000) / 1000
	passed = scorePercent >= passThreshold
	return scorePercent, passed, correctN, totalN, nil
}

func normalizeQuizAnswer(v interface{}) string {
	switch x := v.(type) {
	case string:
		return strings.TrimSpace(x)
	case float64:
		if x == math.Trunc(x) {
			return fmt.Sprintf("%.0f", x)
		}
		return strings.TrimSpace(fmt.Sprint(x))
	case bool:
		return fmt.Sprint(x)
	default:
		return strings.TrimSpace(fmt.Sprint(x))
	}
}

func applyQuizAutoGradeToSubmission(sub *entity.LessonAssignmentSubmission, assignment *entity.LessonAssignment) error {
	if assignment.TaskType != entity.LessonAssignmentTaskTypeQuiz {
		return nil
	}
	score, passed, correct, total, err := gradeQuizSubmission(assignment.QuizPayload, sub.QuizAnswers)
	if err != nil {
		return err
	}
	now := time.Now()
	sub.ScorePercent = &score
	sub.Passed = &passed
	sub.QuizCorrectCount = &correct
	sub.QuizQuestionCount = &total
	sub.IsAutoGraded = true
	sub.GradedAt = &now
	sub.GradedByUid = nil
	return nil
}

// @Summary      Grade text lesson assignment submission (Admin / Mentor)
// @Description  Set score and optional feedback for a text-type assignment submission. Quiz submissions are auto-graded and cannot be graded with this route.
// @Tags         Lesson Assignment Submission
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id             path  string  true  "Lesson UID"
// @Param        submissionUid  path  string  true  "Submission UID"
// @Param        request        body  dto.LessonAssignmentSubmissionGradeRequest  true  "Grade payload (score_percent 0–100)"
// @Success      200  {object}  map[string]any  "Updated submission"
// @Failure      400  {object}  map[string]any  "Invalid request or wrong assignment type"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      404  {object}  map[string]any  "Not found"
// @Router       /lessons/{id}/assignment/submissions/{submissionUid}/grade [put]
func GradeLessonAssignmentSubmissionForStaffFunc(c *gin.Context) {
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

	if assignment.TaskType != entity.LessonAssignmentTaskTypeText {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Manual grading is only for text assignments; quiz submissions are graded automatically", "data": nil, "error": nil})
		return
	}

	var row entity.LessonAssignmentSubmission
	if err := database.DB.Where("uid = ? AND lesson_assignment_uid = ?", submissionID, assignment.Uid).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Submission not found", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load submission", "data": nil, "error": err.Error()})
		return
	}

	var req dto.LessonAssignmentSubmissionGradeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request data", "data": nil, "error": err.Error()})
		return
	}

	if req.ScorePercent < 0 || req.ScorePercent > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "score_percent must be between 0 and 100", "data": nil, "error": nil})
		return
	}

	passedVal := req.ScorePercent >= defaultQuizPassingPercent
	if req.Passed != nil {
		passedVal = *req.Passed
	}

	now := time.Now()
	score := math.Round(req.ScorePercent*1000) / 1000

	feedbackEnc, err := utils.Encrypt(req.Feedback)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt feedback", "data": nil, "error": err.Error()})
		return
	}
	plainTextEnc, err := utils.Encrypt(row.PlainText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt plain_text", "data": nil, "error": err.Error()})
		return
	}
	fileOriginalEnc, err := utils.Encrypt(row.FileOriginalFilename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt file_original_filename", "data": nil, "error": err.Error()})
		return
	}
	fileDescEnc, err := utils.Encrypt(row.FileDescription)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt file_description", "data": nil, "error": err.Error()})
		return
	}

	// Field di row sudah berupa plaintext setelah AfterFind hook dijalankan oleh
	// First() di atas. Re-enkripsi sebelum Save() agar data yang tersimpan tetap
	// dalam bentuk ciphertext.
	row.PlainText = plainTextEnc
	row.FileOriginalFilename = fileOriginalEnc
	row.FileDescription = fileDescEnc
	row.ScorePercent = &score
	row.Passed = &passedVal
	row.Feedback = feedbackEnc
	row.GradedAt = &now
	row.GradedByUid = &user.Uid
	row.IsAutoGraded = false
	row.QuizCorrectCount = nil
	row.QuizQuestionCount = nil

	if err := database.DB.Save(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to save grade", "data": nil, "error": err.Error()})
		return
	}
	if err := syncLatestAttemptGradingFromSubmission(database.DB, &row); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to sync submission attempt grade", "data": nil, "error": err.Error()})
		return
	}

	if err := preloadSubmissionRelations(database.DB).First(&row, row.Uid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to reload submission", "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Submission graded successfully", "data": submissionToResponse(row), "error": nil})
}
