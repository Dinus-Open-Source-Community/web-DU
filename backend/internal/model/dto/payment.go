package dto

// OrderItem represents a single item in the order
type OrderItem struct {
	SKU        string `json:"sku"`
	Name       string `json:"name" binding:"required"`
	Price      int    `json:"price" binding:"required,gt=0"`
	Quantity   int    `json:"quantity" binding:"required,gt=0"`
	ProductURL string `json:"product_url"`
	ImageURL   string `json:"image_url"`
}

// CreatePaymentRequest is the request body for creating a payment
type CreatePaymentRequest struct {
	EnrollmentID *uint       `json:"enrollment_id"`
	Method       string      `json:"method" binding:"required,oneof=PERMATAVA BNIVA BRIVA MANDIRIVA BCAVA MUAMALATVA CIMBVA BSIVA OCBCVA DANAMONVA OVO DANA QRIS2"`
	Amount       int         `json:"amount" binding:"required,gt=0"`
	OrderItems   []OrderItem `json:"order_items" binding:"required,min=1,dive,required"`
	CallbackURL  string      `json:"callback_url"`
	ReturnURL    string      `json:"return_url"`
}

// OrderItemResponse represents order item in response
type OrderItemResponse struct {
	SKU        string `json:"sku"`
	Name       string `json:"name"`
	Price      int    `json:"price"`
	Quantity   int    `json:"quantity"`
	Subtotal   int    `json:"subtotal"`
	ProductURL string `json:"product_url"`
	ImageURL   string `json:"image_url"`
}

// PaymentInstruction represents payment instruction steps
type PaymentInstruction struct {
	Title string   `json:"title"`
	Steps []string `json:"steps"`
}

// CreatePaymentResponse is the response from Tripay API
type CreatePaymentResponse struct {
	Reference            string               `json:"reference"`
	MerchantRef          string               `json:"merchant_ref"`
	PaymentSelectionType string               `json:"payment_selection_type"`
	PaymentMethod        string               `json:"payment_method"`
	PaymentName          string               `json:"payment_name"`
	CustomerName         string               `json:"customer_name"`
	CustomerEmail        string               `json:"customer_email"`
	CustomerPhone        string               `json:"customer_phone"`
	CallbackURL          string               `json:"callback_url"`
	ReturnURL            string               `json:"return_url"`
	Amount               int                  `json:"amount"`
	FeeMerchant          int                  `json:"fee_merchant"`
	FeeCustomer          int                  `json:"fee_customer"`
	TotalFee             int                  `json:"total_fee"`
	AmountReceived       int                  `json:"amount_received"`
	PayCode              string               `json:"pay_code"`
	PayURL               interface{}          `json:"pay_url"`
	CheckoutURL          string               `json:"checkout_url"`
	Status               string               `json:"status"`
	ExpiredTime          int64                `json:"expired_time"`
	OrderItems           []OrderItemResponse  `json:"order_items"`
	Instructions         []PaymentInstruction `json:"instructions"`
	QrString             interface{}          `json:"qr_string"`
	QrURL                interface{}          `json:"qr_url"`
}

// APIResponse wraps the API response
type APIResponse struct {
	Success bool                  `json:"success"`
	Message string                `json:"message"`
	Data    CreatePaymentResponse `json:"data"`
}

// PaymentCallbackRequest represents the callback data from Tripay
type PaymentCallbackRequest struct {
	Reference         string `json:"reference" binding:"required"`
	MerchantRef       string `json:"merchant_ref"`
	PaymentMethod     string `json:"payment_method"`
	PaymentMethodCode string `json:"payment_method_code"`
	TotalAmount       int    `json:"total_amount"`
	FeeMerchant       int    `json:"fee_merchant"`
	FeeCustomer       int    `json:"fee_customer"`
	TotalFee          int    `json:"total_fee"`
	AmountReceived    int    `json:"amount_received"`
	IsClosedPayment   int    `json:"is_closed_payment"`
	Status            string `json:"status" binding:"required"`
	PaidAt            int64  `json:"paid_at"`
	Note              string `json:"note"`
}