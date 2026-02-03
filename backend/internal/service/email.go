package service

import "gopkg.in/gomail.v2"

type EmailService struct {
	Host     string
	Port     int
	Username string
	Password string
}

func NewEmailService() *EmailService {
	return &EmailService{
		Host:     "smtp.gmail.com",
		Port:     587,
		Username: "your_email@gmail.com",
		Password: "APP_PASSWORD", // pakai app password
	}
}

func (e *EmailService) SendInvoice(to, pdfPath string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", e.Username)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Your Invoice")
	m.SetBody("text/plain", "Terima kasih atas pembayaran Anda. Invoice terlampir.")
	m.Attach(pdfPath)

	d := gomail.NewDialer(e.Host, e.Port, e.Username, e.Password)
	return d.DialAndSend(m)
}
