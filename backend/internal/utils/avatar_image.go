package utils

import (
	"bytes"
	"fmt"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
)

const MaxAvatarSizeBytes = 5 * 1024 * 1024

var allowedAvatarExts = map[string]struct{}{
	".jpg":  {},
	".jpeg": {},
	".png":  {},
	".gif":  {},
}

// ValidateAndReencodeAvatar reads an uploaded image, checks magic bytes and decodes
// a full image, then re-encodes to strip non-image data (e.g. appended script polyglots).
// Returns clean bytes, filename extension (e.g. ".png"), and Content-Type for MinIO.
func ValidateAndReencodeAvatar(file *multipart.FileHeader) (data []byte, ext string, contentType string, err error) {
	if file == nil {
		return nil, "", "", fmt.Errorf("no file")
	}
	ext0 := strings.ToLower(filepath.Ext(file.Filename))
	if _, ok := allowedAvatarExts[ext0]; !ok {
		return nil, "", "", fmt.Errorf("hanya file gambar (jpg, jpeg, png, gif) yang diizinkan")
	}
	if file.Size > MaxAvatarSizeBytes {
		return nil, "", "", fmt.Errorf("ukuran file melebihi 5MB")
	}
	src, err := file.Open()
	if err != nil {
		return nil, "", "", fmt.Errorf("gagal membaca file: %w", err)
	}
	defer src.Close()

	body, err := io.ReadAll(io.LimitReader(src, MaxAvatarSizeBytes+1))
	if err != nil {
		return nil, "", "", fmt.Errorf("gagal membaca file: %w", err)
	}
	if len(body) > MaxAvatarSizeBytes {
		return nil, "", "", fmt.Errorf("ukuran file melebihi 5MB")
	}

	ct := http.DetectContentType(body)
	if ct != "image/jpeg" && ct != "image/png" && ct != "image/gif" {
		return nil, "", "", fmt.Errorf("file bukan gambar valid (bukan JPEG, PNG, atau GIF)")
	}

	if !extMatchesContentType(ext0, ct) {
		return nil, "", "", fmt.Errorf("ekstensi file tidak sesuai isi gambar")
	}

	if ct == "image/gif" {
		return validateGIFAvatar(ext0, body)
	}

	br := bytes.NewReader(body)
	img, format, err := image.Decode(br)
	if err != nil {
		return nil, "", "", fmt.Errorf("gambar rusak atau bukan file gambar murni: %w", err)
	}
	if br.Len() > 0 {
		return nil, "", "", fmt.Errorf("ditemukan data susulan setelah data gambar")
	}

	if err := checkImageBounds(img); err != nil {
		return nil, "", "", err
	}

	var out bytes.Buffer
	switch format {
	case "jpeg":
		if err = jpeg.Encode(&out, img, &jpeg.Options{Quality: 90}); err != nil {
			return nil, "", "", err
		}
		ext, contentType = ".jpg", "image/jpeg"
	case "png":
		if err = png.Encode(&out, img); err != nil {
			return nil, "", "", err
		}
		ext, contentType = ".png", "image/png"
	case "gif":
		if err = gif.Encode(&out, img, &gif.Options{}); err != nil {
			return nil, "", "", err
		}
		ext, contentType = ".gif", "image/gif"
	default:
		return nil, "", "", fmt.Errorf("format gambar tidak didukung")
	}

	if out.Len() > MaxAvatarSizeBytes {
		return nil, "", "", fmt.Errorf("ukuran hasil proses melebihi 5MB")
	}
	return out.Bytes(), ext, contentType, nil
}

func extMatchesContentType(ext, contentType string) bool {
	switch ext {
	case ".jpg", ".jpeg":
		return contentType == "image/jpeg"
	case ".png":
		return contentType == "image/png"
	case ".gif":
		return contentType == "image/gif"
	default:
		return false
	}
}

func checkImageBounds(img image.Image) error {
	b := img.Bounds()
	const maxDim = 8192
	if b.Dx() > maxDim || b.Dy() > maxDim || b.Dx()*b.Dy() > maxDim*maxDim {
		return fmt.Errorf("dimensi gambar tidak diizinkan")
	}
	return nil
}

// GIF handled separately: image.Decode can leave unread bytes on multi-frame files.
func validateGIFAvatar(_ string, body []byte) (data []byte, ext, contentType string, err error) {
	r := bytes.NewReader(body)
	g, err := gif.DecodeAll(r)
	if err != nil {
		return nil, "", "", fmt.Errorf("file GIF tidak valid: %w", err)
	}
	if r.Len() > 0 {
		return nil, "", "", fmt.Errorf("ditemukan data susulan setelah data gambar")
	}
	if len(g.Image) < 1 {
		return nil, "", "", fmt.Errorf("GIF tanpa frame")
	}
	first := g.Image[0]
	if err := checkImageBounds(first); err != nil {
		return nil, "", "", err
	}
	var out bytes.Buffer
	if err := gif.Encode(&out, first, &gif.Options{}); err != nil {
		return nil, "", "", err
	}
	if out.Len() > MaxAvatarSizeBytes {
		return nil, "", "", fmt.Errorf("ukuran hasil proses melebihi 5MB")
	}
	return out.Bytes(), ".gif", "image/gif", nil
}
