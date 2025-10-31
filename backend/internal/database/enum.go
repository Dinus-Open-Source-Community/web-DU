// Digunakan untuk melakukan insert enum pada database PostgreSQL
// Dikarenakan GORM tidak mendukung pembuatan enum secara langsung

package database

import (
	"log"

	"gorm.io/gorm"
)

func CreateAllEnums(db *gorm.DB) {
	createUserRoleEnum(db)

	log.Println("[Success] All ENUMs have been created")
}

func createUserRoleEnum(db *gorm.DB) {
	query := `
	DO $$ BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
			CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'student');
		END IF;
	END $$;
	`
	db.Exec(query)
	log.Println("[Success] ENUM user_role is ready for use")
}