package dto

// LessonAssignmentSubmissionUpsertRequest is used for JSON bodies (quiz answers and/or text without file).
// For file upload use multipart/form-data with the same field names.
type LessonAssignmentSubmissionUpsertRequest struct {
	PlainText       string      `json:"plain_text"`
	RichText        interface{} `json:"rich_text"`
	FileDescription string      `json:"file_description"`
	QuizAnswers     interface{} `json:"quiz_answers"`
	RemoveFile      bool        `json:"remove_file"`
}

// LessonAssignmentSubmissionGradeRequest is the body for staff grading text assignments (manual).
type LessonAssignmentSubmissionGradeRequest struct {
	ScorePercent float64 `json:"score_percent" binding:"required"`
	Feedback     string  `json:"feedback"`
	Passed       *bool   `json:"passed"`
}
