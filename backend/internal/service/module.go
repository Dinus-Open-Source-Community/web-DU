package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary      Get all modules by course (Super Admin/Admin/Mentor/Enrollment User)
// @Description  Retrieve all modules for a specific course ordered by sequence
// @Tags         Module
// @Produce      json
// @Security     BearerAuth
// @Param        course_id   path      string  true  "Course UID"
// @Param        page        query     int     false "Page number (default: 1)"
// @Param        per_page    query     int     false "Items per page (default: 10, max: 100)"
// @Param        name        query     string  false "Search module by title"
// @Success      200  {object}  map[string]any  "Modules retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve modules"
// @Router       /modules/course/{course_id} [get]
func GetAllModulesFunc(c *gin.Context) {
	userData, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	courseUID, ok := resolveUIDParam(c, "courses", "course_id", "course")
	if !ok {
		return
	}

	allowed, err := canReadCourseByRole(userData, courseUID)
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
			"message": "Access denied: super admin, admin, mentor, or enrolled user only",
			"data":    nil,
			"error":   nil,
		})
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

	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "10")
	nameFilter := strings.TrimSpace(c.Query("name"))

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

	db := database.DB.Model(&entity.Module{}).Where("course_uid = ?", courseUID)

	// Karena title disimpan terenkripsi, filter dilakukan in-memory setelah hook
	// AfterFind mendekripsi judul modul.
	if nameFilter != "" {
		var allModules []entity.Module
		if err := db.Preload("Lessons", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index ASC")
		}).Order("order_index ASC").Find(&allModules).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve modules for search",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		needle := strings.ToLower(nameFilter)
		filtered := make([]entity.Module, 0, len(allModules))
		for _, module := range allModules {
			if strings.Contains(strings.ToLower(module.Title), needle) {
				filtered = append(filtered, module)
			}
		}

		total := int64(len(filtered))
		start := (page - 1) * perPage
		if start > len(filtered) {
			start = len(filtered)
		}
		end := start + perPage
		if end > len(filtered) {
			end = len(filtered)
		}
		paginated := filtered[start:end]
		totalPages := int((total + int64(perPage) - 1) / int64(perPage))

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Modules retrieved successfully",
			"data": gin.H{
				"modules": paginated,
				"meta": gin.H{
					"total":        total,
					"per_page":     perPage,
					"current_page": page,
					"total_pages":  totalPages,
				},
			},
			"error": nil,
		})
		return
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count modules",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	offset := (page - 1) * perPage

	var modules []entity.Module
	if err := db.Preload("Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Order("order_index ASC")
	}).Order("order_index ASC").Limit(perPage).Offset(offset).Find(&modules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve modules",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Modules retrieved successfully",
		"data": gin.H{
			"modules": modules,
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

// @Summary      Get module by ID (Super Admin/Admin/Mentor/Enrollment User)
// @Description  Retrieve a specific module with all its lessons
// @Tags         Module
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Module UID"
// @Success      200  {object}  map[string]any  "Module retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid module uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "Module not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve module"
// @Router       /modules/{id} [get]
func GetModuleByIDFunc(c *gin.Context) {
	userData, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	moduleUID, ok := resolveUIDParam(c, "modules", "id", "module")
	if !ok {
		return
	}

	var module entity.Module
	if err := database.DB.Preload("Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Order("order_index ASC")
	}).First(&module, moduleUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Module not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	allowed, err := canReadCourseByRole(userData, module.CourseUid)
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
			"message": "Access denied: super admin, admin, mentor, or enrolled user only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Module retrieved successfully",
		"data":    module,
		"error":   nil,
	})
}

