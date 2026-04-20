package entity

import (
	"time"

	"github.com/google/uuid"
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
	TeachingCourses     []Course       `gorm:"many2many:course_mentors;joinForeignKey:MentorUid;joinReferences:CourseUid" json:"teaching_courses"`
	CourseMentorLinks   []CourseMentor `gorm:"foreignKey:MentorUid" json:"course_mentor_links"`
	AssignedCourseLinks []CourseMentor `gorm:"foreignKey:AssignedByUid" json:"assigned_course_links"`
	Enrollments         []Enrollment   `gorm:"foreignKey:UserUid" json:"enrollments"`
	Reviews             []CourseReview `gorm:"foreignKey:UserUid" json:"course_reviews"`
}
