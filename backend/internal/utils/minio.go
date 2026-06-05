package utils

import (
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

// Konstanta metadata MinIO yang dipakai sistem enkripsi-at-rest. Saat upload
// kita simpan content-type asli + nama file asli sebagai user metadata sehingga
// proxy unduh dapat me-restore kedua atribut tersebut tanpa harus menyimpan
// state tambahan di database.
const (
	minioMetaOriginalContentType = "Original-Content-Type"
	minioMetaOriginalFilename    = "Original-Filename"
	minioMetaEncrypted           = "Doscom-Encrypted"

	// minioStoredContentType selalu dipakai sebagai Content-Type saat menulis
	// object terenkripsi ke MinIO; bytes tersimpan adalah ciphertext biner
	// sehingga tidak punya MIME type yang bermakna.
	minioStoredContentType = "application/octet-stream"
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

// UploadFile mengunggah file dari multipart upload ke MinIO dalam bentuk
// terenkripsi (AES-GCM via EncryptBytes). Content-type asli + nama file asli
// disimpan sebagai user metadata sehingga proxy unduh bisa mengembalikannya
// ketika file diakses kembali. URL yang dikembalikan adalah URL proxy
// backend, BUKAN URL langsung ke MinIO, karena bytes pada object adalah
// ciphertext yang tidak dapat dibaca langsung oleh browser.
func UploadFile(file *multipart.FileHeader, bucket string) (string, error) {
	if MinioClient == nil {
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	plaintext, err := io.ReadAll(src)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	originalContentType := file.Header.Get("Content-Type")
	if originalContentType == "" {
		originalContentType = "application/octet-stream"
	}

	extension := strings.ToLower(filepath.Ext(file.Filename))
	objectName := uuid.New().String() + extension

	if err := putEncryptedObject(context.Background(), bucket, objectName, plaintext, originalContentType, file.Filename); err != nil {
		return "", err
	}

	return BuildFileProxyURL(bucket, objectName), nil
}

// UploadFileFromReader sama seperti UploadFile tetapi menerima io.Reader.
// Konten dibaca penuh ke memory karena AES-GCM membutuhkan seluruh plaintext
// untuk menghasilkan auth tag; tidak cocok untuk stream berukuran sangat besar.
func UploadFileFromReader(reader io.Reader, size int64, bucket, filename, contentType string) (string, error) {
	if MinioClient == nil {
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	plaintext, err := io.ReadAll(reader)
	if err != nil {
		return "", fmt.Errorf("failed to read input stream: %w", err)
	}
	_ = size // ukuran asli tidak relevan setelah bytes ada di memory

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	extension := strings.ToLower(filepath.Ext(filename))
	objectName := uuid.New().String() + extension

	if err := putEncryptedObject(context.Background(), bucket, objectName, plaintext, contentType, filename); err != nil {
		return "", err
	}

	return BuildFileProxyURL(bucket, objectName), nil
}

// PutEncryptedObject mengunggah plaintext sebagai object terenkripsi dengan
// objectName eksplisit (bukan UUID acak). Berguna untuk kasus seperti invoice
// yang nama filenya disusun dari kombinasi enrollment/user/course UID.
func PutEncryptedObject(ctx context.Context, bucket, objectName string, plaintext []byte, originalContentType, originalFilename string) error {
	return putEncryptedObject(ctx, bucket, objectName, plaintext, originalContentType, originalFilename)
}

func putEncryptedObject(ctx context.Context, bucket, objectName string, plaintext []byte, originalContentType, originalFilename string) error {
	if MinioClient == nil {
		return fmt.Errorf("MinIO client is not initialized")
	}

	ciphertext, err := EncryptBytes(plaintext)
	if err != nil {
		return fmt.Errorf("failed to encrypt file: %w", err)
	}

	if originalContentType == "" {
		originalContentType = "application/octet-stream"
	}

	opts := minio.PutObjectOptions{
		ContentType: minioStoredContentType,
		UserMetadata: map[string]string{
			minioMetaOriginalContentType: originalContentType,
			minioMetaOriginalFilename:    originalFilename,
			minioMetaEncrypted:           "1",
		},
	}

	if _, err := MinioClient.PutObject(ctx, bucket, objectName, strings.NewReader(string(ciphertext)), int64(len(ciphertext)), opts); err != nil {
		return fmt.Errorf("failed to upload file to MinIO: %w", err)
	}
	return nil
}

// FetchAndDecryptObject mengambil object dari MinIO dan mendekripsinya bila
// merupakan file terenkripsi (mengandung magic header). File plaintext lawas
// dikembalikan apa adanya untuk menjaga backward compatibility.
//
// Mengembalikan: bytes plaintext, content-type asli (dari user metadata atau
// fallback ke content-type object), nama file asli (untuk Content-Disposition),
// dan error.
func FetchAndDecryptObject(ctx context.Context, bucket, objectKey string) (data []byte, contentType string, originalFilename string, err error) {
	if MinioClient == nil {
		return nil, "", "", fmt.Errorf("MinIO client is not initialized")
	}

	obj, err := MinioClient.GetObject(ctx, bucket, objectKey, minio.GetObjectOptions{})
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to fetch object: %w", err)
	}
	defer obj.Close()

	stat, err := obj.Stat()
	if err != nil {
		return nil, "", "", err
	}

	raw, err := io.ReadAll(obj)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to read object: %w", err)
	}

	plaintext, err := DecryptBytes(raw)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to decrypt object: %w", err)
	}

	originalContentType := stat.UserMetadata[minioMetaOriginalContentType]
	if originalContentType == "" {
		originalContentType = stat.ContentType
	}
	if originalContentType == "" || originalContentType == minioStoredContentType {
		originalContentType = "application/octet-stream"
	}

	return plaintext, originalContentType, stat.UserMetadata[minioMetaOriginalFilename], nil
}

// BuildFileProxyURL menyusun URL proxy backend untuk mengakses object yang
// tersimpan dalam bentuk terenkripsi. Format: {BASE_URL}/files/{bucket}/{key}.
// Frontend harus selalu memakai URL ini, bukan URL langsung ke MinIO.
func BuildFileProxyURL(bucket, objectName string) string {
	base := strings.TrimRight(os.Getenv("BASE_URL"), "/")
	if base == "" {
		// Fallback aman jika BASE_URL belum dikonfigurasi: tetap berikan path
		// relatif sehingga frontend yang di-host satu domain dengan API tetap
		// dapat mengakses file.
		return fmt.Sprintf("/files/%s/%s", bucket, objectName)
	}
	return fmt.Sprintf("%s/files/%s/%s", base, bucket, objectName)
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

// GetPublicURL mengembalikan URL publik untuk sebuah object. Sejak adanya
// enkripsi-at-rest, URL yang dikembalikan adalah URL proxy backend agar
// browser menerima bytes yang sudah didekripsi (object langsung di MinIO
// berisi ciphertext).
func GetPublicURL(bucket, objectName string) string {
	return BuildFileProxyURL(bucket, objectName)
}

// GetDirectMinioURL mengembalikan URL langsung ke MinIO (tanpa melalui proxy).
// Dipakai oleh kode internal yang tidak membutuhkan dekripsi (misalnya saat
// hanya ingin parsing bucket+key dari URL legacy).
func GetDirectMinioURL(bucket, objectName string) string {
	endpoint := os.Getenv("MINIO_ENDPOINT")
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
//  1. Proxy backend: {BASE_URL}/files/{bucket}/{objectKey} (format baru)
//  2. Direct MinIO: {protocol}://{endpoint}/{bucket}/{objectKey} (legacy)
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
