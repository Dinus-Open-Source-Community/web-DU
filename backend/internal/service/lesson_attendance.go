package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
)

// @Summary      Check in attendance for a lesson (Student Only)
// @Description  Students can only check in once per lesson. Status is set automatically based on lesson start time.
// @Tags         Lesson Attendance
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body  dto.LessonAttendanceCreateRequest  true  "Attendance data"
// @Success      201  {object}  map[string]any  "Attendance recorded successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "Lesson or enrollment not found"
// @Failure      409  {object}  map[string]any  "Already checked in for this lesson"
// @Failure      500  {object}  map[string]any  "Failed to record attendance"
// @Router       /lessons/attendances [post]
func CreateAttendanceFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var req dto.LessonAttendanceCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	lessonUid, ok := resolveUIDValue(c, "lessons", req.LessonUid, "lesson")
	if !ok {
		return
	}
	enrollmentUid, ok := resolveUIDValue(c, "enrollments", req.EnrollmentUid, "enrollment")
	if !ok {
		return
	}

	// Verify lesson exists
	var lesson entity.Lesson
	if err := database.DB.First(&lesson, lessonUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Lesson not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Verify enrollment exists
	var enrollment entity.Enrollment
	if err := database.DB.First(&enrollment, enrollmentUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Enrollment not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Check if already checked in for this lesson
	var existingAttendance entity.LessonAttendance
	err := database.DB.Where("lesson_uid = ? AND enrollment_uid = ?", lessonUid, enrollmentUid).
		First(&existingAttendance).Error

	if err == nil {
		// Record already exists
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Already checked in for this lesson",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	attendanceStatus := entity.AttendancePresent
	if !lesson.StartTime.IsZero() && time.Now().After(lesson.StartTime) {
		attendanceStatus = entity.AttendanceLate
	}

	var encryptedNote string
	if req.Note != "" {
		encNote, err := utils.Encrypt(req.Note)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to encrypt attendance note",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		encryptedNote = encNote
	}

	// Create attendance record
	attendance := entity.LessonAttendance{
		LessonUid:     lessonUid,
		EnrollmentUid: enrollmentUid,
		Status:        attendanceStatus,
		Note:          encryptedNote,
	}

	if err := database.DB.Create(&attendance).Error; err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Already checked in for this lesson",
				"data":    nil,
				"error":   nil,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to record attendance",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	attendance.Note, _ = utils.Decrypt(attendance.Note)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Attendance recorded successfully",
		"data":    attendance,
		"error":   nil,
	})
}

// @Summary      Get all attendances for a lesson (Super Admin / Admin)
// @Description  Retrieve all attendance records for a specific lesson. Requires Super Admin or Admin.
// @Tags         Lesson Attendance
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        lesson_id  path  string  true  "Lesson UID"
// @Success      200  {object}  map[string]any  "Attendances retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin or Admin only"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve attendances"
// @Router       /lessons/attendances/lesson/{lesson_id} [get]
func GetLessonAttendancesFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if !hasAdminAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	lessonUid, ok := resolveUIDParam(c, "lessons", "lesson_id", "lesson")
	if !ok {
		return
	}

	var attendances []entity.LessonAttendance
	if err := database.DB.Where("lesson_uid = ?", lessonUid).
		Find(&attendances).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve attendances",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	for i := range attendances {
		attendances[i].Note, _ = utils.Decrypt(attendances[i].Note)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Attendances retrieved successfully",
		"data":    attendances,
		"error":   nil,
	})
}

// @Summary      Get attendance by ID (Super Admin / Admin)
// @Description  Retrieve a specific attendance record by ID. Requires Super Admin or Admin.
// @Tags         Lesson Attendance
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Attendance UID"
// @Success      200  {object}  map[string]any  "Attendance retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin or Admin only"
// @Failure      404  {object}  map[string]any  "User or attendance not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve attendance"
// @Router       /lessons/attendances/{id} [get]
func GetAttendanceByIDFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if !hasAdminAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	attendanceID, ok := resolveUIDParam(c, "lesson_attendances", "id", "attendance")
	if !ok {
		return
	}

	var attendance entity.LessonAttendance
	if err := database.DB.Preload("Lesson").Preload("Enrollment").First(&attendance, attendanceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Attendance not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	attendance.Note, _ = utils.Decrypt(attendance.Note)
	applyCalculatedEnrollmentProgressPtr(attendance.Enrollment)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Attendance retrieved successfully",
		"data":    attendance,
		"error":   nil,
	})
}

