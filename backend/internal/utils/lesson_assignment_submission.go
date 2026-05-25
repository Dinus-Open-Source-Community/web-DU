package utils

// MaxLessonAssignmentSubmissionAttachmentBytes is the maximum allowed size for one attachment file when a student submits work for a lesson assignment (enforced on multipart/API handlers). Product rule: 10 MiB per file per lesson assignment submission.
const MaxLessonAssignmentSubmissionAttachmentBytes int64 = 10 * 1024 * 1024
