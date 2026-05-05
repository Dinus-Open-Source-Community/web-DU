package service

import (
	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
)

func isPostgresUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

// @Summary      Create lesson assignment (Admin/Mentor)
// @Description  Create assignment for a lesson. Each lesson allows at most one assignment (text or quiz); use PUT to update.
// @Tags         Lesson Assignment
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                            true  "Lesson UID"
// @Param        request  body      dto.LessonAssignmentUpsertRequest true  "Lesson assignment payload"
// @Success      201  {object}  map[string]any  "Lesson assignment created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Lesson or module not found"
// @Failure      409  {object}  map[string]any  "Lesson already has an assignment"
// @Failure      500  {object}  map[string]any  "Failed to create lesson assignment"
// @Router       /lessons/{id}/assignment [post]
func CreateLessonAssignmentFunc(c *gin.Context) {
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

	var req dto.LessonAssignmentUpsertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request data", "data": nil, "error": err.Error()})
		return
	}

	assignment, err := buildLessonAssignmentModel(lesson.Uid, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid lesson assignment payload", "data": nil, "error": err.Error()})
		return
	}

	var existing entity.LessonAssignment
	err = database.DB.Where("lesson_uid = ?", lesson.Uid).First(&existing).Error
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "This lesson already has an assignment; use PUT /lessons/{id}/assignment to update it",
			"data":    nil,
			"error":   nil,
		})
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to check lesson assignment", "data": nil, "error": err.Error()})
		return
	}

	if err := database.DB.Create(&assignment).Error; err != nil {
		if isPostgresUniqueViolation(err) {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "This lesson already has an assignment; use PUT /lessons/{id}/assignment to update it",
				"data":    nil,
				"error":   nil,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create lesson assignment", "data": nil, "error": err.Error()})
		return
	}

	assignment.Title = utils.DecryptOrSelf(assignment.Title)
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Lesson assignment created successfully", "data": assignment, "error": nil})
}

// @Summary      Get lesson assignment (Admin/Mentor)
// @Description  Retrieve assignment configuration by lesson UID.
// @Tags         Lesson Assignment
// @Produce      json
// @Security     BearerAuth
// @Param        id  path      string  true  "Lesson UID"
// @Success      200  {object}  map[string]any  "Lesson assignment retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Lesson assignment not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve lesson assignment"
// @Router       /lessons/{id}/assignment [get]
func GetLessonAssignmentFunc(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to retrieve lesson assignment", "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Lesson assignment retrieved successfully", "data": assignment, "error": nil})
}

// @Summary      Update lesson assignment (Admin/Mentor)
// @Description  Update assignment configuration for a lesson.
// @Tags         Lesson Assignment
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                            true  "Lesson UID"
// @Param        request  body      dto.LessonAssignmentUpsertRequest true  "Lesson assignment payload"
// @Success      200  {object}  map[string]any  "Lesson assignment updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Lesson assignment not found"
// @Failure      500  {object}  map[string]any  "Failed to update lesson assignment"
// @Router       /lessons/{id}/assignment [put]
func UpdateLessonAssignmentFunc(c *gin.Context) {
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

	var req dto.LessonAssignmentUpsertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request data", "data": nil, "error": err.Error()})
		return
	}

	assignmentModel, err := buildLessonAssignmentModel(lesson.Uid, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid lesson assignment payload", "data": nil, "error": err.Error()})
		return
	}

	var existing entity.LessonAssignment
	if err := database.DB.Where("lesson_uid = ?", lesson.Uid).First(&existing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Lesson assignment not found", "data": nil, "error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to find lesson assignment", "data": nil, "error": err.Error()})
		return
	}

	existing.Title = assignmentModel.Title
	existing.TaskType = assignmentModel.TaskType
	existing.TaskDescription = assignmentModel.TaskDescription
	existing.QuizPayload = assignmentModel.QuizPayload
	existing.AllowFileSubmission = assignmentModel.AllowFileSubmission
	existing.AllowPlainTextSubmission = assignmentModel.AllowPlainTextSubmission
	existing.AllowRichTextSubmission = assignmentModel.AllowRichTextSubmission
	existing.RequireFileDescription = assignmentModel.RequireFileDescription
	existing.InstructionAttachments = assignmentModel.InstructionAttachments
	existing.DeadlineAt = assignmentModel.DeadlineAt
	existing.Status = assignmentModel.Status
	existing.AutoCloseAfterDeadline = assignmentModel.AutoCloseAfterDeadline
	existing.AllowResubmit = assignmentModel.AllowResubmit
	existing.MaxResubmitCount = assignmentModel.MaxResubmitCount

	if err := database.DB.Save(&existing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to update lesson assignment", "data": nil, "error": err.Error()})
		return
	}

	existing.Title = utils.DecryptOrSelf(existing.Title)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Lesson assignment updated successfully", "data": existing, "error": nil})
}

