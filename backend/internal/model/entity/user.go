package entity

import (
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	SuperAdminRole UserRole = "super_admin"
	AdminRole      UserRole = "admin"
	MentorRole     UserRole = "mentor"
	StudentRole    UserRole = "student"
)

// Model User Migrations
type User struct {
	Uid         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	Name        string    `gorm:"type:varchar(150);not null" json:"name"`
	Email       string    `gorm:"type:varchar(150);unique;not null" json:"email"`
	EmailHash   string    `gorm:"type:varchar(150);unique;not null" json:"email_hash"`
	Password    string    `gorm:"type:varchar(255)" json:"-"`
	Role        UserRole  `gorm:"type:user_role;default:'student';not null" json:"role"`
	IsVerified  bool      `gorm:"default:false" json:"is_verified"`
	AvatarURL   string    `gorm:"type:varchar(255)" json:"avatar_url"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Courses             []Course       `gorm:"foreignKey:MentorUid" json:"courses"`
	CreatedCourses      []Course       `gorm:"foreignKey:CreatedByUid" json:"created_courses,omitempty"`
	TeachingCourses     []Course       `gorm:"many2many:course_mentors;joinForeignKey:MentorUid;joinReferences:CourseUid" json:"teaching_courses"`
	CourseMentorLinks   []CourseMentor `gorm:"foreignKey:MentorUid" json:"course_mentor_links"`
	AssignedCourseLinks []CourseMentor `gorm:"foreignKey:AssignedByUid" json:"assigned_course_links"`
	Enrollments         []Enrollment   `gorm:"foreignKey:UserUid" json:"enrollments"`
	Reviews             []CourseReview `gorm:"foreignKey:UserUid" json:"course_reviews"`
}

// AfterFind otomatis mendekripsi kolom sensitif setelah data dimuat dari database.
// Field uid, email_hash, password, role, is_verified, avatar_url, dan timestamps
// tidak dienkripsi karena bukan data informatif personal atau dibutuhkan apa adanya
// untuk operasi (lookup blind index, hashing password, URL gambar, dsb).
func (u *User) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(&u.Name, &u.Email, &u.Description)
	return nil
}

// BeforeSave otomatis mengenkripsi kolom sensitif sebelum disimpan. Bersifat
// idempotent: jika field sudah berupa ciphertext (kasus service yang sudah
// melakukan Encrypt secara eksplisit), enkripsi ulang dilewati.
func (u *User) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(&u.Name, &u.Email, &u.Description)
}

// AfterSave mengembalikan field model ke plaintext setelah operasi simpan agar
// pemanggil service dapat langsung mengembalikan entitas ke client tanpa perlu
// dekripsi manual. Database tetap menyimpan ciphertext.
func (u *User) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(&u.Name, &u.Email, &u.Description)
	return nil
}
