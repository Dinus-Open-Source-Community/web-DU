package service

import (
	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

const maxGalleryImageSizeBytes = 5 << 20 // 5 MiB

func galleryItemResponse(item entity.Gallery) gin.H {
	return gin.H{
		"uid":        item.Uid,
		"image_url":  item.ImageURL,
		"caption":    item.Caption,
		"variant":    item.Variant,
		"created_at": item.CreatedAt,
		"updated_at": item.UpdatedAt,
	}
}

func parseGalleryVariantString(raw string) (*int, bool, string) {
	trimmed := strings.TrimSpace(strings.ToLower(raw))
	if trimmed == "" || trimmed == "auto" || trimmed == "null" {
		return nil, true, ""
	}
	v, err := strconv.Atoi(trimmed)
	if err != nil || v < 0 || v > 5 {
		return nil, false, "Varian kartu harus bernilai 0 sampai 5 atau auto"
	}
	return &v, true, ""
}

func validateGalleryUploadFile(file *multipart.FileHeader) string {
	if file.Size <= 0 {
		return "Berkas foto kosong"
	}
	if file.Size > maxGalleryImageSizeBytes {
		return "Ukuran berkas foto melebihi batas maksimal 5MB"
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif":
		return ""
	default:
		return "Format berkas tidak didukung (gunakan PNG, JPG, JPEG, atau WebP)"
	}
}

func firstGalleryFormFile(c *gin.Context) (*multipart.FileHeader, error) {
	for _, field := range []string{"image", "file", "photo"} {
		f, err := c.FormFile(field)
		if err == nil && f != nil {
			return f, nil
		}
	}
	return nil, http.ErrMissingFile
}

func deleteOldGalleryObjectIfManaged(imageURL string) {
	if strings.TrimSpace(imageURL) == "" {
		return
	}
	bucket, key, err := utils.BucketAndObjectFromPublicURL(imageURL)
	if err != nil || bucket == "" || key == "" {
		return
	}
	if bucket == utils.GetBucketGalleries() {
		_ = utils.DeleteFile(bucket, key)
	}
}

// @Summary      Get all gallery items (Public)
// @Description  Public endpoint to retrieve gallery documentation items with pagination, search, and variant filtering.
// @Tags         Gallery
// @Produce      json
// @Param        page      query  int     false  "Page number (default: 1)"
// @Param        per_page  query  int     false  "Items per page (default: 15, max: 100)"
// @Param        search    query  string  false  "Search by caption"
// @Param        variant   query  string  false  "Filter by variant (all, auto, 0..5)"
// @Success      200  {object}  map[string]any  "Galleries retrieved successfully"
// @Failure      500  {object}  map[string]any  "Failed to retrieve galleries"
// @Router       /galleries [get]
func GetAllGalleriesFunc(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "15")
	searchFilter := strings.TrimSpace(c.Query("search"))
	if searchFilter == "" {
		searchFilter = strings.TrimSpace(c.Query("caption"))
	}
	variantFilter := strings.TrimSpace(strings.ToLower(c.Query("variant")))

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 {
		perPage = 15
	}
	const maxPerPage = 100
	if perPage > maxPerPage {
		perPage = maxPerPage
	}

	db := database.DB.Model(&entity.Gallery{})
	if searchFilter != "" {
		db = db.Where("LOWER(caption) LIKE ?", "%"+strings.ToLower(searchFilter)+"%")
	}
	if variantFilter != "" && variantFilter != "all" {
		if variantFilter == "auto" || variantFilter == "null" {
			db = db.Where("variant IS NULL")
		} else if vNum, err := strconv.Atoi(variantFilter); err == nil && vNum >= 0 && vNum <= 5 {
			db = db.Where("variant = ?", vNum)
		}
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menghitung total foto galeri",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var items []entity.Gallery
	offset := (page - 1) * perPage
	if err := db.Order("created_at DESC").Limit(perPage).Offset(offset).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data galeri",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	data := make([]gin.H, 0, len(items))
	for _, item := range items {
		data = append(data, galleryItemResponse(item))
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))
	if totalPages < 1 {
		totalPages = 1
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data galeri berhasil diambil",
		"data": gin.H{
			"galleries": data,
			"meta": gin.H{
				"total":        total,
				"per_page":     perPage,
				"current_page": page,
				"total_pages":  totalPages,
			},
		},
		"error": nil,
	})
}

