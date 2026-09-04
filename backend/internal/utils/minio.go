package utils

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client

// InitMinio initializes the MinIO client and creates required buckets
func InitMinio() error {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")
	useSSL := os.Getenv("MINIO_USE_SSL") == "true"

	if endpoint == "" || accessKey == "" || secretKey == "" {
		return fmt.Errorf("MinIO configuration is incomplete")
	}

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return fmt.Errorf("failed to initialize MinIO client: %w", err)
	}

	MinioClient = client

	// Create buckets if they don't exist
	buckets := []string{
		os.Getenv("MINIO_BUCKET_AVATARS"),
		os.Getenv("MINIO_BUCKET_COURSES"),
		os.Getenv("MINIO_BUCKET_INVOICES"),
		os.Getenv("MINIO_BUCKET_ASSIGNMENTS"),
		os.Getenv("MINIO_BUCKET_PAYMENT_METHODS"),
	}

	ctx := context.Background()
	for _, bucket := range buckets {
		if bucket == "" {
			continue
		}
		exists, err := client.BucketExists(ctx, bucket)
		if err != nil {
			return fmt.Errorf("failed to check bucket %s: %w", bucket, err)
		}
		if !exists {
			err = client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{})
			if err != nil {
				return fmt.Errorf("failed to create bucket %s: %w", bucket, err)
			}
			log.Printf("Bucket %s created successfully", bucket)

			// Set bucket policy to public read
			policy := fmt.Sprintf(`{
				"Version": "2012-10-17",
				"Statement": [
					{
						"Effect": "Allow",
						"Principal": {"AWS": ["*"]},
						"Action": ["s3:GetObject"],
						"Resource": ["arn:aws:s3:::%s/*"]
					}
				]
			}`, bucket)
			err = client.SetBucketPolicy(ctx, bucket, policy)
			if err != nil {
				log.Printf("Warning: failed to set public policy for bucket %s: %v", bucket, err)
			}
		}
	}

	log.Println("MinIO initialized successfully")
	return nil
}

