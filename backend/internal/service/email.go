package service

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	Host     string
	Port     int
	Username string
	Password string
}

func NewEmailService() *EmailService {
	return &EmailService{
		Host:     os.Getenv("SMTP_HOST"),
		Port:     587,
		Username: os.Getenv("SMTP_USER"),
		Password: os.Getenv("SMTP_PASS"), // pakai app password
	}
}

func (e *EmailService) SendInvoice(to, pdfPath string) error {

	if e.Host == "" || e.Username == "" || e.Password == "" {
		return fmt.Errorf("smtp configuration missing")
	}

	m := gomail.NewMessage()
	m.SetHeader("From", e.Username)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Your Invoice")
	m.SetBody("text/html", `
	<h3>Pembayaran Berhasil</h3>
	<p>Terima kasih telah melakukan pembayaran.</p>
	<p>Invoice Anda terlampir pada email ini.</p>
	`)
	m.Attach(pdfPath)

	d := gomail.NewDialer(e.Host, e.Port, e.Username, e.Password)
	d.Timeout = 10 * time.Second
	return d.DialAndSend(m)
}
