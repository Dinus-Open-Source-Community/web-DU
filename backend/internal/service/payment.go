package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	TripayAPIURL = "https://tripay.co.id/api-sandbox/transaction/create"
)

// GetNextMerchantRef generates the next merchant reference based on payment count
func GetNextMerchantRef() (string, error) {
	var count int64
	if err := database.DB.Model(&entity.Payment{}).Count(&count).Error; err != nil {
		return "", err
	}

	// Format: INV + count without padding (e.g., INV1, INV2, ...)
	return fmt.Sprintf("INV%d", count+1), nil
}

// GetPendingPaymentByEnrollment gets pending payment for a specific enrollment
func GetPendingPaymentByEnrollment(enrollmentUid uuid.UUID) (*entity.Payment, error) {
	var payment entity.Payment
	if err := database.DB.Where("enrollment_uid = ? AND status = ?", enrollmentUid, entity.PaymentPending).
		First(&payment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // No pending payment found
		}
		return nil, err
	}
	return &payment, nil
}

// GetPaymentByReference gets payment details by reference
func GetPaymentByReference(reference string) (*entity.Payment, error) {
	var payment entity.Payment
	if err := database.DB.Where("transaction_id = ?", reference).First(&payment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("payment not found")
		}
		return nil, err
	}
	return &payment, nil
}

// GetPaymentByEnrollmentID gets payment details by enrollment uid
func GetPaymentByEnrollmentID(enrollmentUid uuid.UUID) (*entity.Payment, error) {
	var payment entity.Payment
	if err := database.DB.Where("enrollment_uid = ?", enrollmentUid).First(&payment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("payment not found")
		}
		return nil, err
	}
	return &payment, nil
}

