package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
)

// buildReadingSet mengembalikan set lesson UID yang sudah dibaca oleh user
// (via enrollment) dalam satu query batch. Fungsi ini dipakai oleh GetAllLessonsFunc
// dan GetLessonByIDFunc agar respons lesson menyertakan field `is_reading`.
//
// Jika user tidak punya enrollment (misal admin/mentor), fungsi mengembalikan
// set kosong tanpa error.
func buildReadingSet(userUID uuid.UUID, lessonUIDs []uuid.UUID) map[uuid.UUID]bool {
	readSet := make(map[uuid.UUID]bool, len(lessonUIDs))
	if len(lessonUIDs) == 0 {
		return readSet
	}

	// Ambil semua enrollment_uid milik user ini
	var enrollmentUIDs []uuid.UUID
	database.DB.Model(&entity.Enrollment{}).
		Where("user_uid = ?", userUID).
		Pluck("uid", &enrollmentUIDs)
	if len(enrollmentUIDs) == 0 {
		return readSet
	}

	// Query satu kali: semua reading record untuk lesson yang diminta
	var readings []entity.LessonReading
	database.DB.
		Where("lesson_uid IN ? AND enrollment_uid IN ?", lessonUIDs, enrollmentUIDs).
		Find(&readings)

	for _, r := range readings {
		readSet[r.LessonUid] = true
	}
	return readSet
}

// toLessonResponseList mengonversi slice lesson + readSet menjadi slice LessonResponse.
func toLessonResponseList(lessons []entity.Lesson, readSet map[uuid.UUID]bool) []dto.LessonResponse {
	out := make([]dto.LessonResponse, len(lessons))
	for i, l := range lessons {
		out[i] = dto.NewLessonResponse(l, readSet[l.Uid])
	}
	return out
}

// @Summary      Mark lesson as read (Enrolled Student/Admin/Mentor)
// @Description  Mark a lesson as read (is_reading) for the authenticated user's enrollment.
//
//	A user can only have one reading record per lesson (idempotent — calling it
//	again returns the existing record without error).
//
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Lesson UID"
// @Success      200  {object}  map[string]any  "Lesson already marked as read (existing record returned)"
// @Success      201  {object}  map[string]any  "Lesson marked as read successfully"
// @Failure      400  {object}  map[string]any  "Invalid lesson uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: must be enrolled in the course"
// @Failure      404  {object}  map[string]any  "Lesson or user not found"
// @Failure      500  {object}  map[string]any  "Failed to mark lesson as read"
// @Router       /lessons/{id}/read [post]
func MarkLessonAsReadFunc(c *gin.Context) {
	userIDRaw, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userIDRaw).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	lessonUID, ok := resolveUIDParam(c, "lessons", "id", "lesson")
	if !ok {
		return
	}

	// Pastikan lesson ada
	var lesson entity.Lesson
	if err := database.DB.First(&lesson, lessonUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Lesson not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Ambil module → course agar bisa validasi enrollment
	var module entity.Module
	if err := database.DB.First(&module, lesson.ModuleUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Module not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Admin & mentor tetap boleh, tapi tidak dicatat sebagai reading
	// (mereka tidak punya enrollment). Student wajib punya enrollment.
	isAdminOrMentor := hasAdminAccess(userData.Role) || userData.Role == entity.MentorRole

	var enrollment entity.Enrollment
	if !isAdminOrMentor {
		// Cari enrollment aktif/completed untuk course ini
		err := database.DB.
			Where("user_uid = ? AND course_uid = ? AND status IN ?",
				userData.Uid,
				module.CourseUid,
				[]entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted},
			).
			First(&enrollment).Error
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Access denied: you must be enrolled in this course to mark lessons as read",
				"data":    nil,
				"error":   nil,
			})
			return
		}
	} else {
		// Admin/Mentor: kembalikan 200 tanpa membuat record
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Lesson reading not tracked for admin/mentor role",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Cek apakah sudah pernah dibaca (idempotent)
	var existing entity.LessonReading
	err := database.DB.
		Where("lesson_uid = ? AND enrollment_uid = ?", lessonUID, enrollment.Uid).
		First(&existing).Error

	if err == nil {
		// Sudah ada — kembalikan record yang ada
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Lesson already marked as read",
			"data":    existing,
			"error":   nil,
		})
		return
	}

	// Buat record baru
	reading := entity.LessonReading{
		LessonUid:     lessonUID,
		EnrollmentUid: enrollment.Uid,
		ReadAt:        time.Now(),
	}

	if err := database.DB.Create(&reading).Error; err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			// Race condition: record dibuat bersamaan, kembalikan yang sudah ada
			_ = database.DB.
				Where("lesson_uid = ? AND enrollment_uid = ?", lessonUID, enrollment.Uid).
				First(&existing).Error
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Lesson already marked as read",
				"data":    existing,
				"error":   nil,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to mark lesson as read",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Lesson marked as read successfully",
		"data":    reading,
		"error":   nil,
	})
}

