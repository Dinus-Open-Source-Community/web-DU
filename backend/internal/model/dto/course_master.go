package dto

type CreateCourseCategoryRequest struct {
	Name        string `json:"name" binding:"required" example:"Web Development"`
	Description string `json:"description" example:"Kategori course pengembangan web"`
	IsActive    *bool  `json:"is_active" example:"true"`
}

type UpdateCourseCategoryRequest struct {
	Name        *string `json:"name" example:"Web Development"`
	Description *string `json:"description" example:"Kategori course pengembangan web"`
	IsActive    *bool   `json:"is_active" example:"true"`
}

type CreateClassTypeRequest struct {
	Name        string `json:"name" binding:"required" example:"Bootcamp"`
	Description string `json:"description" example:"Kelas intensif berbasis project"`
	IsActive    *bool  `json:"is_active" example:"true"`
}

type UpdateClassTypeRequest struct {
	Name        *string `json:"name" example:"Bootcamp"`
	Description *string `json:"description" example:"Kelas intensif berbasis project"`
	IsActive    *bool   `json:"is_active" example:"true"`
}
