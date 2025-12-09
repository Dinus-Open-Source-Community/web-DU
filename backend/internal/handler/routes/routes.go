package routes

import (
	"github.com/gin-gonic/gin"
)

type RouteHandler func(*gin.Engine)

var routeList []RouteHandler

func RegisterRoute(h RouteHandler) {
	routeList = append(routeList, h)
}

func SetupAllRoutes(r *gin.Engine) {
	for _, handler := range routeList {
		handler(r)
	}
}
