package dto

// CourseUid menerima full UUID (36 char) maupun 8-char prefix.
// Service akan menyelesaikannya menjadi full uuid via database.ResolveUID.
type CreateModuleRequest struct {
	CourseUid  string `json:"course_uid" binding:"required" example:"550e8400"`
	Title      string `json:"title" binding:"required" example:"Module 1"`
	OrderIndex int    `json:"order_index" binding:"required" example:"1"`
}

type UpdateModuleRequest struct {
	Title      string `json:"title" example:"Updated Module 1"`
	OrderIndex int    `json:"order_index" example:"2"`
}
