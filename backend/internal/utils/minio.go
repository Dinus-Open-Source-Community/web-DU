package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client

func envFirst(keys ...string) string {
	for _, k := range keys {
		if v := strings.TrimSpace(os.Getenv(k)); v != "" {
			return v
		}
	}
	return ""
}

func envFirstDefault(defaultVal string, keys ...string) string {
	if v := envFirst(keys...); v != "" {
		return v
	}
	return defaultVal
}

// InitMinio initializes the Garage S3 (or S3-compatible) client and creates required buckets.
func InitMinio() error {
	endpoint := envFirst("GARAGE_ENDPOINT", "MINIO_ENDPOINT")
	accessKey := envFirst("GARAGE_ACCESS_KEY", "MINIO_ACCESS_KEY")
	secretKey := envFirst("GARAGE_SECRET_KEY", "MINIO_SECRET_KEY")
	region := envFirstDefault("garage", "GARAGE_REGION", "MINIO_REGION")
	useSSL := envFirst("GARAGE_USE_SSL", "MINIO_USE_SSL") == "true"

	if endpoint == "" || accessKey == "" || secretKey == "" {
		return fmt.Errorf("Garage S3 configuration is incomplete (endpoint/access_key/secret_key required)")
	}

	client, err := minio.New(endpoint, &minio.Options{
		Creds:        credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure:       useSSL,
		Region:       region,
		BucketLookup: minio.BucketLookupPath,
	})
	if err != nil {
		return fmt.Errorf("failed to initialize Garage S3 client: %w", err)
	}

	MinioClient = client

	buckets := []string{
		GetBucketAvatars(),
		GetBucketCourses(),
		GetBucketAssignments(),
		GetBucketGalleries(),
	}

	ctx := context.Background()
	for _, bucket := range buckets {
		if bucket == "" {
			continue
		}
		var exists bool
		var checkErr error
		for attempt := 1; attempt <= 10; attempt++ {
			exists, checkErr = client.BucketExists(ctx, bucket)
			if checkErr == nil {
				break
			}
			log.Printf("[Garage S3] Waiting for S3 endpoint (%d/10) checking bucket %s: %v", attempt, bucket, checkErr)
			time.Sleep(1 * time.Second)
		}
		if checkErr != nil {
			return fmt.Errorf("failed to check bucket %s: %w", bucket, checkErr)
		}
		if !exists {
			err = client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{Region: region})
			if err != nil {
				return fmt.Errorf("failed to create bucket %s: %w", bucket, err)
			}
			log.Printf("Bucket %s created successfully in Garage S3", bucket)
		}
		// Enable Garage website access so objects can be read publicly via s3_web
		if err := enableGarageBucketWebsite(ctx, bucket); err != nil {
			log.Printf("Notice: could not enable Garage website access for bucket %s: %v", bucket, err)
		}
	}

	log.Println("Garage S3 storage initialized successfully")
	return nil
}

