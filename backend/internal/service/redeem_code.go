package service

import (
	"crypto/rand"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	validCodeRegex  = regexp.MustCompile(`^[A-Za-z0-9_\-]+$`)
	validEmailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
)

func generateRandomRedeemCode(prefix string) (string, error) {
	cleanPrefix := strings.ToUpper(strings.TrimSpace(prefix))
	if cleanPrefix == "" {
		cleanPrefix = "DU"
	}
	cleanPrefix = strings.Trim(cleanPrefix, "-_")

	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // excludes I, O, 0, 1 for legibility
	for attempts := 0; attempts < 10; attempts++ {
		bytes := make([]byte, 8)
		if _, err := rand.Read(bytes); err != nil {
			return "", err
		}
		var part1, part2 strings.Builder
		for i := 0; i < 4; i++ {
			part1.WriteByte(charset[int(bytes[i])%len(charset)])
			part2.WriteByte(charset[int(bytes[i+4])%len(charset)])
		}
		candidate := fmt.Sprintf("%s-%s-%s", cleanPrefix, part1.String(), part2.String())

		var count int64
		database.DB.Model(&entity.RedeemCode{}).Where("UPPER(code) = UPPER(?)", candidate).Count(&count)
		if count == 0 {
			return candidate, nil
		}
	}
	return "", fmt.Errorf("gagal menghasilkan kode redeem unik setelah beberapa percobaan")
}

