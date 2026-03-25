func (s *InvoiceService) GenerateAndSendInvoice(email string, amountCents int64) (string, error) {

	now := time.Now().UTC()
	invoiceID := uuid.NewString()

	invoiceNumber := fmt.Sprintf(
		"INV-%d-%s",
		now.Year(),
		invoiceID[:8],
	)

	invoice := dto.InvoiceResponse{
		ID:            invoiceID,
		InvoiceNumber: invoiceNumber,
		Email:         email,
		Amount:        amountCents / 100,
		Currency:      "IDR",
		Status:        "PAID",
		CreatedAt:     now,
	}

	// 🔹 PASTIKAN FOLDER ADA
	err := os.MkdirAll("invoices", os.ModePerm)
	if err != nil {
		return "", fmt.Errorf("failed to create invoices folder: %w", err)
	}

	filePath := fmt.Sprintf("invoices/%s.pdf", invoiceID)

	err = utils.GenerateInvoicePDF(invoice, filePath)
	if err != nil {
		return "", fmt.Errorf("failed to generate invoice pdf: %w", err)
	}

	err = s.emailService.SendInvoice(email, filePath)
	if err != nil {
		return "", fmt.Errorf("failed to send invoice email: %w", err)
	}

	return filePath, nil
}