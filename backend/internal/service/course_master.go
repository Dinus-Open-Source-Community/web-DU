package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"net/http"
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

	if userData.Role != entity.AdminRole {
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

// @Summary      Get all course categories (Admin Only)
// @Description  Retrieve all course categories. Admin only.
// @Tags         Course Category
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  map[string]any  "Course categories retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      500  {object}  map[string]any  "Failed to retrieve course categories"
// @Router       /course-categories [get]
func GetAllCourseCategoriesFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	var categories []entity.CourseCategory
	if err := database.DB.Order("created_at DESC").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve course categories",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course categories retrieved successfully",
		"data":    categories,
		"error":   nil,
	})
}

// @Summary      Get course category by ID (Admin Only)
// @Description  Retrieve a specific course category by uid. Admin only.
// @Tags         Course Category
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Course Category UID"
// @Success      200  {object}  map[string]any  "Course category retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid course category uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Course category not found"
// @Router       /course-categories/{id} [get]
func GetCourseCategoryByIDFunc(c *gin.Context) {
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

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course category retrieved successfully",
		"data":    category,
		"error":   nil,
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

// @Summary      Get all class types (Admin Only)
// @Description  Retrieve all class types. Admin only.
// @Tags         Class Type
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  map[string]any  "Class types retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      500  {object}  map[string]any  "Failed to retrieve class types"
// @Router       /class-types [get]
func GetAllClassTypesFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	var classTypes []entity.ClassType
	if err := database.DB.Order("created_at DESC").Find(&classTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve class types",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Class types retrieved successfully",
		"data":    classTypes,
		"error":   nil,
	})
}

// @Summary      Get class type by ID (Admin Only)
// @Description  Retrieve a specific class type by uid. Admin only.
// @Tags         Class Type
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Class Type UID"
// @Success      200  {object}  map[string]any  "Class type retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid class type uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Class type not found"
// @Router       /class-types/{id} [get]
func GetClassTypeByIDFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid class type uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var classType entity.ClassType
	if err := database.DB.First(&classType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Class type not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Class type retrieved successfully",
		"data":    classType,
		"error":   nil,
	})
}

// @Summary      Create class type (Admin Only)
// @Description  Create a new class type. Admin only.
// @Tags         Class Type
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.CreateClassTypeRequest  true  "Class type data"
// @Success      201  {object}  map[string]any  "Class type created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request body"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      500  {object}  map[string]any  "Failed to create class type"
// @Router       /class-types [post]
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
			"message": "Failed to create class type",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Class type created successfully",
		"data":    classType,
		"error":   nil,
	})
}

// @Summary      Update class type (Admin Only)
// @Description  Update existing class type by uid. Admin only.
// @Tags         Class Type
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  string                      true  "Class Type UID"
// @Param        body  body  dto.UpdateClassTypeRequest  true  "Class type data"
// @Success      200  {object}  map[string]any  "Class type updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Class type not found"
// @Failure      500  {object}  map[string]any  "Failed to update class type"
// @Router       /class-types/{id} [put]
func UpdateAdminClassTypeFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid class type uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var classType entity.ClassType
	if err := database.DB.First(&classType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Class type not found",
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
			"message": "Failed to update class type",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Class type updated successfully",
		"data":    classType,
		"error":   nil,
	})
}

// @Summary      Delete class type (Admin Only)
// @Description  Delete class type by uid. Admin only.
// @Tags         Class Type
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Class Type UID"
// @Success      200  {object}  map[string]any  "Class type deleted successfully"
// @Failure      400  {object}  map[string]any  "Invalid class type uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Class type not found"
// @Failure      500  {object}  map[string]any  "Failed to delete class type"
// @Router       /class-types/{id} [delete]
func DeleteAdminClassTypeFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid class type uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var classType entity.ClassType
	if err := database.DB.First(&classType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Class type not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Delete(&classType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete class type",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Class type deleted successfully",
		"data":    nil,
		"error":   nil,
	})
}
