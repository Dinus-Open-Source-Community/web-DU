package service

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

// @Summary      Assign mentors to course (Super Admin / Admin)
// @Description  Assign one or more mentors selected by Super Admin or Admin to a course. Course can have multiple mentors.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      string                            true  "Course UID"
// @Param        body  body      dto.AssignMentorsToCourseRequest  true  "Mentor UIDs"
// @Success      200  {object}  map[string]any  "Mentors assigned successfully"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin or Admin only"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /courses/{id}/mentors/assign [post]
func AssignMentorsToCourseFunc(c *gin.Context) {
	adminRaw, exists := c.Get(middleware.UIDCK)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   "user_id not found in context",
		})
		return
	}

	adminUID := adminRaw.(uuid.UUID)
	var admin entity.User
	if err := database.DB.Select("uid", "role").First(&admin, adminUID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if !hasAdminAccess(admin.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	courseUID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

	var course entity.Course
	if err := database.DB.Select("uid", "title", "mentor_uid").First(&course, courseUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var req dto.AssignMentorsToCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	resolvedMentorUIDs, err := database.ResolveUIDs("users", req.MentorUids)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Failed to resolve mentor uids",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	uniqueMentorUIDs := make([]uuid.UUID, 0, len(resolvedMentorUIDs))
	seen := make(map[uuid.UUID]struct{}, len(resolvedMentorUIDs))
	for _, mentorUID := range resolvedMentorUIDs {
		if _, ok := seen[mentorUID]; ok {
			continue
		}
		seen[mentorUID] = struct{}{}
		uniqueMentorUIDs = append(uniqueMentorUIDs, mentorUID)
	}

	if len(uniqueMentorUIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "mentor_uids cannot be empty",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var mentors []entity.User
	if err := database.DB.Where("uid IN ? AND role IN ?", uniqueMentorUIDs, []entity.UserRole{entity.MentorRole, entity.AdminRole}).Find(&mentors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to validate assignees",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if len(mentors) != len(uniqueMentorUIDs) {
		validAssigneeMap := make(map[uuid.UUID]struct{}, len(mentors))
		for _, mentor := range mentors {
			validAssigneeMap[mentor.Uid] = struct{}{}
		}

		missingAssignees := make([]uuid.UUID, 0)
		for _, mentorUID := range uniqueMentorUIDs {
			if _, ok := validAssigneeMap[mentorUID]; !ok {
				missingAssignees = append(missingAssignees, mentorUID)
			}
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Some assignees are invalid. Only mentor/admin roles are allowed",
			"data": gin.H{
				"invalid_mentor_uids": missingAssignees,
			},
			"error": nil,
		})
		return
	}

	now := time.Now()
	assignments := make([]entity.CourseMentor, 0, len(uniqueMentorUIDs))
	for _, mentorUID := range uniqueMentorUIDs {
		assignments = append(assignments, entity.CourseMentor{
			CourseUid:     courseUID,
			MentorUid:     mentorUID,
			AssignedByUid: adminUID,
			Status:        entity.CourseMentorJoined,
			JoinedAt:      &now,
		})
	}

	if err := database.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "course_uid"}, {Name: "mentor_uid"}},
		DoUpdates: clause.Assignments(map[string]any{"assigned_by_uid": adminUID, "status": entity.CourseMentorJoined, "joined_at": now, "updated_at": now}),
	}).Create(&assignments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to assign mentors to course",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if course.MentorUid == nil && len(uniqueMentorUIDs) > 0 {
		database.DB.Model(&course).Update("mentor_uid", uniqueMentorUIDs[0])
	}

	assignedMentors := make([]gin.H, 0, len(mentors))
	for _, mentor := range mentors {
		name, _ := utils.Decrypt(mentor.Name)
		email, _ := utils.Decrypt(mentor.Email)
		assignedMentors = append(assignedMentors, gin.H{
			"uid":   mentor.Uid,
			"name":  name,
			"email": email,
			"role":  mentor.Role,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mentors assigned successfully",
		"data": gin.H{
			"course_uid": courseUID,
			"mentors":    assignedMentors,
		},
		"error": nil,
	})
}

