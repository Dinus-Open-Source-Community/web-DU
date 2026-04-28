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
		publicCategoryGroup.GET("/", service.GetAllCourseCategoriesFunc)   // all roles - anonymous user
		publicCategoryGroup.GET("/:id", service.GetCourseCategoryByIDFunc) // all roles - anonymous user
	}

	authCategoryGroup := r.Group("/course-categories")
	authCategoryGroup.Use(middleware.AuthMiddleware())
	{
		authCategoryGroup.POST("/", service.PostAdminCourseCategoryFunc)
		authCategoryGroup.PUT("/:id", service.UpdateAdminCourseCategoryFunc)
		authCategoryGroup.DELETE("/:id", service.DeleteAdminCourseCategoryFunc)
	}

	publicClassTypeGroup := r.Group("/course-types")
	{
		publicClassTypeGroup.GET("/", service.GetAllClassTypesFunc)    // all roles - anonymous user
		publicClassTypeGroup.GET("/:id", service.GetClassTypeByIDFunc) // all roles - anonymous user
	}

	authClassTypeGroup := r.Group("/course-types")
	authClassTypeGroup.Use(middleware.AuthMiddleware())
	{
		authClassTypeGroup.POST("/", service.PostAdminClassTypeFunc)
		authClassTypeGroup.PUT("/:id", service.UpdateAdminClassTypeFunc)
		authClassTypeGroup.DELETE("/:id", service.DeleteAdminClassTypeFunc)
	}
}