// @Summary      Redeem course code (Student)
// @Description  Redeem a voucher/token code to enroll into a course. Enforces strict validations (active status, expiration, max usage, target user restrictions, and duplicate enrollment checks).
// @Tags         Student
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dto.RedeemCodeRequest  true  "Redeem code request body"
// @Success      200      {object}  map[string]any         "Course code successfully redeemed"
// @Failure      400      {object}  map[string]any         "Invalid request, expired code, max usage exceeded, or already enrolled"
// @Failure      401      {object}  map[string]any         "Unauthorized"
// @Failure      403      {object}  map[string]any         "Access denied: Not targeted for this user or students only"
// @Failure      404      {object}  map[string]any         "Redeem code or course not found"
// @Failure      500      {object}  map[string]any         "Internal server error"
// @Router       /students/redeem [post]
func RedeemCourseCodeFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	if user.Role != entity.StudentRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Akses ditolak: Hanya siswa yang dapat menggunakan kode redeem",
			"data":    nil,
			"error":   "Forbidden access",
		})
		return
	}

	if !user.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Akun Anda belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
			"data":    nil,
			"error":   "Account not verified",
		})
		return
	}

	var req dto.RedeemCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Format kode tidak valid. Pastikan kode diisi dengan benar (4-64 karakter).",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	cleanedCode := strings.TrimSpace(req.Code)
	if len(cleanedCode) < 4 || len(cleanedCode) > 64 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Panjang kode redeem harus antara 4 hingga 64 karakter.",
			"data":    nil,
			"error":   "Invalid code length",
		})
		return
	}

	if !validCodeRegex.MatchString(cleanedCode) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Kode redeem hanya boleh berisi huruf, angka, tanda strip (-), atau garis bawah (_).",
			"data":    nil,
			"error":   "Invalid characters in code",
		})
		return
	}

	var redeemCode entity.RedeemCode
	// Pencarian case-insensitive (UPPER)
	err := database.DB.Where("UPPER(code) = UPPER(?)", cleanedCode).First(&redeemCode).Error
	if err != nil || redeemCode.Uid == uuid.Nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Kode redeem tidak ditemukan atau salah. Periksa kembali kode Anda.",
			"data":    nil,
			"error":   "Code not found",
		})
		return
	}

	// 1. Validasi Status Aktif
	if !redeemCode.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Kode redeem ini sudah tidak aktif atau dinonaktifkan.",
			"data":    nil,
			"error":   "Code inactive",
		})
		return
	}

	// 2. Validasi Kedaluwarsa (Expiration)
	if redeemCode.ExpiresAt != nil && time.Now().After(*redeemCode.ExpiresAt) {
		formattedExpiry := redeemCode.ExpiresAt.Format("02 Jan 2006 15:04 WIB")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": fmt.Sprintf("Kode redeem telah kedaluwarsa pada %s.", formattedExpiry),
			"data":    nil,
			"error":   "Code expired",
		})
		return
	}

	// 3. Validasi Kuota Maksimal Penggunaan
	if redeemCode.MaxUses > 0 && redeemCode.UsedCount >= redeemCode.MaxUses {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Kode redeem telah mencapai kuota penggunaan maksimal.",
			"data":    nil,
			"error":   "Max usage exceeded",
		})
		return
	}

	// 4. Validasi Target Email (Jika kode voucher ditujukan untuk email tertentu, user belum tentu terdaftar saat kode dibuat)
	if redeemCode.TargetEmail != "" {
		trimmedTargetEmail := strings.TrimSpace(redeemCode.TargetEmail)
		trimmedUserEmail := strings.TrimSpace(user.Email)
		if !strings.EqualFold(trimmedUserEmail, trimmedTargetEmail) {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": fmt.Sprintf("Akses ditolak: Kode redeem ini khusus ditujukan untuk alamat email %s. Silakan masuk menggunakan akun yang sesuai.", trimmedTargetEmail),
				"data":    nil,
				"error":   "Target email mismatch",
			})
			return
		}
	}

	// 5. Validasi Kursus Terkait
	var course entity.Course
	if err := database.DB.First(&course, redeemCode.CourseUid).Error; err != nil || course.Uid == uuid.Nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Kursus yang terhubung dengan kode redeem ini tidak ditemukan.",
			"data":    nil,
			"error":   "Course not found",
		})
		return
	}

	if !course.IsPublished {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Kursus untuk kode redeem ini belum dipublikasikan.",
			"data":    nil,
			"error":   "Course not published",
		})
		return
	}

	// 6. Validasi Penggunaan Berulang oleh User yang Sama
	var existingUsage entity.RedeemCodeUsage
	if err := database.DB.Where("redeem_code_uid = ? AND user_uid = ?", redeemCode.Uid, user.Uid).First(&existingUsage).Error; err == nil && existingUsage.Uid != uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Anda sudah pernah menggunakan kode redeem ini sebelumnya.",
			"data":    nil,
			"error":   "Already used by user",
		})
		return
	}

	// 7. Validasi Apakah User Sudah Terdaftar di Kursus Ini
	var existingEnrollment entity.Enrollment
	errEnrollment := database.DB.Where(
		"user_uid = ? AND course_uid = ? AND status IN ?",
		user.Uid,
		course.Uid,
		[]entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted},
	).First(&existingEnrollment).Error

	if errEnrollment == nil && existingEnrollment.Uid != uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": fmt.Sprintf("Anda sudah terdaftar aktif dalam kursus \"%s\".", course.Title),
			"data":    nil,
			"error":   "Already enrolled",
		})
		return
	}

	// 8. Eksekusi Transaksi Database (Atomic)
	tx := database.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memulai transaksi data.",
			"data":    nil,
			"error":   tx.Error.Error(),
		})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Increment UsedCount pada RedeemCode
	if err := tx.Model(&entity.RedeemCode{}).
		Where("uid = ?", redeemCode.Uid).
		Update("used_count", gorm.Expr("used_count + 1")).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memperbarui kuota penggunaan kode redeem.",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Catat riwayat penggunaan kode redeem
	usageRecord := entity.RedeemCodeUsage{
		RedeemCodeUid: redeemCode.Uid,
		UserUid:       user.Uid,
		CourseUid:     course.Uid,
		RedeemedAt:    time.Now(),
	}
	if err := tx.Create(&usageRecord).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mencatat riwayat penggunaan kode redeem.",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Buat atau aktifkan pendaftaran kursus (Enrollment)
	var activeEnrollment entity.Enrollment
	if err := tx.Where("user_uid = ? AND course_uid = ?", user.Uid, course.Uid).First(&activeEnrollment).Error; err == nil && activeEnrollment.Uid != uuid.Nil {
		activeEnrollment.Status = entity.EnrollmentActive
		activeEnrollment.EnrolledAt = time.Now()
		if err := tx.Save(&activeEnrollment).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Gagal memperbarui status pendaftaran kursus.",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
	} else {
		newEnrollment := entity.Enrollment{
			UserUid:    user.Uid,
			CourseUid:  course.Uid,
			EnrolledAt: time.Now(),
			Progress:   0,
			Status:     entity.EnrollmentActive,
		}
		if err := tx.Create(&newEnrollment).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Gagal mendaftarkan Anda ke dalam kursus.",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		activeEnrollment = newEnrollment
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyelesaikan proses penukaran kode.",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	responseData := dto.RedeemCodeResponse{
		EnrollmentUID: activeEnrollment.Uid.String(),
		RedeemedAt:    usageRecord.RedeemedAt.Format(time.RFC3339),
		Course: dto.RedeemCodeCourseResponse{
			UID:         course.Uid.String(),
			Title:       course.Title,
			Slug:        course.Slug,
			Description: course.Description,
			CoverURL:    course.CoverURL,
			Level:       string(course.Level),
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Selamat! Anda berhasil bergabung ke dalam kursus \"%s\".", course.Title),
		"data":    responseData,
	})
}