// @Summary      Get mentors by course ID (Public)
// @Description  Public endpoint to retrieve mentors assigned to a specific course.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Course UID"
// @Param        page      query  int     false  "Page number (default: 1)"
// @Param        per_page  query  int     false  "Items per page (default: 10, max: 100)"
// @Param        name      query  string  false  "Search mentor/admin by name"
// @Success      200  {object}  map[string]any  "Mentors retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid course uid"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /courses/{id}/mentor [get]
func GetCourseMentorsByCourseIDFunc(c *gin.Context) {
	courseUID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

	var course entity.Course
	if err := database.DB.Select("uid", "title", "mentor_uid").First(&course, courseUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	type mentorAssignmentRow struct {
		MentorUID  uuid.UUID                 `gorm:"column:mentor_uid"`
		Status     entity.CourseMentorStatus `gorm:"column:status"`
		JoinedAt   *time.Time                `gorm:"column:joined_at"`
		AssignedAt time.Time                 `gorm:"column:assigned_at"`
	}

	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "10")
	nameFilter := strings.ToLower(strings.TrimSpace(c.Query("name")))

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 {
		perPage = 10
	}

	const maxPerPage = 100
	if perPage > maxPerPage {
		perPage = maxPerPage
	}

	var assignmentRows []mentorAssignmentRow
	if err := database.DB.Table("course_mentors AS cm").
		Select("cm.mentor_uid, cm.status, cm.joined_at, cm.created_at as assigned_at").
		Where("cm.course_uid = ?", courseUID).
		Order("cm.created_at ASC").
		Scan(&assignmentRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve course mentors",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	mentorUIDs := make([]uuid.UUID, 0, len(assignmentRows))
	for _, row := range assignmentRows {
		mentorUIDs = append(mentorUIDs, row.MentorUID)
	}

	if course.MentorUid != nil {
		mentorUIDs = append(mentorUIDs, *course.MentorUid)
	}

	var mentors []entity.User
	if len(mentorUIDs) > 0 {
		if err := database.DB.Where("uid IN ? AND role IN ?", mentorUIDs, []entity.UserRole{entity.MentorRole, entity.AdminRole}).Find(&mentors).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve mentor details",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
	}

	mentorResponseByUID := make(map[uuid.UUID]gin.H, len(mentors))
	for _, mentor := range mentors {
		mentorResponseByUID[mentor.Uid] = userToMentorResponse(mentor)
	}

	results := make([]gin.H, 0, len(assignmentRows)+1)
	seenMentor := make(map[uuid.UUID]struct{}, len(assignmentRows))
	for _, row := range assignmentRows {
		mentorData, ok := mentorResponseByUID[row.MentorUID]
		if !ok {
			continue
		}
		seenMentor[row.MentorUID] = struct{}{}

		mentorData["assignment"] = gin.H{
			"status":      row.Status,
			"assigned_at": row.AssignedAt,
			"joined_at":   row.JoinedAt,
		}
		results = append(results, mentorData)
	}

	// Backward compatibility: include legacy mentor from courses.mentor_uid when
	// there is no assignment row in course_mentors for that mentor yet.
	if course.MentorUid != nil {
		if _, exists := seenMentor[*course.MentorUid]; !exists {
			var legacyMentor entity.User
			if err := database.DB.Where("uid = ? AND role IN ?", *course.MentorUid, []entity.UserRole{entity.MentorRole, entity.AdminRole}).First(&legacyMentor).Error; err == nil {
				mentorData := userToMentorResponse(legacyMentor)
				mentorData["assignment"] = gin.H{
					"status":      nil,
					"assigned_at": nil,
					"joined_at":   nil,
				}
				results = append(results, mentorData)
			}
		}
	}

	if nameFilter != "" {
		filtered := make([]gin.H, 0, len(results))
		for _, mentor := range results {
			name, _ := mentor["name"].(string)
			if strings.Contains(strings.ToLower(name), nameFilter) {
				filtered = append(filtered, mentor)
			}
		}
		results = filtered
	}

	total := len(results)
	offset := (page - 1) * perPage
	if offset > total {
		offset = total
	}
	end := offset + perPage
	if end > total {
		end = total
	}
	pagedResults := results[offset:end]
	totalPages := 0
	if total > 0 {
		totalPages = (total + perPage - 1) / perPage
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course mentors retrieved successfully",
		"data": gin.H{
			"course_uid":   course.Uid,
			"course_title": course.Title,
			"mentors":      pagedResults,
			"meta": gin.H{
				"total":        total,
				"per_page":     perPage,
				"current_page": page,
				"total_pages":  totalPages,
			},
		},
		"error": nil,
	})
}

type mentorCourseSummaryRow struct {
	MentorUID uuid.UUID `gorm:"column:mentor_uid"`
	Assigned  int       `gorm:"column:assigned_courses"`
	Joined    int       `gorm:"column:joined_courses"`
}