// PostAdminModuleFunc creates a new module (Admin/Mentor)
//
// @Summary      Create new module (Admin/Mentor)
// @Description  Create a new module in a course. Accessible by admin or mentor.
// @Tags         Module
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.CreateModuleRequest  true  "Module data"
// @Success      201  {object}  map[string]any  "Module created successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Course not found or User not found"
// @Failure      500  {object}  map[string]any  "Failed to create module"
// @Router       /modules [post]
func PostAdminModuleFunc(c *gin.Context) {
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

	if !hasMentorAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: cannot create module for this course",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var req dto.CreateModuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	courseUid, ok := resolveUIDValue(c, "courses", req.CourseUid, "course")
	if !ok {
		return
	}

	var course entity.Course
	if err := database.DB.First(&course, courseUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	titleEnc, err := utils.Encrypt(req.Title)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt module title", "data": nil, "error": err.Error()})
		return
	}

	module := entity.Module{
		CourseUid:  courseUid,
		Title:      titleEnc,
		OrderIndex: req.OrderIndex,
	}

	if err := database.DB.Create(&module).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create module",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	module.Title = utils.DecryptOrSelf(module.Title)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Module created successfully",
		"data":    module,
		"error":   nil,
	})
}

// UpdateAdminModuleFunc updates a module (Admin/Mentor)
//
// @Summary      Update module (Admin/Mentor)
// @Description  Update an existing module's information. Accessible by admin or mentor.
// @Tags         Module
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  string  true  "Module UID"
// @Param        body  body  dto.UpdateModuleRequest  true  "Module data to update"
// @Success      200  {object}  map[string]any  "Module updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid module uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Module or user not found"
// @Failure      500  {object}  map[string]any  "Failed to update module"
// @Router       /modules/{id} [put]
func UpdateAdminModuleFunc(c *gin.Context) {
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

	if !hasMentorAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: cannot update this module",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	moduleUID, ok := resolveUIDParam(c, "modules", "id", "module")
	if !ok {
		return
	}

	var module entity.Module
	if err := database.DB.First(&module, moduleUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Module not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var req dto.UpdateModuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if req.Title != "" {
		titleEnc, err := utils.Encrypt(req.Title)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt module title", "data": nil, "error": err.Error()})
			return
		}
		module.Title = titleEnc
	}
	if req.OrderIndex != 0 {
		module.OrderIndex = req.OrderIndex
	}

	if err := database.DB.Save(&module).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update module",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	module.Title = utils.DecryptOrSelf(module.Title)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Module updated successfully",
		"data":    module,
		"error":   nil,
	})
}

// DeleteAdminModuleFunc deletes a module (Admin/Mentor)
//
// @Summary      Delete module (Admin/Mentor)
// @Description  Delete a module and all its associated lessons. Accessible by admin or mentor.
// @Tags         Module
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Module UID to delete"
// @Success      200  {object}  map[string]any  "Module deleted successfully"
// @Failure      400  {object}  map[string]any  "Invalid module uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Module or user not found"
// @Failure      500  {object}  map[string]any  "Failed to delete module"
// @Router       /modules/{id} [delete]
func DeleteAdminModuleFunc(c *gin.Context) {
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

	if !hasMentorAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: cannot delete this module",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	moduleUID, ok := resolveUIDParam(c, "modules", "id", "module")
	if !ok {
		return
	}

	var module entity.Module
	if err := database.DB.First(&module, moduleUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Module not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Transaction(func(tx *gorm.DB) error {
		var lessonIDs []uuid.UUID
		if err := tx.Model(&entity.Lesson{}).
			Where("module_uid = ?", module.Uid).
			Pluck("uid", &lessonIDs).Error; err != nil {
			return err
		}

		if len(lessonIDs) > 0 {
			if err := tx.Where("lesson_uid IN ?", lessonIDs).
				Delete(&entity.LessonAttendance{}).Error; err != nil {
				return err
			}
		}

		if err := tx.Where("module_uid = ?", module.Uid).
			Delete(&entity.Lesson{}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&module).Error; err != nil {
			return err
		}

		return nil
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete module",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Module deleted successfully",
		"data":    nil,
		"error":   nil,
	})
}
