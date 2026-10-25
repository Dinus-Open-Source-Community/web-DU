package service

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func isMentorAssignedToCourse(mentorUID, courseUID uuid.UUID) (bool, error) {
	uids, err := mentorAssignedCourseUIDs(mentorUID)
	if err != nil {
		return false, err
	}
	for _, id := range uids {
		if id == courseUID {
			return true, nil
		}
	}
	return false, nil
}

func authorizeCourseParticipantManager(c *gin.Context, courseUID uuid.UUID) (entity.User, bool) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return entity.User{}, false
	}

	if user.Role != entity.SuperAdminRole && user.Role != entity.AdminRole && user.Role != entity.MentorRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Akses ditolak: hanya Super Admin, Admin, dan Mentor yang dapat mengelola peserta kursus",
			"data":    nil,
			"error":   "forbidden",
		})
		return entity.User{}, false
	}

	if user.Role == entity.MentorRole {
		assigned, err := isMentorAssignedToCourse(user.Uid, courseUID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Gagal memverifikasi akses mentor kursus",
				"data":    nil,
				"error":   err.Error(),
			})
			return entity.User{}, false
		}
		if !assigned {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Akses ditolak: Anda bukan mentor dari kursus ini",
				"data":    nil,
				"error":   "forbidden",
			})
			return entity.User{}, false
		}
	}

	return user, true
}