// @Summary      Generate redeem code (Admin / Mentor)
// @Description  Create or auto-generate a new course redeem code with custom usage limits, expiration date, and optional target user or email restrictions.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dto.GenerateRedeemCodeRequest  true  "Generate redeem code request payload"
// @Success      201      {object}  map[string]any                 "Redeem code successfully created"
// @Failure      400      {object}  map[string]any                 "Invalid input or parameters"
// @Failure      401      {object}  map[string]any                 "Unauthorized"
// @Failure      403      {object}  map[string]any                 "Access denied: Mentors/Admins only"
// @Failure      404      {object}  map[string]any                 "Course or target user not found"
// @Failure      409      {object}  map[string]any                 "Redeem code already exists"
// @Failure      500      {object}  map[string]any                 "Internal server error"
// @Router       /admin/redeem-codes [post]
func GenerateRedeemCodeFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	if !hasMentorAccess(user.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Akses ditolak: Hanya administrator atau mentor yang dapat membuat kode redeem",
			"data":    nil,
			"error":   "Forbidden access",
		})
		return
	}

	var req dto.GenerateRedeemCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Permintaan tidak valid. Pastikan data terisi dengan benar.",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	courseUUID, err := uuid.Parse(strings.TrimSpace(req.CourseUID))
	if err != nil || courseUUID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Format course_uid tidak valid.",
			"data":    nil,
			"error":   "Invalid course UID",
		})
		return
	}

	var course entity.Course
	if err := database.DB.First(&course, courseUUID).Error; err != nil || course.Uid == uuid.Nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Kursus tidak ditemukan.",
			"data":    nil,
			"error":   "Course not found",
		})
		return
	}

	// Jika pembuat adalah mentor, pastikan mentor berhak mengelola kursus ini
	if user.Role == entity.MentorRole {
		allowed, err := canManageCourseByRole(user, courseUUID)
		if err != nil || !allowed {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Anda tidak memiliki hak akses untuk mengelola kode redeem kursus ini.",
				"data":    nil,
				"error":   "Mentor cannot manage this course",
			})
			return
		}
	}

	// Penentuan Kode: Custom Code atau Auto-Generate
	var finalCode string
	customCode := strings.TrimSpace(req.Code)
	if customCode != "" {
		if len(customCode) < 4 || len(customCode) > 64 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Panjang kode redeem kustom harus antara 4 hingga 64 karakter.",
				"data":    nil,
				"error":   "Invalid code length",
			})
			return
		}

		if !validCodeRegex.MatchString(customCode) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Kode kustom hanya boleh berisi huruf, angka, tanda strip (-), atau garis bawah (_).",
				"data":    nil,
				"error":   "Invalid characters in code",
			})
			return
		}

		finalCode = strings.ToUpper(customCode)
		var existing entity.RedeemCode
		if err := database.DB.Where("UPPER(code) = UPPER(?)", finalCode).First(&existing).Error; err == nil && existing.Uid != uuid.Nil {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": fmt.Sprintf("Kode redeem \"%s\" sudah digunakan. Silakan gunakan kode lain.", finalCode),
				"data":    nil,
				"error":   "Code already exists",
			})
			return
		}
	} else {
		generated, err := generateRandomRedeemCode(req.Prefix)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Gagal menghasilkan kode unik otomatis.",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		finalCode = generated
	}

	// Validasi target email jika diberikan (TIDAK mewajibkan user sudah terdaftar di sistem)
	targetEmail := strings.ToLower(strings.TrimSpace(req.TargetEmail))
	if targetEmail != "" {
		if !validEmailRegex.MatchString(targetEmail) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Format target_email tidak valid. Pastikan format email sudah benar.",
				"data":    nil,
				"error":   "Invalid target email format",
			})
			return
		}
	}

	maxUses := req.MaxUses
	if maxUses <= 0 {
		maxUses = 1
	}

	if req.ExpiresAt != nil && req.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Tanggal kedaluwarsa harus berada di masa depan.",
			"data":    nil,
			"error":   "ExpiresAt must be in the future",
		})
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	newRedeemCode := entity.RedeemCode{
		Code:         finalCode,
		CourseUid:    courseUUID,
		TargetEmail:  targetEmail,
		MaxUses:      maxUses,
		UsedCount:    0,
		IsActive:     isActive,
		ExpiresAt:    req.ExpiresAt,
		CreatedByUid: &user.Uid,
	}

	if err := database.DB.Create(&newRedeemCode).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan kode redeem ke database.",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var formattedExpiry *string
	if newRedeemCode.ExpiresAt != nil {
		str := newRedeemCode.ExpiresAt.Format(time.RFC3339)
		formattedExpiry = &str
	}

	response := dto.GenerateRedeemCodeResponse{
		UID:          newRedeemCode.Uid.String(),
		Code:         newRedeemCode.Code,
		CourseUID:    course.Uid.String(),
		CourseTitle:  course.Title,
		TargetEmail:  newRedeemCode.TargetEmail,
		MaxUses:      newRedeemCode.MaxUses,
		UsedCount:    newRedeemCode.UsedCount,
		IsActive:     newRedeemCode.IsActive,
		ExpiresAt:    formattedExpiry,
		CreatedByUID: user.Uid.String(),
		CreatedAt:    newRedeemCode.CreatedAt.Format(time.RFC3339),
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Kode redeem berhasil dibuat.",
		"data":    response,
	})
}

