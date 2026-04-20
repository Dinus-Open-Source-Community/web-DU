package dto

// LessonAssignmentUpsertRequest represents payload to create/update lesson assignment.
type LessonAssignmentUpsertRequest struct {
	Title                    string      `json:"title" binding:"required"`
	TaskType                 string      `json:"task_type" binding:"required"`
	TaskDescription          interface{} `json:"task_description"`
	Quiz                     interface{} `json:"quiz"`
	AllowFileSubmission      bool        `json:"allow_file_submission"`
	AllowPlainTextSubmission bool        `json:"allow_plain_text_submission"`
	AllowRichTextSubmission  bool        `json:"allow_rich_text_submission"`
	RequireFileDescription   bool        `json:"require_file_description"`
	InstructionAttachments   interface{} `json:"instruction_attachments"`
	DeadlineAt               string      `json:"deadline_at" binding:"required"` // RFC3339 format
	Status                   string      `json:"status" binding:"required"`
	AutoCloseAfterDeadline   bool        `json:"auto_close_after_deadline"`
	AllowResubmit            bool        `json:"allow_resubmit"`
	MaxResubmitCount         *int        `json:"max_resubmit_count"`
}