// UploadFile mengunggah file dari multipart upload ke MinIO apa adanya
// (tanpa enkripsi). Content-type asli dipertahankan agar browser dapat
// menampilkan file secara inline. URL yang dikembalikan adalah URL langsung
// ke MinIO sehingga frontend dapat mengakses file tanpa melewati backend.
func UploadFile(file *multipart.FileHeader, bucket string) (string, error) {
	if MinioClient == nil {
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	extension := strings.ToLower(filepath.Ext(file.Filename))
	objectName := uuid.New().String() + extension

	if err := putObject(context.Background(), bucket, objectName, src, file.Size, contentType); err != nil {
		return "", err
	}

	return GetPublicURL(bucket, objectName), nil
}

// UploadFileFromReader sama seperti UploadFile tetapi menerima io.Reader dan
// men-stream konten langsung ke MinIO tanpa membuffer seluruh bytes di memory.
func UploadFileFromReader(reader io.Reader, size int64, bucket, filename, contentType string) (string, error) {
	if MinioClient == nil {
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	extension := strings.ToLower(filepath.Ext(filename))
	objectName := uuid.New().String() + extension

	if err := putObject(context.Background(), bucket, objectName, reader, size, contentType); err != nil {
		return "", err
	}

	return GetPublicURL(bucket, objectName), nil
}

// PutObject mengunggah plaintext sebagai object MinIO apa adanya (tanpa
// enkripsi) dengan objectName eksplisit (bukan UUID acak). Berguna untuk kasus
// seperti invoice yang nama filenya disusun dari kombinasi enrollment/user/
// course UID.
func PutObject(ctx context.Context, bucket, objectName string, data []byte, contentType, _ string) error {
	return putObject(ctx, bucket, objectName, bytes.NewReader(data), int64(len(data)), contentType)
}

func putObject(ctx context.Context, bucket, objectName string, reader io.Reader, size int64, contentType string) error {
	if MinioClient == nil {
		return fmt.Errorf("MinIO client is not initialized")
	}

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	opts := minio.PutObjectOptions{ContentType: contentType}

	if _, err := MinioClient.PutObject(ctx, bucket, objectName, reader, size, opts); err != nil {
		return fmt.Errorf("failed to upload file to MinIO: %w", err)
	}
	return nil
}

// DeleteFile deletes a file from MinIO
func DeleteFile(bucket, objectName string) error {
	if MinioClient == nil {
		return fmt.Errorf("MinIO client is not initialized")
	}

	ctx := context.Background()
	err := MinioClient.RemoveObject(ctx, bucket, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete file from MinIO: %w", err)
	}

	return nil
}

// GetPublicURL mengembalikan URL publik untuk sebuah object. Object disimpan
// dalam bentuk plaintext dengan policy bucket public-read, sehingga URL yang
// dikembalikan adalah URL langsung ke MinIO dan dapat diakses frontend
// tanpa melewati backend.
func GetPublicURL(bucket, objectName string) string {
	return GetDirectMinioURL(bucket, objectName)
}

// GetDirectMinioURL mengembalikan URL langsung ke MinIO (tanpa melalui proxy
// backend). Endpoint yang dipakai adalah MINIO_PUBLIC_ENDPOINT (endpoint yang
// dapat dijangkau browser/frontend); bila tidak di-set, fallback ke
// MINIO_ENDPOINT yang dipakai koneksi internal backend.
func GetDirectMinioURL(bucket, objectName string) string {
	endpoint := os.Getenv("MINIO_PUBLIC_ENDPOINT")
	if endpoint == "" {
		endpoint = os.Getenv("MINIO_ENDPOINT")
	}
	useSSL := os.Getenv("MINIO_USE_SSL") == "true"
	protocol := "http"
	if useSSL {
		protocol = "https"
	}
	return fmt.Sprintf("%s://%s/%s/%s", protocol, endpoint, bucket, objectName)
}

// GetBucketAvatars returns the avatars bucket name from env
func GetBucketAvatars() string {
	return os.Getenv("MINIO_BUCKET_AVATARS")
}

// GetBucketCourses returns the courses bucket name from env
func GetBucketCourses() string {
	return os.Getenv("MINIO_BUCKET_COURSES")
}

// GetBucketInvoices returns the invoices bucket name from env
func GetBucketInvoices() string {
	return os.Getenv("MINIO_BUCKET_INVOICES")
}

// GetBucketAssignments returns the lesson-assignment submissions bucket name from env
func GetBucketAssignments() string {
	return os.Getenv("MINIO_BUCKET_ASSIGNMENTS")
}

// GetBucketPaymentMethods returns the payment method images bucket name from env
func GetBucketPaymentMethods() string {
	return os.Getenv("MINIO_BUCKET_PAYMENT_METHODS")
}

// BucketAndObjectFromPublicURL mem-parse URL object MinIO yang dihasilkan
// UploadFile / UploadFileFromReader / GetPublicURL. Mendukung dua format URL:
//
//  1. Direct MinIO: {protocol}://{endpoint}/{bucket}/{objectKey} (format aktif)
//  2. Proxy backend: {BASE_URL}/files/{bucket}/{objectKey} (legacy, saat file
//     masih dienkripsi; tetap didukung agar cleanup data lama tetap bekerja)
//
// Jika path kosong atau URL relatif, parsing tetap dicoba berdasarkan segmen
// path. Berguna untuk operasi cleanup (DeleteFile) yang menerima URL apa adanya.
func BucketAndObjectFromPublicURL(objectURL string) (bucket string, objectKey string, err error) {
	u, err := url.Parse(objectURL)
	if err != nil {
		return "", "", fmt.Errorf("invalid url: %w", err)
	}
	segs := strings.Split(strings.Trim(u.Path, "/"), "/")
	if len(segs) >= 1 && segs[0] == "files" {
		segs = segs[1:]
	}
	if len(segs) < 2 {
		return "", "", fmt.Errorf("url path must contain bucket and object name")
	}
	bucket = segs[0]
	objectKey = strings.Join(segs[1:], "/")
	return bucket, objectKey, nil
}

// NewPutObjectOptions creates a new PutObjectOptions with the specified content type
func NewPutObjectOptions(contentType string) minio.PutObjectOptions {
	return minio.PutObjectOptions{
		ContentType: contentType,
	}
}