// GetCourseCandidateStudentsFunc godoc
// @Summary      Get candidate students for a course
// @Description  Mengambil daftar user dengan role student yang belum terdaftar di kursus ini, lengkap dengan data progres dan kursus yang diikuti. (Super Admin, Admin, dan Mentor penanggung jawab).
// @Tags         Courses
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Course UID or prefix"
// @Success      200  {object}  map[string]any  "Candidate students retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin, Admin, or assigned mentor only"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /courses/{id}/candidate-students [get]
func GetCourseCandidateStudentsFunc(c *gin.Context) {
	courseUID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

	if _, ok := authorizeCourseParticipantManager(c, courseUID); !ok {
		return
	}

	var course entity.Course
	if err := database.DB.First(&course, courseUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	// Ambil student yang BELUM terdaftar di kursus ini secara bertahap.
	subQuery := database.DB.Table("enrollments").Select("user_uid").Where("course_uid = ? AND user_uid IS NOT NULL", course.Uid)
	baseQuery := database.DB.Model(&entity.User{}).Where("role = ? AND uid NOT IN (?)", entity.StudentRole, subQuery)
	var total int64
	if err := baseQuery.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to count candidate students", "data": nil, "error": err.Error()})
		return
	}

	var students []entity.User
	if err := baseQuery.
		Preload("Enrollments", func(db *gorm.DB) *gorm.DB {
			return db.Order("enrolled_at DESC")
		}).
		Preload("Enrollments.Course").
		Order("created_at DESC").
		Offset((page - 1) * perPage).Limit(perPage).
		Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve candidate students",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	result := make([]gin.H, 0, len(students))
	for i := range students {
		applyCalculatedEnrollmentProgress(students[i].Enrollments)
		u := students[i]
		nameDecrypted, _ := utils.Decrypt(u.Name)
		emailDecrypted, _ := utils.Decrypt(u.Email)
		result = append(result, gin.H{
			"uid":         u.Uid,
			"name":        nameDecrypted,
			"email":       emailDecrypted,
			"avatar_url":  u.AvatarURL,
			"role":        u.Role,
			"is_verified": u.IsVerified,
			"enrollments": u.Enrollments,
			"created_at":  u.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Candidate students retrieved successfully",
		"data": gin.H{
			"users":        result,
			"total":        total,
			"current_page": page,
			"per_page":     perPage,
			"total_pages":  (total + int64(perPage) - 1) / int64(perPage),
		},
		"error": nil,
	})
}

// AddCourseParticipantsFunc godoc
// @Summary      Add participants to a course
// @Description  Menambahkan satu atau beberapa siswa ke dalam kursus (Enrollment active).
// @Tags         Courses
// @Accept       json
// @Produce      json
// @Param        id    path      string                        true  "Course UID or prefix"
// @Param        body  body      dto.AddCourseParticipantsRequest  true  "List of student UIDs to enroll"
// @Success      201   {object}  map[string]any                "Participants added successfully"
// @Failure      400   {object}  map[string]any                "Invalid request or quota exceeded"
// @Failure      401   {object}  map[string]any                "Unauthorized"
// @Failure      403   {object}  map[string]any                "Access denied: Super Admin, Admin, or assigned mentor only"
// @Failure      404   {object}  map[string]any                "Course not found"
// @Failure      500   {object}  map[string]any                "Internal server error"
// @Router       /courses/{id}/participants [post]
func AddCourseParticipantsFunc(c *gin.Context) {
	courseUID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

	if _, ok := authorizeCourseParticipantManager(c, courseUID); !ok {
		return
	}

	var course entity.Course
	if err := database.DB.First(&course, courseUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var req dto.AddCourseParticipantsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	rawUIDs := make([]string, 0, len(req.StudentUids)+len(req.UserUids))
	for _, u := range req.StudentUids {
		trimmed := strings.TrimSpace(u)
		if trimmed != "" {
			rawUIDs = append(rawUIDs, trimmed)
		}
	}
	for _, u := range req.UserUids {
		trimmed := strings.TrimSpace(u)
		if trimmed != "" {
			rawUIDs = append(rawUIDs, trimmed)
		}
	}

	if len(rawUIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Pilih minimal satu siswa untuk didaftarkan",
			"data":    nil,
			"error":   "student_uids or user_uids cannot be empty",
		})
		return
	}

	resolvedUIDs, err := database.ResolveUIDs("users", rawUIDs)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Gagal menemukan data siswa",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Filter deduplikasi
	uniqueMap := make(map[uuid.UUID]struct{}, len(resolvedUIDs))
	uniqueUIDs := make([]uuid.UUID, 0, len(resolvedUIDs))
	for _, uid := range resolvedUIDs {
		if _, exists := uniqueMap[uid]; !exists {
			uniqueMap[uid] = struct{}{}
			uniqueUIDs = append(uniqueUIDs, uid)
		}
	}

	// Validasi bahwa users adalah siswa
	var students []entity.User
	if err := database.DB.Where("uid IN ? AND role = ?", uniqueUIDs, entity.StudentRole).Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data siswa",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if len(students) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Tidak ada siswa valid yang ditemukan dari daftar yang dipilih",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	validUIDs := make([]uuid.UUID, 0, len(students))
	for _, s := range students {
		validUIDs = append(validUIDs, s.Uid)
	}

	// Cek enrollment yang sudah ada
	var existingEnrollments []entity.Enrollment
	if err := database.DB.Where("course_uid = ? AND user_uid IN ?", course.Uid, validUIDs).Find(&existingEnrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memeriksa status enrollment siswa",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	alreadyEnrolledMap := make(map[uuid.UUID]struct{}, len(existingEnrollments))
	for _, e := range existingEnrollments {
		alreadyEnrolledMap[e.UserUid] = struct{}{}
	}

	toEnroll := make([]entity.User, 0, len(students))
	for _, s := range students {
		if _, enrolled := alreadyEnrolledMap[s.Uid]; !enrolled {
			toEnroll = append(toEnroll, s)
		}
	}

	if len(toEnroll) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Semua siswa yang dipilih sudah terdaftar di kursus ini",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Cek kuota / slot kursus jika diatur (> 0)
	if course.Slot > 0 {
		var currentParticipants int64
		if err := database.DB.Model(&entity.Enrollment{}).Where("course_uid = ?", course.Uid).Count(&currentParticipants).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Gagal menghitung kuota kursus",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		remainingSlots := course.Slot - int(currentParticipants)
		if len(toEnroll) > remainingSlots {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": fmt.Sprintf("Kuota kelas tidak mencukupi. Sisa slot: %d, siswa yang hendak didaftarkan: %d", remainingSlots, len(toEnroll)),
				"data":    nil,
				"error":   "quota exceeded",
			})
			return
		}
	}

	// Buat enrollment dalam transaksi
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	addedUIDs := make([]string, 0, len(toEnroll))
	for _, s := range toEnroll {
		enrollment := entity.Enrollment{
			UserUid:   s.Uid,
			CourseUid: course.Uid,
			Status:    entity.EnrollmentActive,
			Progress:  0,
		}
		if err := tx.Create(&enrollment).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Gagal mendaftarkan peserta ke kursus",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		addedUIDs = append(addedUIDs, s.Uid.String())
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan pendaftaran peserta",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	skippedCount := len(uniqueUIDs) - len(addedUIDs)
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": fmt.Sprintf("Berhasil menambahkan %d peserta ke kursus", len(addedUIDs)),
		"data": dto.AddCourseParticipantsResponse{
			CourseUid:    course.Uid.String(),
			AddedCount:   len(addedUIDs),
			SkippedCount: skippedCount,
			AddedUids:    addedUIDs,
		},
		"error": nil,
	})
}
