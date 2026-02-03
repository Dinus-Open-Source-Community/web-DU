package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartUserRoutes)
}

func StartUserRoutes(r *gin.Engine) {
	userGroup := r.Group("/user")
	userGroup.Use(middleware.AuthMiddleware())
	{
		userGroup.GET("/data", service.GetUserDataService) // user profile - all roles
		userGroup.PATCH("/profile", service.UpdateUserProfileService) // update profile - all roles
		userGroup.PATCH("/password", service.ChangePasswordService) // change password - all roles

		userGroup.GET("/manage/all", service.GetAllUsersService)      // Admin only
		userGroup.PATCH("/manage/:id", service.UpdateUserRoleService) // Admin only
		userGroup.DELETE("/manage/:id", service.DeleteUserService)    // Admin only
	}
}