// enableGarageBucketWebsite ensures a bucket has a global alias and public static website access enabled via Garage Admin API v2.
func enableGarageBucketWebsite(ctx context.Context, bucketAlias string) error {
	adminEndpoint := strings.TrimRight(envFirst("GARAGE_ADMIN_ENDPOINT"), "/")
	adminToken := envFirst("GARAGE_ADMIN_TOKEN")
	if adminEndpoint == "" || adminToken == "" {
		return nil
	}

	httpClient := &http.Client{Timeout: 5 * time.Second}

	listURL := fmt.Sprintf("%s/v2/ListBuckets", adminEndpoint)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, listURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+adminToken)

	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("ListBuckets status %d: %s", resp.StatusCode, string(body))
	}

	var buckets []struct {
		ID            string   `json:"id"`
		GlobalAliases []string `json:"globalAliases"`
		LocalAliases  []struct {
			AccessKeyID string `json:"accessKeyId"`
			Alias       string `json:"alias"`
		} `json:"localAliases"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&buckets); err != nil {
		return err
	}

	var bucketID string
	hasGlobalAlias := false
	for _, b := range buckets {
		for _, ga := range b.GlobalAliases {
			if ga == bucketAlias {
				bucketID = b.ID
				hasGlobalAlias = true
				break
			}
		}
		if bucketID != "" {
			break
		}
		for _, la := range b.LocalAliases {
			if la.Alias == bucketAlias {
				bucketID = b.ID
				break
			}
		}
	}
	if bucketID == "" {
		return fmt.Errorf("bucket %s not found in ListBuckets", bucketAlias)
	}

	if !hasGlobalAlias {
		aliasPayload, _ := json.Marshal(map[string]string{
			"bucketId":    bucketID,
			"globalAlias": bucketAlias,
		})
		aliasReq, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/v2/AddBucketAlias", adminEndpoint), bytes.NewReader(aliasPayload))
		if err == nil {
			aliasReq.Header.Set("Authorization", "Bearer "+adminToken)
			aliasReq.Header.Set("Content-Type", "application/json")
			if aliasResp, doErr := httpClient.Do(aliasReq); doErr == nil {
				_ = aliasResp.Body.Close()
			}
		}
	}

	payload := []byte(`{"websiteAccess":{"enabled":true,"indexDocument":"index.html","errorDocument":null}}`)
	updateURL := fmt.Sprintf("%s/v2/UpdateBucket?id=%s", adminEndpoint, url.QueryEscape(bucketID))
	upReq, err := http.NewRequestWithContext(ctx, http.MethodPost, updateURL, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	upReq.Header.Set("Authorization", "Bearer "+adminToken)
	upReq.Header.Set("Content-Type", "application/json")

	upResp, err := httpClient.Do(upReq)
	if err != nil {
		return err
	}
	defer upResp.Body.Close()

	if upResp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(upResp.Body)
		return fmt.Errorf("UpdateBucket status %d: %s", upResp.StatusCode, string(body))
	}

	log.Printf("Garage website access enabled for bucket %s (%s)", bucketAlias, bucketID)
	return nil
}

// UploadFile mengunggah file dari multipart upload ke Garage S3 apa adanya.
func UploadFile(file *multipart.FileHeader, bucket string) (string, error) {
	if MinioClient == nil {
		return "", fmt.Errorf("Garage S3 client is not initialized")
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

// UploadFileFromReader sama seperti UploadFile tetapi menerima io.Reader.
func UploadFileFromReader(reader io.Reader, size int64, bucket, filename, contentType string) (string, error) {
	if MinioClient == nil {
		return "", fmt.Errorf("Garage S3 client is not initialized")
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

// PutObject mengunggah plaintext sebagai object S3 dengan objectName eksplisit.
func PutObject(ctx context.Context, bucket, objectName string, data []byte, contentType, _ string) error {
	return putObject(ctx, bucket, objectName, bytes.NewReader(data), int64(len(data)), contentType)
}

func putObject(ctx context.Context, bucket, objectName string, reader io.Reader, size int64, contentType string) error {
	if MinioClient == nil {
		return fmt.Errorf("Garage S3 client is not initialized")
	}

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	opts := minio.PutObjectOptions{ContentType: contentType}

	if _, err := MinioClient.PutObject(ctx, bucket, objectName, reader, size, opts); err != nil {
		return fmt.Errorf("failed to upload file to Garage S3: %w", err)
	}
	return nil
}

// DeleteFile deletes a file from Garage S3
func DeleteFile(bucket, objectName string) error {
	if MinioClient == nil {
		return fmt.Errorf("Garage S3 client is not initialized")
	}

	ctx := context.Background()
	err := MinioClient.RemoveObject(ctx, bucket, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete file from Garage S3: %w", err)
	}

	return nil
}

// GetPublicURL mengembalikan URL publik untuk sebuah object di Garage S3.
func GetPublicURL(bucket, objectName string) string {
	return GetDirectMinioURL(bucket, objectName)
}

// GetDirectMinioURL mengembalikan URL publik langsung ke Garage S3 Web endpoint
// ({protocol}://{bucket}.{GARAGE_WEB_ENDPOINT}/{objectName}) atau fallback ke path-style endpoint.
func GetDirectMinioURL(bucket, objectName string) string {
	useSSL := envFirst("GARAGE_USE_SSL", "MINIO_USE_SSL") == "true"
	protocol := "http"
	if useSSL {
		protocol = "https"
	}

	webEndpoint := strings.TrimPrefix(envFirst("GARAGE_WEB_ENDPOINT"), ".")
	if webEndpoint != "" {
		return fmt.Sprintf("%s://%s.%s/%s", protocol, bucket, webEndpoint, objectName)
	}

	endpoint := envFirst("GARAGE_PUBLIC_ENDPOINT", "MINIO_PUBLIC_ENDPOINT", "GARAGE_ENDPOINT", "MINIO_ENDPOINT")
	return fmt.Sprintf("%s://%s/%s/%s", protocol, endpoint, bucket, objectName)
}

func GetBucketAvatars() string {
	return envFirstDefault("avatars", "GARAGE_BUCKET_AVATARS", "MINIO_BUCKET_AVATARS")
}

func GetBucketCourses() string {
	return envFirstDefault("courses", "GARAGE_BUCKET_COURSES", "MINIO_BUCKET_COURSES")
}

func GetBucketAssignments() string {
	return envFirstDefault("lesson-assignments", "GARAGE_BUCKET_ASSIGNMENTS", "MINIO_BUCKET_ASSIGNMENTS")
}

func GetBucketGalleries() string {
	return envFirstDefault("galleries", "GARAGE_BUCKET_GALLERIES", "MINIO_BUCKET_GALLERIES")
}

// BucketAndObjectFromPublicURL mem-parse URL object Garage S3 / MinIO:
//  1. Garage s3_web virtual-host: {protocol}://{bucket}.{GARAGE_WEB_ENDPOINT}/{objectKey}
//  2. Direct S3 path-style: {protocol}://{endpoint}/{bucket}/{objectKey}
//  3. Proxy backend: {BASE_URL}/files/{bucket}/{objectKey}
func BucketAndObjectFromPublicURL(objectURL string) (bucket string, objectKey string, err error) {
	u, err := url.Parse(objectURL)
	if err != nil {
		return "", "", fmt.Errorf("invalid url: %w", err)
	}

	trimmedPath := strings.Trim(u.Path, "/")
	if trimmedPath == "" {
		return "", "", fmt.Errorf("url path is empty")
	}

	webEndpoint := strings.TrimPrefix(envFirst("GARAGE_WEB_ENDPOINT"), ".")
	if webEndpoint != "" && strings.HasSuffix(u.Host, "."+webEndpoint) {
		b := strings.TrimSuffix(u.Host, "."+webEndpoint)
		if b != "" && !strings.Contains(b, ".") {
			return b, trimmedPath, nil
		}
	}
	if strings.Contains(u.Hostname(), ".web.garage.") || strings.HasSuffix(u.Hostname(), ".web.localhost") {
		parts := strings.SplitN(u.Hostname(), ".", 2)
		if len(parts) == 2 && parts[0] != "" {
			return parts[0], trimmedPath, nil
		}
	}

	segs := strings.Split(trimmedPath, "/")
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
