package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartModuleRoutes)
}

func StartModuleRoutes(r *gin.Engine) {
	moduleGroup := r.Group("/modules")
	moduleGroup.Use(middleware.AuthMiddleware())
	{
		moduleGroup.GET("/:id", service.GetModuleByIDFunc)               // Authenticated users - all roles
		moduleGroup.GET("/course/:course_id", service.GetAllModulesFunc) // Authenticated users - all roles
		moduleGroup.POST("/", service.PostAdminModuleFunc)               // Admin only
		moduleGroup.PUT("/:id", service.UpdateAdminModuleFunc)           // Admin only
		moduleGroup.DELETE("/:id", service.DeleteAdminModuleFunc)        // Admin only
	}
}