func mentorListToGinH(mentors []entity.User) ([]gin.H, error) {
	mentorUIDs := make([]uuid.UUID, 0, len(mentors))
	for _, m := range mentors {
		mentorUIDs = append(mentorUIDs, m.Uid)
	}
	summaryRows := make([]mentorCourseSummaryRow, 0)
	if len(mentorUIDs) > 0 {
		if err := database.DB.Table("course_mentors").
			Select("mentor_uid, COUNT(*) as assigned_courses, SUM(CASE WHEN status = 'joined' THEN 1 ELSE 0 END) as joined_courses").
			Where("mentor_uid IN ?", mentorUIDs).
			Group("mentor_uid").
			Scan(&summaryRows).Error; err != nil {
			return nil, err
		}
	}
	summaryMap := make(map[uuid.UUID]mentorCourseSummaryRow, len(summaryRows))
	for _, row := range summaryRows {
		summaryMap[row.MentorUID] = row
	}
	result := make([]gin.H, 0, len(mentors))
	for _, mentor := range mentors {
		name, _ := utils.Decrypt(mentor.Name)
		email, _ := utils.Decrypt(mentor.Email)
		description, _ := utils.Decrypt(mentor.Description)
		summary := summaryMap[mentor.Uid]
		result = append(result, gin.H{
			"uid":                  mentor.Uid,
			"name":                 name,
			"email":                email,
			"avatar_url":           mentor.AvatarURL,
			"description":          description,
			"is_verified":          mentor.IsVerified,
			"created_at":           mentor.CreatedAt,
			"updated_at":           mentor.UpdatedAt,
			"assigned_courses":     summary.Assigned,
			"joined_teach_courses": summary.Joined,
		})
	}
	return result, nil
}

// @Summary      Get all mentors (Public)
// @Description  Public endpoint to retrieve all mentor users with teaching summaries. Optional `name` filters by mentor display name (decrypted, case-insensitive, in-memory).
// @Tags         Mentor
// @Accept       json
// @Produce      json
// @Param        page      query  int     false  "Page number (default: 1)"
// @Param        per_page  query  int     false  "Items per page (default: 10, max: 100)"
// @Param        name      query  string  false  "Filter mentors whose name contains this substring (case-insensitive)"
// @Success      200  {object}  map[string]any  "Mentors retrieved successfully"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /mentor/all [get]
func GetAllMentorsFunc(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "10")
	nameQuery := strings.TrimSpace(c.Query("name"))

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 {
		perPage = 10
	}

	const maxPerPage = 100
	if perPage > maxPerPage {
		perPage = maxPerPage
	}

	var (
		mentors []entity.User
		total   int64
	)
	if nameQuery == "" {
		db := database.DB.Model(&entity.User{}).Where("role = ?", entity.MentorRole)
		if err := db.Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to count mentors",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		offset := (page - 1) * perPage
		if err := db.Order("created_at DESC").Limit(perPage).Offset(offset).Find(&mentors).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve mentors",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
	} else {
		var allMentors []entity.User
		if err := database.DB.Model(&entity.User{}).Where("role = ?", entity.MentorRole).Order("created_at DESC").Find(&allMentors).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve mentors",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		needle := strings.ToLower(nameQuery)
		filtered := make([]entity.User, 0, len(allMentors))
		for _, m := range allMentors {
			n, _ := utils.Decrypt(m.Name)
			if strings.Contains(strings.ToLower(n), needle) {
				filtered = append(filtered, m)
			}
		}
		n := int64(len(filtered))
		total = n
		start := (page - 1) * perPage
		if int64(start) < n {
			end := start + perPage
			if end > len(filtered) {
				end = len(filtered)
			}
			mentors = filtered[start:end]
		}
	}

	result, err := mentorListToGinH(mentors)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve mentor summaries",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}
	var totalPages int
	if total > 0 {
		totalPages = int((total + int64(perPage) - 1) / int64(perPage))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mentors retrieved successfully",
		"data": gin.H{
			"mentors": result,
			"meta": gin.H{
				"total":        total,
				"per_page":     perPage,
				"current_page": page,
				"total_pages":  totalPages,
			},
		},
		"error": nil,
	})
}

