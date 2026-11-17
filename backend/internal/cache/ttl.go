package cache

import "time"

const (
	CourseCategoriesTTL   = 6 * time.Hour
	CourseTypesTTL        = 6 * time.Hour
	PublicGalleriesTTL    = time.Hour
	PublicMentorsTTL      = 30 * time.Minute
	PublicCoursesTTL      = 15 * time.Minute
	CourseDetailTTL       = 15 * time.Minute
	CourseMentorsTTL      = 15 * time.Minute
	ModulesTTL            = 10 * time.Minute
	LessonContentTTL      = 10 * time.Minute
	AssignmentConfigTTL   = 10 * time.Minute
	AdminKPIsTTL          = time.Minute
	AdminAnalyticsTTL     = 2 * time.Minute
	MentorKPIsTTL         = 30 * time.Second
	MentorSchedulesTTL    = 5 * time.Minute
	AssignmentsTTL        = time.Minute
	CourseRosterTTL       = 2 * time.Minute
	CandidateStudentsTTL  = time.Minute
	UserProfileTTL        = 2 * time.Minute
	CourseProgressTTL     = 30 * time.Second
	StudentAssignmentsTTL = time.Minute
	SubmissionTTL         = 2 * time.Minute
	StaffSubmissionsTTL   = time.Minute
	AdminReviewsTTL       = time.Minute
	AdminQnATTL           = 30 * time.Second
	RedeemDirectoryTTL    = time.Minute
)

const (
	NamespaceModuleList       = "module:list"
	NamespaceModuleDetail     = "module:detail"
	NamespaceLessonDetail     = "lesson:detail"
	NamespaceAssignmentConfig = "lesson:assignment"
)
