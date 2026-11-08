package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartGalleryRoutes)
}

func StartGalleryRoutes(r *gin.Engine) {
	publicGalleryGroup := r.Group("/galleries")
	{
		publicGalleryGroup.GET("/", service.GetAllGalleriesFunc)
		publicGalleryGroup.GET("/:id", service.GetGalleryByIDFunc)
	}

	authGalleryGroup := r.Group("/galleries")
	authGalleryGroup.Use(middleware.AuthMiddleware())
	{
		authGalleryGroup.POST("/", service.PostAdminGalleryFunc)
		authGalleryGroup.PUT("/:id", service.UpdateAdminGalleryFunc)
		authGalleryGroup.DELETE("/:id", service.DeleteAdminGalleryFunc)
	}
}
