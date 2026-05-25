package dto

// LessonAssignmentSubmissionGradeRequest is the body for staff grading text assignments (manual).
type LessonAssignmentSubmissionGradeRequest struct {
	ScorePercent float64 `json:"score_percent" binding:"required"`
	Feedback     string  `json:"feedback"`
	Passed       *bool   `json:"passed"`
}
