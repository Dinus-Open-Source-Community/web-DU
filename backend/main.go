package main

import (
	"backend/internal/handler/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	routes.RegisterHelloRoutes(r)

	r.Run(":8080")
}