// @Summary      List redeem codes (Admin / Mentor)
// @Description  Retrieve a paginated list of generated redeem codes with optional filters for course and active status.
// @Tags         Admin
// @Produce      json
// @Security     BearerAuth
// @Param        course_uid query  string  false  "Filter by course UID"
// @Param        is_active  query  bool    false  "Filter by active status"
// @Param        page       query  int     false  "Page number (default: 1)"
// @Param        per_page   query  int     false  "Items per page (default: 10, max: 100)"
// @Success      200        {object}  map[string]any  "List of redeem codes retrieved successfully"
// @Failure      401        {object}  map[string]any  "Unauthorized"
// @Failure      403        {object}  map[string]any  "Access denied: Mentors/Admins only"
// @Failure      500        {object}  map[string]any  "Internal server error"
// @Router       /admin/redeem-codes [get]
func ListRedeemCodesFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	if !hasMentorAccess(user.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Akses ditolak: Hanya administrator atau mentor yang dapat melihat daftar kode redeem",
			"data":    nil,
			"error":   "Forbidden access",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}
	if perPage > 100 {
		perPage = 100
	}
	offset := (page - 1) * perPage

	query := database.DB.Model(&entity.RedeemCode{}).Preload("Course")

	// Filter per course jika diminta
	courseUIDParam := strings.TrimSpace(c.Query("course_uid"))
	if courseUIDParam != "" {
		if courseUID, err := uuid.Parse(courseUIDParam); err == nil && courseUID != uuid.Nil {
			query = query.Where("course_uid = ?", courseUID)
		}
	}

	// Filter is_active
	if isActiveParam := c.Query("is_active"); isActiveParam != "" {
		if isActive, err := strconv.ParseBool(isActiveParam); err == nil {
			query = query.Where("is_active = ?", isActive)
		}
	}

	// Jika mentor, batasi hanya kursus yang diajar jika bukan admin
	if user.Role == entity.MentorRole {
		query = query.Where("course_uid IN (SELECT course_uid FROM course_mentors WHERE mentor_uid = ?)", user.Uid)
	}

	var total int64
	query.Count(&total)

	var redeemCodes []entity.RedeemCode
	if err := query.Order("created_at DESC").Limit(perPage).Offset(offset).Find(&redeemCodes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil daftar kode redeem.",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	items := make([]dto.GenerateRedeemCodeResponse, 0, len(redeemCodes))
	for _, rc := range redeemCodes {
		var courseTitle string
		if rc.Course != nil {
			courseTitle = rc.Course.Title
		}

		var formattedExpiry *string
		if rc.ExpiresAt != nil {
			str := rc.ExpiresAt.Format(time.RFC3339)
			formattedExpiry = &str
		}

		var createdByUIDStr string
		if rc.CreatedByUid != nil {
			createdByUIDStr = rc.CreatedByUid.String()
		}

		items = append(items, dto.GenerateRedeemCodeResponse{
			UID:          rc.Uid.String(),
			Code:         rc.Code,
			CourseUID:    rc.CourseUid.String(),
			CourseTitle:  courseTitle,
			TargetEmail:  rc.TargetEmail,
			MaxUses:      rc.MaxUses,
			UsedCount:    rc.UsedCount,
			IsActive:     rc.IsActive,
			ExpiresAt:    formattedExpiry,
			CreatedByUID: createdByUIDStr,
			CreatedAt:    rc.CreatedAt.Format(time.RFC3339),
		})
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Daftar kode redeem berhasil dimuat.",
		"data": gin.H{
			"items": items,
			"meta": gin.H{
				"current_page": page,
				"per_page":     perPage,
				"total":        total,
				"total_pages":  totalPages,
			},
		},
	})
}
