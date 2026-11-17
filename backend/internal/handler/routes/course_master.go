package routes

import (
	"backend/internal/cache"
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
		publicCategoryGroup.GET("/", cache.ResponseCache(cache.NamespaceCourseCategories, cache.CourseCategoriesTTL), service.GetAllCourseCategoriesFunc)                                 // Public
		publicCategoryGroup.GET("/:id", cache.ResponseCacheUID(cache.NamespaceCourseCategories, cache.CourseCategoriesTTL, "course_categories", "id"), service.GetCourseCategoryByIDFunc) // Public
	}

	authCategoryGroup := r.Group("/course-categories")
	authCategoryGroup.Use(middleware.AuthMiddleware())
	{
		authCategoryGroup.POST("/", service.PostAdminCourseCategoryFunc)        // Super Admin / Admin
		authCategoryGroup.PUT("/:id", service.UpdateAdminCourseCategoryFunc)    // Super Admin / Admin
		authCategoryGroup.DELETE("/:id", service.DeleteAdminCourseCategoryFunc) // Super Admin / Admin
	}

	publicClassTypeGroup := r.Group("/course-types")
	{
		publicClassTypeGroup.GET("/", cache.ResponseCache(cache.NamespaceCourseTypes, cache.CourseTypesTTL), service.GetAllClassTypesFunc)                            // Public
		publicClassTypeGroup.GET("/:id", cache.ResponseCacheUID(cache.NamespaceCourseTypes, cache.CourseTypesTTL, "class_types", "id"), service.GetClassTypeByIDFunc) // Public
	}

	authClassTypeGroup := r.Group("/course-types")
	authClassTypeGroup.Use(middleware.AuthMiddleware())
	{
		authClassTypeGroup.POST("/", service.PostAdminClassTypeFunc)        // Super Admin / Admin
		authClassTypeGroup.PUT("/:id", service.UpdateAdminClassTypeFunc)    // Super Admin / Admin
		authClassTypeGroup.DELETE("/:id", service.DeleteAdminClassTypeFunc) // Super Admin / Admin
	}
}
