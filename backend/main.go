package main

import (
	"backend/internal/handler/routes"
	"log"

	"backend/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("[Error] Gagal memuat file .env:", err)
	}
}

func main() {
	r := gin.Default()

	//
	r.Use(gin.Recovery())

	database.ConnectDB()

	routes.StartRegisterRoutes(r)
	routes.StartLoginRoutes(r)
	routes.StartHelloRoutes(r)

	r.Run(":8080")
}
