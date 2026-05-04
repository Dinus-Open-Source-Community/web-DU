package utils

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client

func setBucketPublicReadPolicy(client *minio.Client, bucket string) error {
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
	return client.SetBucketPolicy(context.Background(), bucket, policy)
}

func getMinioInternalEndpoint() string {
	if endpoint := strings.TrimSpace(os.Getenv("MINIO_INTERNAL_ENDPOINT")); endpoint != "" {
		return endpoint
	}
	if endpoint := strings.TrimSpace(os.Getenv("MINIO_ENDPOINT")); endpoint != "" {
		return endpoint
	}
	return "minio:9000"
}

func getMinioPublicEndpoint() string {
	if endpoint := strings.TrimSpace(os.Getenv("MINIO_PUBLIC_ENDPOINT")); endpoint != "" {
		return endpoint
	}
	if endpoint := strings.TrimSpace(os.Getenv("MINIO_ENDPOINT")); endpoint != "" {
		return endpoint
	}
	return getMinioInternalEndpoint()
}

// InitMinio initializes the MinIO client and creates required buckets
func InitMinio() error {
	endpoint := getMinioInternalEndpoint()
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
		}

		if err := setBucketPublicReadPolicy(client, bucket); err != nil {
			log.Printf("Warning: failed to set public policy for bucket %s: %v", bucket, err)
		}
	}

	log.Println("MinIO initialized successfully")
	return nil
}

// UploadFile uploads a file to MinIO and returns the object URL
func UploadFile(file *multipart.FileHeader, bucket string) (string, error) {
	if MinioClient == nil {
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Generate unique filename
	extension := strings.ToLower(filepath.Ext(file.Filename))
	objectName := uuid.New().String() + extension

	// Detect content type
	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Upload to MinIO
	ctx := context.Background()
	_, err = MinioClient.PutObject(ctx, bucket, objectName, src, file.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to MinIO: %w", err)
	}

	// Return the object URL
	endpoint := getMinioPublicEndpoint()
	useSSL := os.Getenv("MINIO_USE_SSL") == "true"
	protocol := "http"
	if useSSL {
		protocol = "https"
	}

	objectURL := fmt.Sprintf("%s://%s/%s/%s", protocol, endpoint, bucket, objectName)
	return objectURL, nil
}

// UploadFileFromReader uploads a file from io.Reader to MinIO
func UploadFileFromReader(reader io.Reader, size int64, bucket, filename, contentType string) (string, error) {
	if MinioClient == nil {
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	// Generate unique filename
	extension := strings.ToLower(filepath.Ext(filename))
	objectName := uuid.New().String() + extension

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Upload to MinIO
	ctx := context.Background()
	_, err := MinioClient.PutObject(ctx, bucket, objectName, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to MinIO: %w", err)
	}

	// Return the object URL
	endpoint := getMinioPublicEndpoint()
	useSSL := os.Getenv("MINIO_USE_SSL") == "true"
	protocol := "http"
	if useSSL {
		protocol = "https"
	}

	objectURL := fmt.Sprintf("%s://%s/%s/%s", protocol, endpoint, bucket, objectName)
	return objectURL, nil
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

// GetPublicURL returns the public URL for an object
func GetPublicURL(bucket, objectName string) string {
	endpoint := getMinioPublicEndpoint()
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

// NewPutObjectOptions creates a new PutObjectOptions with the specified content type
func NewPutObjectOptions(contentType string) minio.PutObjectOptions {
	return minio.PutObjectOptions{
		ContentType: contentType,
	}
}