// CreatePayment creates a new payment via Tripay API.
// req.EnrollmentUid menerima full UUID maupun 8-char prefix.
func CreatePayment(userUid uuid.UUID, req *dto.CreatePaymentRequest) (*dto.APIResponse, error) {
	// Get credentials from env
	merchantCode := os.Getenv("TRIPAY_MERCHANT_CODE")
	privateKey := os.Getenv("TRIPAY_PRIVATE_KEY")
	apiKey := os.Getenv("TRIPAY_API_KEY")

	if merchantCode == "" || privateKey == "" || apiKey == "" {
		return nil, fmt.Errorf("tripay credentials not configured")
	}

	// Get user data
	var user entity.User
	if err := database.DB.First(&user, userUid).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	// Name/Email sudah plaintext via hook User.AfterFind; jangan Decrypt ulang.
	customerName := user.Name
	customerEmail := user.Email

	var enrollmentUidPtr *uuid.UUID
	if req.EnrollmentUid != "" {
		resolved, err := database.ResolveUID("enrollments", req.EnrollmentUid)
		if err != nil {
			return nil, fmt.Errorf("failed to resolve enrollment_uid: %w", err)
		}
		enrollmentUidPtr = &resolved

		var enrollment entity.Enrollment
		if err := database.DB.First(&enrollment, resolved).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return nil, fmt.Errorf("enrollment not found")
			}
			return nil, fmt.Errorf("failed to check enrollment: %w", err)
		}

		// If enrollment is already active, return error
		if enrollment.Status == entity.EnrollmentActive {
			return nil, fmt.Errorf("enrollment is already active, no payment needed")
		}

		pendingPayment, err := GetPendingPaymentByEnrollment(resolved)
		if err != nil {
			return nil, fmt.Errorf("failed to check pending payment: %w", err)
		}

		// If there's a pending payment for this enrollment, return it instead of creating new one
		if pendingPayment != nil {
			// Fetch the full payment data to return as response
			paymentData, err := GetPaymentByReference(pendingPayment.TransactionID)
			if err != nil {
				return nil, fmt.Errorf("failed to get payment data: %w", err)
			}

			return &dto.APIResponse{
				Success: true,
				Message: "Payment already pending for this enrollment",
				Data: dto.CreatePaymentResponse{
					Reference:     paymentData.TransactionID,
					Status:        string(paymentData.Status),
					Amount:        int(paymentData.Amount),
					CustomerName:  customerName,
					CustomerEmail: customerEmail,
				},
			}, nil
		}
	}

	// Get next merchant reference
	merchantRef, err := GetNextMerchantRef()
	if err != nil {
		return nil, fmt.Errorf("failed to generate merchant reference: %w", err)
	}

	// Prepare order items for Tripay
	orderItems := make([]map[string]interface{}, len(req.OrderItems))
	for i, item := range req.OrderItems {
		orderItems[i] = map[string]interface{}{
			"sku":         item.SKU,
			"name":        item.Name,
			"price":       item.Price,
			"quantity":    item.Quantity,
			"product_url": item.ProductURL,
			"image_url":   item.ImageURL,
		}
	}

	// Generate signature
	signature := utils.GeneratePaymentSignature(
		privateKey,
		merchantCode,
		merchantRef,
		req.Amount,
	)

	// Callback URL selalu dari BASE_URL + route webhook Tripay (/payment/callback).
	baseURL := strings.TrimRight(os.Getenv("BASE_URL"), "/")
	if baseURL == "" {
		return nil, fmt.Errorf("BASE_URL not configured")
	}
	callbackURL := baseURL + "/payment/callback"

	returnURL := req.ReturnURL
	if returnURL == "" {
		returnURL = baseURL + "/payment/success"
	}

	// Prepare Tripay request
	tripayReq := map[string]any{
		"method":         req.Method,
		"merchant_ref":   merchantRef,
		"amount":         req.Amount,
		"customer_name":  customerName,
		"customer_email": customerEmail,
		"order_items":    orderItems,
		"callback_url":   callbackURL,
		"return_url":     returnURL,
		"signature":      signature,
	}

	// Convert to JSON
	jsonData, err := json.Marshal(tripayReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Make request to Tripay
	httpReq, err := http.NewRequest("POST", TripayAPIURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	client := &http.Client{Timeout: time.Second * 10}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request to Tripay: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var apiResp dto.APIResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !apiResp.Success {
		return nil, fmt.Errorf("tripay API error: %s", apiResp.Message)
	}

	// Save payment to database
	payment := &entity.Payment{
		EnrollmentUid: enrollmentUidPtr,
		Amount:        float64(req.Amount),
		Method:        entity.PaymentMethod(req.Method),
		Status:        entity.PaymentPending,
		TransactionID: apiResp.Data.Reference,
		CheckoutURL:   apiResp.Data.CheckoutURL,
	}

	if err := database.DB.Create(payment).Error; err != nil {
		return nil, fmt.Errorf("failed to save payment: %w", err)
	}

	return &apiResp, nil
}

// UpdatePaymentStatus updates payment status
func UpdatePaymentStatus(reference string, status entity.PaymentStatus) error {
	return database.DB.Model(&entity.Payment{}).
		Where("transaction_id = ?", reference).
		Update("status", status).
		Update("paid_at", time.Now()).
		Error
}

// HandlePaymentCallback processes payment callback from Tripay
func HandlePaymentCallback(callbackData *dto.PaymentCallbackRequest) error {
	// Map Tripay status to internal payment status
	var status entity.PaymentStatus
	switch callbackData.Status {
	case "PAID":
		status = entity.PaymentSuccess
	case "EXPIRED", "FAILED", "REFUND":
		status = entity.PaymentFailed
	case "UNPAID":
		status = entity.PaymentPending
	default:
		return fmt.Errorf("unknown payment status: %s", callbackData.Status)
	}

	// Update payment status in database
	updateData := map[string]interface{}{
		"status": status,
	}

	// If payment is successful, update paid_at
	if status == entity.PaymentSuccess && callbackData.PaidAt > 0 {
		updateData["paid_at"] = time.Unix(callbackData.PaidAt, 0)
	}

	if err := database.DB.Model(&entity.Payment{}).
		Where("transaction_id = ?", callbackData.Reference).
		Updates(updateData).Error; err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}

	// If payment is successful, activate the enrollment
	if status == entity.PaymentSuccess {
		// Get payment with enrollment_id
		var payment entity.Payment
		if err := database.DB.Where("transaction_id = ?", callbackData.Reference).First(&payment).Error; err != nil {
			return fmt.Errorf("failed to get payment record: %w", err)
		}

		if payment.EnrollmentUid != nil {
			if err := database.DB.Model(&entity.Enrollment{}).
				Where("uid = ?", *payment.EnrollmentUid).
				Update("status", entity.EnrollmentActive).Error; err != nil {
				return fmt.Errorf("failed to update enrollment status: %w", err)
			}
		}
	}

	return nil
}