// @Summary      Get lesson reading status for the authenticated user (Enrolled Student)
// @Description  Returns whether the authenticated user has read a specific lesson.
//
//	Query param `enrollment_id` is optional — if omitted the handler auto-resolves
//	the user's active/completed enrollment for the lesson's course.
//
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id             path   string  true   "Lesson UID"
// @Param        enrollment_id  query  string  false  "Enrollment UID (optional, auto-resolved if omitted)"
// @Success      200  {object}  map[string]any  "Reading status retrieved"
// @Failure      400  {object}  map[string]any  "Invalid lesson uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Lesson or user not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve reading status"
// @Router       /lessons/{id}/read [get]
func GetLessonReadingStatusFunc(c *gin.Context) {
	userIDRaw, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userIDRaw).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	lessonUID, ok := resolveUIDParam(c, "lessons", "id", "lesson")
	if !ok {
		return
	}

	// Pastikan lesson ada
	var lesson entity.Lesson
	if err := database.DB.First(&lesson, lessonUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Lesson not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Admin & mentor: boleh lihat status tanpa enrollment
	if hasAdminAccess(userData.Role) || userData.Role == entity.MentorRole {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Reading status not tracked for admin/mentor role",
			"data": gin.H{
				"is_read": false,
				"reading": nil,
			},
			"error": nil,
		})
		return
	}

	// Resolusi enrollment
	var enrollmentUID uuid.UUID

	enrollmentIDStr := c.Query("enrollment_id")
	if enrollmentIDStr != "" {
		enrollmentUID, ok = resolveUIDValue(c, "enrollments", enrollmentIDStr, "enrollment")
		if !ok {
			return
		}
	} else {
		// Auto-resolve: ambil module → course, lalu cari enrollment user
		var module entity.Module
		if err := database.DB.First(&module, lesson.ModuleUid).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Module not found",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		var enrollment entity.Enrollment
		err := database.DB.
			Where("user_uid = ? AND course_uid = ? AND status IN ?",
				userData.Uid,
				module.CourseUid,
				[]entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted},
			).
			First(&enrollment).Error
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Access denied: you must be enrolled in this course",
				"data":    nil,
				"error":   nil,
			})
			return
		}
		enrollmentUID = enrollment.Uid
	}

	var reading entity.LessonReading
	err := database.DB.
		Where("lesson_uid = ? AND enrollment_uid = ?", lessonUID, enrollmentUID).
		First(&reading).Error

	if err != nil {
		// Belum dibaca
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Lesson reading status retrieved",
			"data": gin.H{
				"is_read": false,
				"reading": nil,
			},
			"error": nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lesson reading status retrieved",
		"data": gin.H{
			"is_read": true,
			"reading": reading,
		},
		"error": nil,
	})
}

// @Summary      Get all reading records for a lesson (Admin/Mentor)
// @Description  Retrieve all users who have read a specific lesson. Requires Admin, Super Admin, or assigned Mentor.
// @Tags         Lesson Reading
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        lesson_id  path  string  true  "Lesson UID"
// @Success      200  {object}  map[string]any  "Lesson readings retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Lesson not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve lesson readings"
// @Router       /lessons/readings/lesson/{lesson_id} [get]
func GetLessonReadingsByLessonFunc(c *gin.Context) {
	userData, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	lessonUID, ok := resolveUIDParam(c, "lessons", "lesson_id", "lesson")
	if !ok {
		return
	}

	var lesson entity.Lesson
	if err := database.DB.First(&lesson, lessonUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Lesson not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var module entity.Module
	if err := database.DB.First(&module, lesson.ModuleUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Module not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Hanya admin atau mentor yang ditugaskan ke course ini
	allowed, err := canManageCourseByRole(userData, module.CourseUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to validate access",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Admin or assigned mentor only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var readings []entity.LessonReading
	if err := database.DB.
		Where("lesson_uid = ?", lessonUID).
		Preload("Enrollment").
		Order("read_at ASC").
		Find(&readings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve lesson readings",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lesson readings retrieved successfully",
		"data":    readings,
		"error":   nil,
	})
}

// @Summary      Get my lesson reading history (Enrolled Student)
// @Description  Get all lessons that the authenticated user has read, optionally filtered by enrollment.
// @Tags         Lesson Reading
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        enrollment_id  query  string  false  "Filter by enrollment UID"
// @Success      200  {object}  map[string]any  "Reading history retrieved"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      500  {object}  map[string]any  "Failed to retrieve reading history"
// @Router       /lessons/readings/my-history [get]
func GetMyLessonReadingHistoryFunc(c *gin.Context) {
	userIDRaw, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userIDRaw).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Ambil semua enrollment milik user ini
	var enrollments []entity.Enrollment
	query := database.DB.Where("user_uid = ?", userData.Uid)

	enrollmentIDStr := c.Query("enrollment_id")
	if enrollmentIDStr != "" {
		if enrollmentUID, err := database.ResolveUID("enrollments", enrollmentIDStr); err == nil {
			query = query.Where("uid = ?", enrollmentUID)
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
			"message": "No enrollment found for this user",
			"data":    []entity.LessonReading{},
			"error":   nil,
		})
		return
	}

	var enrollmentUIDs []uuid.UUID
	for _, e := range enrollments {
		enrollmentUIDs = append(enrollmentUIDs, e.Uid)
	}

	var readings []entity.LessonReading
	if err := database.DB.
		Where("enrollment_uid IN ?", enrollmentUIDs).
		Preload("Lesson").
		Preload("Enrollment").
		Order("read_at DESC").
		Find(&readings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve reading history",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Reading history retrieved successfully",
		"data":    readings,
		"error":   nil,
	})
}