// @Summary      Get mentor detail by ID (Public)
// @Description  Public endpoint to retrieve mentor detail similar to user detail including assigned courses, joined teaching courses, and related course reviews.
// @Tags         Mentor
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Mentor UID"
// @Success      200  {object}  map[string]any  "Mentor detail retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid mentor uid"
// @Failure      404  {object}  map[string]any  "Mentor not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /mentor/{id} [get]
func GetMentorDetailFunc(c *gin.Context) {
	mentorUID, ok := resolveUIDParam(c, "users", "id", "mentor")
	if !ok {
		return
	}

	var mentor entity.User
	if err := database.DB.Where("uid = ? AND role = ?", mentorUID, entity.MentorRole).First(&mentor).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Mentor not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	type assignmentRow struct {
		Status       entity.CourseMentorStatus `gorm:"column:status"`
		JoinedAt     *time.Time                `gorm:"column:joined_at"`
		AssignedAt   time.Time                 `gorm:"column:assigned_at"`
		CourseUID    uuid.UUID                 `gorm:"column:course_uid"`
		CourseTitle  string                    `gorm:"column:course_title"`
		CourseSlug   string                    `gorm:"column:course_slug"`
		CourseStatus entity.CourseStatus       `gorm:"column:course_status"`
	}

	var assignmentRows []assignmentRow
	if err := database.DB.Table("course_mentors AS cm").
		Select("cm.status, cm.joined_at, cm.created_at as assigned_at, c.uid as course_uid, c.title as course_title, c.slug as course_slug, c.status as course_status").
		Joins("INNER JOIN courses AS c ON c.uid = cm.course_uid").
		Where("cm.mentor_uid = ?", mentorUID).
		Order("cm.created_at DESC").
		Scan(&assignmentRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve mentor assignments",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	assignedCourses := make([]gin.H, 0, len(assignmentRows))
	joinedCourseUIDs := make([]uuid.UUID, 0)
	for _, row := range assignmentRows {
		if row.Status == entity.CourseMentorJoined {
			joinedCourseUIDs = append(joinedCourseUIDs, row.CourseUID)
		}
		assignedCourses = append(assignedCourses, gin.H{
			"course_uid":    row.CourseUID,
			"course_title":  utils.DecryptOrSelf(row.CourseTitle),
			"course_slug":   row.CourseSlug,
			"course_status": row.CourseStatus,
			"status":        row.Status,
			"assigned_at":   row.AssignedAt,
			"joined_at":     row.JoinedAt,
		})
	}

	type courseReviewRow struct {
		ReviewUID   uuid.UUID `gorm:"column:review_uid"`
		Rating      int       `gorm:"column:rating"`
		Comment     string    `gorm:"column:comment"`
		CreatedAt   time.Time `gorm:"column:created_at"`
		CourseUID   uuid.UUID `gorm:"column:course_uid"`
		CourseTitle string    `gorm:"column:course_title"`
		StudentUID  uuid.UUID `gorm:"column:student_uid"`
		StudentName string    `gorm:"column:student_name"`
	}

	reviewData := make([]gin.H, 0)
	averageRating := 0.0
	if len(joinedCourseUIDs) > 0 {
		var reviewRows []courseReviewRow
		if err := database.DB.Table("course_reviews AS cr").
			Select("cr.uid as review_uid, cr.rating, cr.comment, cr.created_at, c.uid as course_uid, c.title as course_title, u.uid as student_uid, u.name as student_name").
			Joins("INNER JOIN courses AS c ON c.uid = cr.course_uid").
			Joins("INNER JOIN users AS u ON u.uid = cr.user_uid").
			Where("cr.course_uid IN ?", joinedCourseUIDs).
			Order("cr.created_at DESC").
			Scan(&reviewRows).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve mentor course reviews",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		totalRating := 0
		for _, review := range reviewRows {
			commentDecrypted, err := utils.Decrypt(review.Comment)
			if err != nil {
				commentDecrypted = review.Comment
			}
			studentName, err := utils.Decrypt(review.StudentName)
			if err != nil {
				studentName = review.StudentName
			}
			totalRating += review.Rating
			reviewData = append(reviewData, gin.H{
				"uid":          review.ReviewUID,
				"rating":       review.Rating,
				"comment":      commentDecrypted,
				"created_at":   review.CreatedAt,
				"course_uid":   review.CourseUID,
				"course_title": utils.DecryptOrSelf(review.CourseTitle),
				"student": gin.H{
					"uid":  review.StudentUID,
					"name": studentName,
				},
			})
		}

		if len(reviewRows) > 0 {
			averageRating = float64(totalRating) / float64(len(reviewRows))
		}
	}

	nameDecrypted, _ := utils.Decrypt(mentor.Name)
	emailDecrypted, _ := utils.Decrypt(mentor.Email)
	descriptionDecrypted, _ := utils.Decrypt(mentor.Description)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mentor detail retrieved successfully",
		"data": gin.H{
			"uid":         mentor.Uid,
			"name":        nameDecrypted,
			"email":       emailDecrypted,
			"avatar_url":  mentor.AvatarURL,
			"role":        mentor.Role,
			"is_verified": mentor.IsVerified,
			"description": descriptionDecrypted,
			"created_at":  mentor.CreatedAt,
			"updated_at":  mentor.UpdatedAt,
			"assignments": assignedCourses,
			"review_summary": gin.H{
				"total_reviews":  len(reviewData),
				"average_rating": averageRating,
			},
			"course_reviews": reviewData,
		},
		"error": nil,
	})
}
