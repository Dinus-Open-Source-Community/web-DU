package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary      Get all modules by course (All Roles)
// @Description  Retrieve all modules for a specific course ordered by sequence
// @Tags         Module
// @Produce      json
// @Security     BearerAuth
// @Param        course_id   path      int  true  "Course ID"
// @Success      200  {object}  map[string]any  "Modules retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve modules"
// @Router       /modules/course/{course_id} [get]
func GetAllModulesFunc(c *gin.Context) {
	courseID := c.Param("course_id")

	var course entity.Course
	if err := database.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var modules []entity.Module
	if err := database.DB.Where("course_uid = ?", courseID).Preload("Lessons").Order("order_index ASC").Find(&modules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve modules",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Modules retrieved successfully",
		"data":    modules,
		"error":   nil,
	})
}

// @Summary      Get module by ID (All Roles)
// @Description  Retrieve a specific module with all its lessons
// @Tags         Module
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "Module ID"
// @Success      200  {object}  map[string]any  "Module retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "Module not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve module"
// @Router       /modules/{id} [get]
func GetModuleByIDFunc(c *gin.Context) {
	moduleID := c.Param("id")

	var module entity.Module
	if err := database.DB.Preload("Lessons").First(&module, moduleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Module not found",
			"data":    nil,
			"error":   err.Error(),
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

// PostAdminModuleFunc creates a new module (Admin only)
//
// @Summary      Create new module (Admin Only)
// @Description  Create a new module in a course (Admin only)
// @Tags         Module
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.CreateModuleRequest  true  "Module data"
// @Success      201  {object}  map[string]any  "Module created successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
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

	if userData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Create Module Access denied: Admins only",
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

	var course entity.Course
	if err := database.DB.First(&course, req.CourseUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	module := entity.Module{
		CourseUid:  req.CourseUid,
		Title:      req.Title,
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

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Module created successfully",
		"data":    module,
		"error":   nil,
	})
}

// UpdateAdminModuleFunc updates a module (Admin only)
//
// @Summary      Update module (Admin Only)
// @Description  Update an existing module's information. Admin only.
// @Tags         Module
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  int  true  "Module ID"
// @Param        body  body  dto.UpdateModuleRequest  true  "Module data to update"
// @Success      200  {object}  map[string]any  "Module updated successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
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

	if userData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Update Module Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	moduleID := c.Param("id")

	var module entity.Module
	if err := database.DB.First(&module, moduleID).Error; err != nil {
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
		module.Title = req.Title
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

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Module updated successfully",
		"data":    module,
		"error":   nil,
	})
}

// DeleteAdminModuleFunc deletes a module (Admin only)
//
// @Summary      Delete module (Admin Only)
// @Description  Delete a module and all its associated lessons. Admin only.
// @Tags         Module
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "Module ID to delete"
// @Success      200  {object}  map[string]any  "Module deleted successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
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

	if userData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Delete Module Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	moduleID := c.Param("id")

	var module entity.Module
	if err := database.DB.First(&module, moduleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Module not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Delete(&module).Error; err != nil {
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
