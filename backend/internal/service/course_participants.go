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
	"gorm.io/gorm/clause"
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
	search := strings.TrimSpace(c.Query("search"))

	// Ambil student yang BELUM terdaftar di kursus ini secara bertahap.
	subQuery := database.DB.Table("enrollments").Select("user_uid").Where("course_uid = ? AND user_uid IS NOT NULL", course.Uid)
	baseQuery := database.DB.Model(&entity.User{}).Where("role = ? AND uid NOT IN (?)", entity.StudentRole, subQuery)

	var total int64
	var students []entity.User

	if search != "" {
		var allCandidates []entity.User
		if err := baseQuery.
			Preload("Enrollments", func(db *gorm.DB) *gorm.DB {
				return db.Order("enrolled_at DESC")
			}).
			Preload("Enrollments.Course").
			Order("created_at DESC").
			Find(&allCandidates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve candidate students",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		searchLower := strings.ToLower(search)
		filtered := make([]entity.User, 0, len(allCandidates))
		for _, u := range allCandidates {
			nameDecrypted, _ := utils.Decrypt(u.Name)
			emailDecrypted, _ := utils.Decrypt(u.Email)
			if strings.Contains(strings.ToLower(nameDecrypted), searchLower) || strings.Contains(strings.ToLower(emailDecrypted), searchLower) {
				filtered = append(filtered, u)
			}
		}

		total = int64(len(filtered))
		startIndex := (page - 1) * perPage
		if startIndex > len(filtered) {
			startIndex = len(filtered)
		}
		endIndex := startIndex + perPage
		if endIndex > len(filtered) {
			endIndex = len(filtered)
		}
		students = filtered[startIndex:endIndex]
	} else {
		if err := baseQuery.Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to count candidate students", "data": nil, "error": err.Error()})
			return
		}

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

	var req dto.AddCourseParticipantsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "data": nil, "error": err.Error()})
		return
	}

	rawUIDs := make([]string, 0, len(req.StudentUids)+len(req.UserUids))
	for _, uid := range append(req.StudentUids, req.UserUids...) {
		if uid = strings.TrimSpace(uid); uid != "" {
			rawUIDs = append(rawUIDs, uid)
		}
	}
	if len(rawUIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Pilih minimal satu siswa untuk diundang.", "data": nil, "error": "student_uids or user_uids cannot be empty"})
		return
	}

	resolvedUIDs, err := database.ResolveUIDs("users", rawUIDs)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Gagal menemukan data siswa.", "data": nil, "error": err.Error()})
		return
	}
	uniqueUIDs := make([]uuid.UUID, 0, len(resolvedUIDs))
	seenUIDs := make(map[uuid.UUID]struct{}, len(resolvedUIDs))
	for _, uid := range resolvedUIDs {
		if _, exists := seenUIDs[uid]; !exists {
			seenUIDs[uid] = struct{}{}
			uniqueUIDs = append(uniqueUIDs, uid)
		}
	}

	var students []entity.User
	if err := database.DB.Where("uid IN ? AND role = ?", uniqueUIDs, entity.StudentRole).Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal mengambil data siswa.", "data": nil, "error": err.Error()})
		return
	}
	if len(students) != len(uniqueUIDs) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Semua pengguna yang dipilih harus memiliki role student.", "data": nil, "error": "Invalid student selection"})
		return
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal memulai transaksi.", "data": nil, "error": tx.Error.Error()})
		return
	}
	var course entity.Course
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&course, courseUID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Course not found", "data": nil, "error": err.Error()})
		return
	}

	var existing []entity.Enrollment
	if err := tx.Where("course_uid = ? AND user_uid IN ?", courseUID, uniqueUIDs).Find(&existing).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal memeriksa pendaftaran siswa.", "data": nil, "error": err.Error()})
		return
	}
	existingUIDs := make(map[uuid.UUID]struct{}, len(existing))
	for _, enrollment := range existing {
		existingUIDs[enrollment.UserUid] = struct{}{}
	}

	newEnrollments := make([]entity.Enrollment, 0, len(students))
	addedUIDs := make([]string, 0, len(students))
	for _, student := range students {
		if _, alreadyEnrolled := existingUIDs[student.Uid]; alreadyEnrolled {
			continue
		}
		newEnrollments = append(newEnrollments, entity.Enrollment{
			UserUid: student.Uid, CourseUid: course.Uid, Status: entity.EnrollmentActive,
		})
		addedUIDs = append(addedUIDs, student.Uid.String())
	}

	if course.Slot > 0 && len(newEnrollments) > 0 {
		var enrolledCount int64
		if err := tx.Table("enrollments e").Joins("JOIN users u ON u.uid = e.user_uid").
			Where("e.course_uid = ? AND u.role = ?", course.Uid, entity.StudentRole).Count(&enrolledCount).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal memeriksa kuota kursus.", "data": nil, "error": err.Error()})
			return
		}
		if enrolledCount+int64(len(newEnrollments)) > int64(course.Slot) {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"success": false, "message": fmt.Sprintf("Kuota kursus hanya tersisa %d tempat.", int64(course.Slot)-enrolledCount), "data": nil, "error": "Course capacity exceeded"})
			return
		}
	}

	if len(newEnrollments) == 0 {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Semua siswa yang dipilih sudah terdaftar di kursus ini.", "data": nil, "error": "Students already enrolled"})
		return
	}
	if err := tx.Create(&newEnrollments).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal mengundang siswa ke kursus.", "data": nil, "error": err.Error()})
		return
	}
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menyimpan undangan siswa.", "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": fmt.Sprintf("Berhasil mengundang %d siswa ke kursus.", len(addedUIDs)),
		"data": dto.AddCourseParticipantsResponse{
			CourseUid: course.Uid.String(), AddedCount: len(addedUIDs),
			SkippedCount: len(uniqueUIDs) - len(addedUIDs), AddedUids: addedUIDs,
		},
		"error": nil,
	})
}