// @Summary      Delete lesson assignment (Admin/Mentor)
// @Description  Delete assignment configuration for a lesson.
// @Tags         Lesson Assignment
// @Produce      json
// @Security     BearerAuth
// @Param        id  path      string  true  "Lesson UID"
// @Success      200  {object}  map[string]any  "Lesson assignment deleted successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Lesson assignment not found"
// @Failure      500  {object}  map[string]any  "Failed to delete lesson assignment"
// @Router       /lessons/{id}/assignment [delete]
func DeleteLessonAssignmentFunc(c *gin.Context) {
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

	if err := database.DB.Where("lesson_uid = ?", lesson.Uid).Delete(&entity.LessonAssignment{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to delete lesson assignment", "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Lesson assignment deleted successfully", "data": nil, "error": nil})
}

func loadLessonAndModuleForAssignment(c *gin.Context) (entity.Lesson, entity.Module, bool) {
	lessonID, ok := resolveUIDParam(c, "lessons", "id", "lesson")
	if !ok {
		return entity.Lesson{}, entity.Module{}, false
	}

	var lesson entity.Lesson
	if err := database.DB.First(&lesson, lessonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Lesson not found", "data": nil, "error": err.Error()})
		return entity.Lesson{}, entity.Module{}, false
	}

	var module entity.Module
	if err := database.DB.First(&module, lesson.ModuleUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Module not found", "data": nil, "error": err.Error()})
		return entity.Lesson{}, entity.Module{}, false
	}

	return lesson, module, true
}

func buildLessonAssignmentModel(lessonUID uuid.UUID, req dto.LessonAssignmentUpsertRequest) (entity.LessonAssignment, error) {
	title := strings.TrimSpace(req.Title)
	if title == "" {
		return entity.LessonAssignment{}, errors.New("title is required")
	}

	taskType := entity.LessonAssignmentTaskType(strings.ToLower(strings.TrimSpace(req.TaskType)))
	if taskType != entity.LessonAssignmentTaskTypeText && taskType != entity.LessonAssignmentTaskTypeQuiz {
		return entity.LessonAssignment{}, errors.New("task_type must be one of: text, quiz")
	}

	status := entity.LessonAssignmentStatus(strings.ToUpper(strings.TrimSpace(req.Status)))
	if status != entity.LessonAssignmentStatusDraft && status != entity.LessonAssignmentStatusTerbit && status != entity.LessonAssignmentStatusDitutup {
		return entity.LessonAssignment{}, errors.New("status must be one of: DRAFT, TERBIT (published), DITUTUP (closed)")
	}

	if !req.AllowFileSubmission && !req.AllowPlainTextSubmission && !req.AllowRichTextSubmission {
		return entity.LessonAssignment{}, errors.New("at least one submit option must be enabled")
	}

	if req.RequireFileDescription && !req.AllowFileSubmission {
		return entity.LessonAssignment{}, errors.New("require_file_description can only be true when allow_file_submission is true")
	}

	if req.AllowResubmit {
		if req.MaxResubmitCount == nil || *req.MaxResubmitCount < 1 {
			return entity.LessonAssignment{}, errors.New("max_resubmit_count is required and must be >= 1 when allow_resubmit is true")
		}
	} else {
		req.MaxResubmitCount = nil
	}

	deadlineAt, err := time.Parse(time.RFC3339, req.DeadlineAt)
	if err != nil {
		return entity.LessonAssignment{}, errors.New("deadline_at must use RFC3339 format")
	}

	taskDescription, err := toRawMessage(req.TaskDescription)
	if err != nil {
		return entity.LessonAssignment{}, errors.New("invalid task_description JSON")
	}

	quizPayload, err := toRawMessage(req.Quiz)
	if err != nil {
		return entity.LessonAssignment{}, errors.New("invalid quiz JSON")
	}

	if taskType == entity.LessonAssignmentTaskTypeText && len(taskDescription) == 0 {
		return entity.LessonAssignment{}, errors.New("task_description is required when task_type is text")
	}
	if taskType == entity.LessonAssignmentTaskTypeQuiz && len(quizPayload) == 0 {
		return entity.LessonAssignment{}, errors.New("quiz is required when task_type is quiz")
	}

	instructionAttachments, err := toRawMessage(req.InstructionAttachments)
	if err != nil {
		return entity.LessonAssignment{}, errors.New("invalid instruction_attachments JSON")
	}

	titleEnc, err := utils.Encrypt(title)
	if err != nil {
		return entity.LessonAssignment{}, errors.New("failed to encrypt assignment title")
	}

	return entity.LessonAssignment{
		LessonUid:                lessonUID,
		Title:                    titleEnc,
		TaskType:                 taskType,
		TaskDescription:          taskDescription,
		QuizPayload:              quizPayload,
		AllowFileSubmission:      req.AllowFileSubmission,
		AllowPlainTextSubmission: req.AllowPlainTextSubmission,
		AllowRichTextSubmission:  req.AllowRichTextSubmission,
		RequireFileDescription:   req.RequireFileDescription,
		InstructionAttachments:   instructionAttachments,
		DeadlineAt:               deadlineAt,
		Status:                   status,
		AutoCloseAfterDeadline:   req.AutoCloseAfterDeadline,
		AllowResubmit:            req.AllowResubmit,
		MaxResubmitCount:         req.MaxResubmitCount,
	}, nil
}

func toRawMessage(v interface{}) (json.RawMessage, error) {
	if v == nil {
		return nil, nil
	}
	b, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	if string(b) == "null" {
		return nil, nil
	}
	return json.RawMessage(b), nil
}
