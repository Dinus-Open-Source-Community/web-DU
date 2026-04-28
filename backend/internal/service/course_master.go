package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func requireAdmin(c *gin.Context) (entity.User, bool) {
	userID, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return entity.User{}, false
	}

	if !hasAdminAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return entity.User{}, false
	}

	return userData, true
}

// @Summary      Get all course categories (All Roles - Anonymous User)
// @Description  Public endpoint to retrieve all course categories.
// @Tags         Course Category
// @Produce      json
// @Param        page      query  int     false  "Page number (default: 1)"
// @Param        per_page  query  int     false  "Items per page (default: 10, max: 100)"
// @Param        name      query  string  false  "Search by category name"
// @Success      200  {object}  map[string]any  "Course categories retrieved successfully"
// @Failure      500  {object}  map[string]any  "Failed to retrieve course categories"
// @Router       /course-categories [get]
func GetAllCourseCategoriesFunc(c *gin.Context) {
	var categories []entity.CourseCategory
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

	db := database.DB.Model(&entity.CourseCategory{})
	if nameFilter != "" {
		db = db.Where("LOWER(name) LIKE ?", "%"+strings.ToLower(nameFilter)+"%")
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count course categories",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	offset := (page - 1) * perPage
	if err := db.Preload("Courses").Preload("Courses.Category").Preload("Courses.ClassType").Preload("Courses.Mentor").Preload("Courses.Mentors").Order("created_at DESC").Limit(perPage).Offset(offset).Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve course categories",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	data := make([]gin.H, 0, len(categories))
	for _, category := range categories {
		data = append(data, gin.H{
			"uid":         category.Uid,
			"name":        category.Name,
			"description": category.Description,
			"is_active":   category.IsActive,
			"created_at":  category.CreatedAt,
			"updated_at":  category.UpdatedAt,
			"courses":     courseListResponse(category.Courses),
		})
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course categories retrieved successfully",
		"data": gin.H{
			"course_categories": data,
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

// @Summary      Get course category by ID (All Roles - Anonymous User)
// @Description  Public endpoint to retrieve a specific course category by uid.
// @Tags         Course Category
// @Produce      json
// @Param        id   path      string  true  "Course Category UID"
// @Success      200  {object}  map[string]any  "Course category retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid course category uid"
// @Failure      404  {object}  map[string]any  "Course category not found"
// @Router       /course-categories/{id} [get]
func GetCourseCategoryByIDFunc(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course category uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var category entity.CourseCategory
	if err := database.DB.Preload("Courses").Preload("Courses.Category").Preload("Courses.ClassType").Preload("Courses.Mentor").Preload("Courses.Mentors").First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course category not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course category retrieved successfully",
		"data": gin.H{
			"uid":         category.Uid,
			"name":        category.Name,
			"description": category.Description,
			"is_active":   category.IsActive,
			"created_at":  category.CreatedAt,
			"updated_at":  category.UpdatedAt,
			"courses":     courseListResponse(category.Courses),
		},
		"error": nil,
	})
}

// @Summary      Create course category (Admin Only)
// @Description  Create a new course category. Admin only.
// @Tags         Course Category
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.CreateCourseCategoryRequest  true  "Course category data"
// @Success      201  {object}  map[string]any  "Course category created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request body"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      500  {object}  map[string]any  "Failed to create course category"
// @Router       /course-categories [post]
func PostAdminCourseCategoryFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	var req dto.CreateCourseCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "name is required",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	category := entity.CourseCategory{
		Name:        req.Name,
		Description: strings.TrimSpace(req.Description),
		IsActive:    true,
	}
	if req.IsActive != nil {
		category.IsActive = *req.IsActive
	}

	if err := database.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create course category",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Course category created successfully",
		"data":    category,
		"error":   nil,
	})
}

// @Summary      Update course category (Admin Only)
// @Description  Update existing course category by uid. Admin only.
// @Tags         Course Category
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  string                           true  "Course Category UID"
// @Param        body  body  dto.UpdateCourseCategoryRequest  true  "Course category data"
// @Success      200  {object}  map[string]any  "Course category updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Course category not found"
// @Failure      500  {object}  map[string]any  "Failed to update course category"
// @Router       /course-categories/{id} [put]
func UpdateAdminCourseCategoryFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course category uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var category entity.CourseCategory
	if err := database.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course category not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var req dto.UpdateCourseCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if req.Name != nil {
		name := strings.TrimSpace(*req.Name)
		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "name cannot be empty",
				"data":    nil,
				"error":   nil,
			})
			return
		}
		category.Name = name
	}
	if req.Description != nil {
		category.Description = strings.TrimSpace(*req.Description)
	}
	if req.IsActive != nil {
		category.IsActive = *req.IsActive
	}

	if err := database.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update course category",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course category updated successfully",
		"data":    category,
		"error":   nil,
	})
}

// @Summary      Delete course category (Admin Only)
// @Description  Delete course category by uid. Admin only.
// @Tags         Course Category
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Course Category UID"
// @Success      200  {object}  map[string]any  "Course category deleted successfully"
// @Failure      400  {object}  map[string]any  "Invalid course category uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Course category not found"
// @Failure      500  {object}  map[string]any  "Failed to delete course category"
// @Router       /course-categories/{id} [delete]
func DeleteAdminCourseCategoryFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course category uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var category entity.CourseCategory
	if err := database.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course category not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Delete(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete course category",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course category deleted successfully",
		"data":    nil,
		"error":   nil,
	})
}

