package dto

type CreateGalleryRequest struct {
	ImageURL string `json:"image_url" form:"image_url" example:"http://galleries.web.garage.localhost:3902/panit1.webp"`
	Caption  string `json:"caption" form:"caption" binding:"required" example:"Tim di balik layar — yang bikin acara jalan tanpa drama."`
	Variant  *int   `json:"variant" form:"variant" example:"3"`
}

type UpdateGalleryRequest struct {
	ImageURL *string `json:"image_url" form:"image_url" example:"http://galleries.web.garage.localhost:3902/panit1.webp"`
	Caption  *string `json:"caption" form:"caption" example:"Tim di balik layar — yang bikin acara jalan tanpa drama."`
	Variant  *int    `json:"variant" form:"variant" example:"3"`
}
