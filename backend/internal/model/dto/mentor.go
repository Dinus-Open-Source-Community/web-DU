package dto

// MentorUids menerima full UUID maupun 8-char prefix per item; service akan
// menyelesaikan nilai tersebut ke full uuid via database.ResolveUIDs.
type AssignMentorsToCourseRequest struct {
	MentorUids []string `json:"mentor_uids" binding:"required,min=1,dive,required"`
}
