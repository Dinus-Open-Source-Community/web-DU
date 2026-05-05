package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartCourseMasterRoutes)
}

func StartCourseMasterRoutes(r *gin.Engine) {
	publicCategoryGroup := r.Group("/course-categories")
	{
		publicCategoryGroup.GET("/", service.GetAllCourseCategoriesFunc)   // Public
		publicCategoryGroup.GET("/:id", service.GetCourseCategoryByIDFunc) // Public
	}

	authCategoryGroup := r.Group("/course-categories")
	authCategoryGroup.Use(middleware.AuthMiddleware())
	{
		authCategoryGroup.POST("/", service.PostAdminCourseCategoryFunc)              // Super Admin / Admin
		authCategoryGroup.PUT("/:id", service.UpdateAdminCourseCategoryFunc)           // Super Admin / Admin
		authCategoryGroup.DELETE("/:id", service.DeleteAdminCourseCategoryFunc)        // Super Admin / Admin
	}

	publicClassTypeGroup := r.Group("/course-types")
	{
		publicClassTypeGroup.GET("/", service.GetAllClassTypesFunc)    // Public
		publicClassTypeGroup.GET("/:id", service.GetClassTypeByIDFunc) // Public
	}

	authClassTypeGroup := r.Group("/course-types")
	authClassTypeGroup.Use(middleware.AuthMiddleware())
	{
		authClassTypeGroup.POST("/", service.PostAdminClassTypeFunc)              // Super Admin / Admin
		authClassTypeGroup.PUT("/:id", service.UpdateAdminClassTypeFunc)           // Super Admin / Admin
		authClassTypeGroup.DELETE("/:id", service.DeleteAdminClassTypeFunc)      // Super Admin / Admin
	}
}