// @Summary      Update attendance status and note (Super Admin / Admin)
// @Description  Update attendance status and note. Requires Super Admin or Admin. Can only update status and note, not lesson/enrollment.
// @Tags         Lesson Attendance
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path  string  true  "Attendance UID"
// @Param        request  body  dto.LessonAttendanceUpdateRequest  true  "Updated attendance data"
// @Success      200  {object}  map[string]any  "Attendance updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin or Admin only"
// @Failure      404  {object}  map[string]any  "Attendance or user not found"
// @Failure      500  {object}  map[string]any  "Failed to update attendance"
// @Router       /lessons/attendances/{id} [put]
func UpdateAttendanceFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if !hasAdminAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	attendanceID, ok := resolveUIDParam(c, "lesson_attendances", "id", "attendance")
	if !ok {
		return
	}

	var attendance entity.LessonAttendance
	if err := database.DB.First(&attendance, attendanceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Attendance not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var req dto.LessonAttendanceUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Update fields if provided
	if req.Status != "" {
		attendance.Status = entity.AttendanceStatus(req.Status)
	}
	if req.Note != "" {
		encNote, err := utils.Encrypt(req.Note)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to encrypt attendance note",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		attendance.Note = encNote
	}

	if err := database.DB.Save(&attendance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update attendance",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	attendance.Note, _ = utils.Decrypt(attendance.Note)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Attendance updated successfully",
		"data":    attendance,
		"error":   nil,
	})
}

// @Summary      Delete attendance record (Super Admin / Admin)
// @Description  Delete an attendance record by ID. Requires Super Admin or Admin.
// @Tags         Lesson Attendance
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Attendance UID"
// @Success      200  {object}  map[string]any  "Attendance deleted successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin or Admin only"
// @Failure      404  {object}  map[string]any  "Attendance not found"
// @Failure      500  {object}  map[string]any  "Failed to delete attendance"
// @Router       /lessons/attendances/{id} [delete]
func DeleteAttendanceFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if !hasAdminAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	attendanceID, ok := resolveUIDParam(c, "lesson_attendances", "id", "attendance")
	if !ok {
		return
	}

	if err := database.DB.Delete(&entity.LessonAttendance{}, attendanceID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete attendance",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Attendance deleted successfully",
		"data":    nil,
		"error":   nil,
	})
}

// @Summary      Check student attendance status for a lesson (Student Only)
// @Description  Check if student has already checked in for a specific lesson.
// @Tags         Lesson Attendance
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        lesson_id     query  string  true  "Lesson UID"
// @Param        enrollment_id query  string  true  "Enrollment UID"
// @Success      200  {object}  map[string]any  "Attendance status retrieved"
// @Failure      400  {object}  map[string]any  "Invalid request parameters"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "No attendance record found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve attendance status"
// @Router       /lessons/attendances/check-status [get]
func CheckAttendanceStatusFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	lessonIDStr := c.Query("lesson_id")
	enrollmentIDStr := c.Query("enrollment_id")

	if lessonIDStr == "" || enrollmentIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Missing required query parameters: lesson_id and enrollment_id",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	lessonUid, ok := resolveUIDValue(c, "lessons", lessonIDStr, "lesson")
	if !ok {
		return
	}

	enrollmentUid, ok := resolveUIDValue(c, "enrollments", enrollmentIDStr, "enrollment")
	if !ok {
		return
	}

	var attendance entity.LessonAttendance
	err := database.DB.Where("lesson_uid = ? AND enrollment_uid = ?", lessonUid, enrollmentUid).
		Preload("Lesson").
		Preload("Enrollment").
		First(&attendance).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "No attendance record found for this lesson",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	attendance.Note, _ = utils.Decrypt(attendance.Note)
	applyCalculatedEnrollmentProgressPtr(attendance.Enrollment)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Attendance status retrieved successfully",
		"data":    attendance,
		"error":   nil,
	})
}

// @Summary      Get student attendance history (Student Only)
// @Description  Get all attendance records for a student based on their enrollments.
// @Tags         Lesson Attendance
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        enrollment_id query  string  false  "Filter by enrollment UID"
// @Success      200  {object}  map[string]any  "Attendance history retrieved"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      500  {object}  map[string]any  "Failed to retrieve attendance history"
// @Router       /lessons/attendances/my-history [get]
func GetMyAttendanceHistoryFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Get all enrollments for this user
	var enrollments []entity.Enrollment
	query := database.DB.Where("user_uid = ?", userID)

	enrollmentIDStr := c.Query("enrollment_id")
	if enrollmentIDStr != "" {
		if enrollmentUid, err := database.ResolveUID("enrollments", enrollmentIDStr); err == nil {
			query = query.Where("uid = ?", enrollmentUid)
		}
	}

	if err := query.Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve enrollments",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if len(enrollments) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "No enrollment found for this student",
			"data":    []entity.LessonAttendance{},
			"error":   nil,
		})
		return
	}

	var enrollmentUids []uuid.UUID
	for _, enrollment := range enrollments {
		enrollmentUids = append(enrollmentUids, enrollment.Uid)
	}

	var attendances []entity.LessonAttendance
	if err := database.DB.Where("enrollment_uid IN ?", enrollmentUids).
		Preload("Lesson").
		Preload("Enrollment").
		Order("created_at DESC").
		Find(&attendances).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve attendance history",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	for i := range attendances {
		attendances[i].Note, _ = utils.Decrypt(attendances[i].Note)
	}
	applyCalculatedEnrollmentProgressToAttendances(attendances, enrollments)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Attendance history retrieved successfully",
		"data":    attendances,
		"error":   nil,
	})
}
