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
		userGroup.PATCH("/profile", service.UpdateUserProfileService) // all roles - butuh sign in
		userGroup.PATCH("/password", service.ChangePasswordService)   // all roles - butuh sign in
		userGroup.GET("/data", service.GetSelfUserDetailService)      // all roles - butuh sign in

		userGroup.GET("/manage/all", service.GetAllUsersService)      // Super Admin / Admin
		userGroup.PATCH("/manage/:id", service.UpdateUserRoleService) // Super Admin / Admin (role rules vary)
		userGroup.PATCH("/role/:id", service.UpdateUserRoleService)   // Super Admin / Admin (role rules vary)
		userGroup.DELETE("/manage/:id", service.DeleteUserService)    // Super Admin / Admin
		userGroup.GET("/:id", service.GetUserDetailByIDService)       // Super Admin / Admin
	}
}
