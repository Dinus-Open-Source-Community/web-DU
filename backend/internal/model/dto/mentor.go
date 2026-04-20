package dto

import "github.com/google/uuid"

type AssignMentorsToCourseRequest struct {
	MentorUids []uuid.UUID `json:"mentor_uids" binding:"required,min=1,dive,required"`
}
