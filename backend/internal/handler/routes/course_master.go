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
	categoryGroup := r.Group("/course-categories")
	categoryGroup.Use(middleware.AuthMiddleware())
	{
		categoryGroup.GET("/", service.GetAllCourseCategoriesFunc)
		categoryGroup.GET("/:id", service.GetCourseCategoryByIDFunc)
		categoryGroup.POST("/", service.PostAdminCourseCategoryFunc)
		categoryGroup.PUT("/:id", service.UpdateAdminCourseCategoryFunc)
		categoryGroup.DELETE("/:id", service.DeleteAdminCourseCategoryFunc)
	}

	classTypeGroup := r.Group("/course-types")
	classTypeGroup.Use(middleware.AuthMiddleware())
	{
		classTypeGroup.GET("/", service.GetAllClassTypesFunc)
		classTypeGroup.GET("/:id", service.GetClassTypeByIDFunc)
		classTypeGroup.POST("/", service.PostAdminClassTypeFunc)
		classTypeGroup.PUT("/:id", service.UpdateAdminClassTypeFunc)
		classTypeGroup.DELETE("/:id", service.DeleteAdminClassTypeFunc)
	}
}