// @Summary      Create Payment (All Roles)
// @Description  Create a new payment request to Tripay for a course enrollment
// @Tags         Payment
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        payload  body      dto.CreatePaymentRequest  true  "Payment Request"
// @Success      200      {object}  dto.APIResponse            "Payment created successfully"
// @Failure      400      {object}  map[string]any             "Invalid request or validation failed"
// @Failure      401      {object}  map[string]any             "Unauthorized - Invalid or missing JWT token"
// @Failure      500      {object}  map[string]any             "Internal server error"
// @Router       /payment/create [post]
func CreatePaymentFunc(c *gin.Context) {
	userID, exists := c.Get(middleware.UIDCK)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   "user_id not found in context",
		})
		return
	}

	var req dto.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request format",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	response, err := CreatePayment(userID.(uuid.UUID), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Failed to create payment",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment created successfully",
		"data":    response.Data,
		"error":   nil,
	})
}

// @Summary      Get Payment (All Roles)
// @Description  Get payment details by payment reference
// @Tags         Payment
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        reference  query     string          false  "Payment Reference"
// @Param        enrollmentId  query     string      false  "Enrollment UID (full UUID atau 8-char prefix)"
// @Success      200        {object}  map[string]any  "Payment details retrieved successfully"
// @Failure      400        {object}  map[string]any  "Reference parameter is missing"
// @Failure      401        {object}  map[string]any  "Unauthorized - Invalid or missing JWT token"
// @Failure      404        {object}  map[string]any  "Payment not found"
// @Failure      500        {object}  map[string]any  "Internal server error"
// @Router       /payment [get]
func GetPaymentFunc(c *gin.Context) {
	reference := c.Query("reference")
	enrollmentIDStr := c.Query("enrollmentId")

	if reference == "" && enrollmentIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Either reference or enrollmentId parameter is required",
			"data":    nil,
			"error":   "missing query parameters",
		})
		return
	}

	var payment *entity.Payment
	var err error

	if reference != "" {
		payment, err = GetPaymentByReference(reference)
	} else {
		enrollmentUid, err2 := database.ResolveUID("enrollments", enrollmentIDStr)
		if err2 != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid enrollmentId",
				"data":    nil,
				"error":   err2.Error(),
			})
			return
		}
		payment, err = GetPaymentByEnrollmentID(enrollmentUid)
	}

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Payment not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment details retrieved successfully",
		"data":    payment,
		"error":   nil,
	})
}

func PaymentCallbackFunc(c *gin.Context) {
	var callbackData dto.PaymentCallbackRequest
	if err := c.ShouldBindJSON(&callbackData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid callback format",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	privateKey := os.Getenv("TRIPAY_PRIVATE_KEY")
	if privateKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Server misconfiguration: TRIPAY_PRIVATE_KEY not set",
			"data":    nil,
			"error":   "missing TRIPAY_PRIVATE_KEY",
		})
		return
	}

	dataToSign := callbackData.Reference + callbackData.Status + fmt.Sprintf("%v", callbackData.TotalAmount)
	h := utils.HMACSHA256(privateKey, dataToSign)
	if callbackData.Signature != h {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid callback signature",
			"data":    nil,
			"error":   "signature verification failed",
		})
		return
	}

	if err := HandlePaymentCallback(&callbackData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Failed to update payment status",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment status updated successfully",
		"data":    nil,
		"error":   nil,
	})
}