// @Summary      Get gallery item by ID (Public)
// @Description  Public endpoint to retrieve a single gallery item by uid.
// @Tags         Gallery
// @Produce      json
// @Param        id   path      string  true  "Gallery UID"
// @Success      200  {object}  map[string]any  "Gallery item retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid gallery uid"
// @Failure      404  {object}  map[string]any  "Gallery item not found"
// @Router       /galleries/{id} [get]
func GetGalleryByIDFunc(c *gin.Context) {
	id, ok := resolveUIDParam(c, "galleries", "id", "gallery")
	if !ok {
		return
	}

	var item entity.Gallery
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Foto galeri tidak ditemukan",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Detail foto galeri berhasil diambil",
		"data":    galleryItemResponse(item),
		"error":   nil,
	})
}

// @Summary      Create gallery item (Super Admin & Admin)
// @Description  Upload photo to Garage S3 and create a new gallery documentation item.
// @Tags         Gallery
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        image    formData  file    true   "Gallery photo file (PNG, JPG, JPEG, WebP, max 5MB)"
// @Param        caption  formData  string  true   "Photo story caption (max 200 chars)"
// @Param        variant  formData  string  false  "Scrapbook card variant (auto or 0..5)"
// @Success      201  {object}  map[string]any  "Gallery item created successfully"
// @Failure      400  {object}  map[string]any  "Invalid input"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /galleries [post]
func PostAdminGalleryFunc(c *gin.Context) {
	adminUser, ok := requireAdmin(c)
	if !ok {
		return
	}

	contentType := c.ContentType()
	var imageURL string
	var caption string
	var variant *int

	if strings.HasPrefix(contentType, "application/json") {
		var req dto.CreateGalleryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Input tidak valid",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		caption = strings.TrimSpace(req.Caption)
		imageURL = strings.TrimSpace(req.ImageURL)
		if req.Variant != nil {
			if *req.Variant < 0 || *req.Variant > 5 {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "Varian kartu harus bernilai 0 sampai 5",
					"data":    nil,
					"error":   nil,
				})
				return
			}
			v := *req.Variant
			variant = &v
		}
	} else {
		caption = strings.TrimSpace(c.PostForm("caption"))
		parsedVariant, validVariant, errMsg := parseGalleryVariantString(c.PostForm("variant"))
		if !validVariant {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": errMsg,
				"data":    nil,
				"error":   nil,
			})
			return
		}
		variant = parsedVariant

		file, err := firstGalleryFormFile(c)
		if err == nil && file != nil {
			if valErr := validateGalleryUploadFile(file); valErr != "" {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": valErr,
					"data":    nil,
					"error":   nil,
				})
				return
			}
			bucket := utils.GetBucketGalleries()
			uploadedURL, upErr := utils.UploadFile(file, bucket)
			if upErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Gagal mengunggah foto ke Garage S3 Storage",
					"data":    nil,
					"error":   upErr.Error(),
				})
				return
			}
			imageURL = uploadedURL
		} else {
			imageURL = strings.TrimSpace(c.PostForm("image_url"))
		}
	}

	if caption == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Caption cerita wajib diisi",
			"data":    nil,
			"error":   nil,
		})
		return
	}
	if len([]rune(caption)) > 200 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Caption maksimal 200 karakter",
			"data":    nil,
			"error":   nil,
		})
		return
	}
	if imageURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Berkas foto wajib diunggah",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	createdBy := adminUser.Uid
	gallery := entity.Gallery{
		ImageURL:     imageURL,
		Caption:      caption,
		Variant:      variant,
		CreatedByUid: &createdBy,
	}

	if err := database.DB.Create(&gallery).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan foto galeri",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Foto dokumentasi berhasil ditambahkan ke galeri",
		"data":    galleryItemResponse(gallery),
		"error":   nil,
	})
}