// @Summary      Get all course types (All Roles - Anonymous User)
// @Description  Public endpoint to retrieve all course types.
// @Tags         Course Type
// @Produce      json
// @Param        page      query  int     false  "Page number (default: 1)"
// @Param        per_page  query  int     false  "Items per page (default: 10, max: 100)"
// @Param        name      query  string  false  "Search by course type name"
// @Success      200  {object}  map[string]any  "Course types retrieved successfully"
// @Failure      500  {object}  map[string]any  "Failed to retrieve course types"
// @Router       /course-types [get]
func GetAllClassTypesFunc(c *gin.Context) {
	var classTypes []entity.ClassType
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

	db := database.DB.Model(&entity.ClassType{})
	if nameFilter != "" {
		db = db.Where("LOWER(name) LIKE ?", "%"+strings.ToLower(nameFilter)+"%")
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count course types",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	offset := (page - 1) * perPage
	if err := db.Preload("Courses").Preload("Courses.Category").Preload("Courses.ClassType").Preload("Courses.Mentor").Preload("Courses.Mentors").Order("created_at DESC").Limit(perPage).Offset(offset).Find(&classTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve course types",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	data := make([]gin.H, 0, len(classTypes))
	for _, classType := range classTypes {
		data = append(data, gin.H{
			"uid":         classType.Uid,
			"name":        classType.Name,
			"description": classType.Description,
			"is_active":   classType.IsActive,
			"created_at":  classType.CreatedAt,
			"updated_at":  classType.UpdatedAt,
			"courses":     courseListResponse(classType.Courses),
		})
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course types retrieved successfully",
		"data": gin.H{
			"course_types": data,
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

// @Summary      Get course type by ID (All Roles - Anonymous User)
// @Description  Public endpoint to retrieve a specific course type by uid.
// @Tags         Course Type
// @Produce      json
// @Param        id   path      string  true  "Course Type UID"
// @Success      200  {object}  map[string]any  "Course type retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid course type uid"
// @Failure      404  {object}  map[string]any  "Course type not found"
// @Router       /course-types/{id} [get]
func GetClassTypeByIDFunc(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course type uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var classType entity.ClassType
	if err := database.DB.Preload("Courses").Preload("Courses.Category").Preload("Courses.ClassType").Preload("Courses.Mentor").Preload("Courses.Mentors").First(&classType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course type not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course type retrieved successfully",
		"data": gin.H{
			"uid":         classType.Uid,
			"name":        classType.Name,
			"description": classType.Description,
			"is_active":   classType.IsActive,
			"created_at":  classType.CreatedAt,
			"updated_at":  classType.UpdatedAt,
			"courses":     courseListResponse(classType.Courses),
		},
		"error": nil,
	})
}

// @Summary      Create course type (Admin Only)
// @Description  Create a new course type. Admin only.
// @Tags         Course Type
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.CreateClassTypeRequest  true  "Course type data"
// @Success      201  {object}  map[string]any  "Course type created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request body"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      500  {object}  map[string]any  "Failed to create course type"
// @Router       /course-types [post]
func PostAdminClassTypeFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	var req dto.CreateClassTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "name is required",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	classType := entity.ClassType{
		Name:        req.Name,
		Description: strings.TrimSpace(req.Description),
		IsActive:    true,
	}
	if req.IsActive != nil {
		classType.IsActive = *req.IsActive
	}

	if err := database.DB.Create(&classType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create course type",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Course type created successfully",
		"data":    classType,
		"error":   nil,
	})
}

// @Summary      Update course type (Admin Only)
// @Description  Update existing course type by uid. Admin only.
// @Tags         Course Type
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  string                      true  "Course Type UID"
// @Param        body  body  dto.UpdateClassTypeRequest  true  "Course type data"
// @Success      200  {object}  map[string]any  "Course type updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Course type not found"
// @Failure      500  {object}  map[string]any  "Failed to update course type"
// @Router       /course-types/{id} [put]
func UpdateAdminClassTypeFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course type uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var classType entity.ClassType
	if err := database.DB.First(&classType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course type not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var req dto.UpdateClassTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if req.Name != nil {
		name := strings.TrimSpace(*req.Name)
		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "name cannot be empty",
				"data":    nil,
				"error":   nil,
			})
			return
		}
		classType.Name = name
	}
	if req.Description != nil {
		classType.Description = strings.TrimSpace(*req.Description)
	}
	if req.IsActive != nil {
		classType.IsActive = *req.IsActive
	}

	if err := database.DB.Save(&classType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update course type",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course type updated successfully",
		"data":    classType,
		"error":   nil,
	})
}

// @Summary      Delete course type (Admin Only)
// @Description  Delete course type by uid. Admin only.
// @Tags         Course Type
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Course Type UID"
// @Success      200  {object}  map[string]any  "Course type deleted successfully"
// @Failure      400  {object}  map[string]any  "Invalid course type uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Course type not found"
// @Failure      500  {object}  map[string]any  "Failed to delete course type"
// @Router       /course-types/{id} [delete]
func DeleteAdminClassTypeFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course type uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var classType entity.ClassType
	if err := database.DB.First(&classType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course type not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Delete(&classType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete course type",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course type deleted successfully",
		"data":    nil,
		"error":   nil,
	})
}
