package main

import (
	"backend/internal/handler/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	routes.StartRegisterRoutes(r)
	routes.StartLoginRoutes(r)
	routes.StartHelloRoutes(r)

	r.Run(":8080")
}