// @Summary      Update gallery item (Super Admin & Admin)
// @Description  Update gallery photo, caption, or variant.
// @Tags         Gallery
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string  true   "Gallery UID"
// @Param        image    formData  file    false  "New gallery photo file (optional)"
// @Param        caption  formData  string  false  "Photo story caption"
// @Param        variant  formData  string  false  "Scrapbook card variant (auto or 0..5)"
// @Success      200  {object}  map[string]any  "Gallery item updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid input"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Gallery item not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /galleries/{id} [put]
func UpdateAdminGalleryFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	id, ok := resolveUIDParam(c, "galleries", "id", "gallery")
	if !ok {
		return
	}

	var gallery entity.Gallery
	if err := database.DB.First(&gallery, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Foto galeri tidak ditemukan",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	contentType := c.ContentType()
	if strings.HasPrefix(contentType, "application/json") {
		rawBytes, err := c.GetRawData()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Input tidak valid",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		var rawMap map[string]json.RawMessage
		_ = json.Unmarshal(rawBytes, &rawMap)

		var req dto.UpdateGalleryRequest
		if err := json.Unmarshal(rawBytes, &req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Input JSON tidak valid",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		if req.Caption != nil {
			trimmed := strings.TrimSpace(*req.Caption)
			if trimmed == "" {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "Caption tidak boleh kosong",
					"data":    nil,
					"error":   nil,
				})
				return
			}
			if len([]rune(trimmed)) > 200 {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "Caption maksimal 200 karakter",
					"data":    nil,
					"error":   nil,
				})
				return
			}
			gallery.Caption = trimmed
		}
		if req.ImageURL != nil && strings.TrimSpace(*req.ImageURL) != "" {
			gallery.ImageURL = strings.TrimSpace(*req.ImageURL)
		}
		if _, hasVariant := rawMap["variant"]; hasVariant {
			if req.Variant == nil {
				gallery.Variant = nil
			} else {
				if *req.Variant < 0 || *req.Variant > 5 {
					c.JSON(http.StatusBadRequest, gin.H{
						"success": false,
						"message": "Varian kartu harus bernilai 0 sampai 5",
						"data":    nil,
						"error":   nil,
					})
					return
				}
				v := *req.Variant
				gallery.Variant = &v
			}
		}
	} else {
		if captionRaw, exists := c.GetPostForm("caption"); exists {
			trimmed := strings.TrimSpace(captionRaw)
			if trimmed == "" {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "Caption cerita tidak boleh kosong",
					"data":    nil,
					"error":   nil,
				})
				return
			}
			if len([]rune(trimmed)) > 200 {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "Caption maksimal 200 karakter",
					"data":    nil,
					"error":   nil,
				})
				return
			}
			gallery.Caption = trimmed
		}

		if variantRaw, exists := c.GetPostForm("variant"); exists {
			parsedVariant, validVariant, errMsg := parseGalleryVariantString(variantRaw)
			if !validVariant {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": errMsg,
					"data":    nil,
					"error":   nil,
				})
				return
			}
			gallery.Variant = parsedVariant
		}

		file, err := firstGalleryFormFile(c)
		if err == nil && file != nil {
			if valErr := validateGalleryUploadFile(file); valErr != "" {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": valErr,
					"data":    nil,
					"error":   nil,
				})
				return
			}
			bucket := utils.GetBucketGalleries()
			uploadedURL, upErr := utils.UploadFile(file, bucket)
			if upErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Gagal mengunggah foto ke Garage S3 Storage",
					"data":    nil,
					"error":   upErr.Error(),
				})
				return
			}
			oldURL := gallery.ImageURL
			gallery.ImageURL = uploadedURL
			deleteOldGalleryObjectIfManaged(oldURL)
		}
	}

	if err := database.DB.Save(&gallery).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memperbarui foto galeri",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Dokumentasi galeri berhasil diperbarui",
		"data":    galleryItemResponse(gallery),
		"error":   nil,
	})
}

// @Summary      Delete gallery item (Super Admin & Admin)
// @Description  Delete a gallery item by uid and remove its object from Garage S3.
// @Tags         Gallery
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Gallery UID"
// @Success      200  {object}  map[string]any  "Gallery item deleted successfully"
// @Failure      400  {object}  map[string]any  "Invalid gallery uid"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Gallery item not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /galleries/{id} [delete]
func DeleteAdminGalleryFunc(c *gin.Context) {
	if _, ok := requireAdmin(c); !ok {
		return
	}

	id, ok := resolveUIDParam(c, "galleries", "id", "gallery")
	if !ok {
		return
	}

	var gallery entity.Gallery
	if err := database.DB.First(&gallery, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Foto galeri tidak ditemukan",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	oldURL := gallery.ImageURL
	if err := database.DB.Delete(&gallery).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menghapus foto galeri",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	deleteOldGalleryObjectIfManaged(oldURL)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Foto galeri berhasil dihapus",
		"data":    nil,
		"error":   nil,
	})
}
