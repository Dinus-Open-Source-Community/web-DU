package mailer

import (
	"crypto/tls"
	_ "embed"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"os"
	"strings"
	"sync"
	"time"
)

//go:embed templates/otp_email.html
var otpEmailHTML string

type Mailer struct {
	host        string
	port        string
	user        string
	pass        string
	from        string
	fromName    string
	implicitTLS bool
}

var (
	defaultMailer *Mailer
	mailerOnce    sync.Once
)

// GetMailer returns a singleton Mailer instance initialized from env.
func GetMailer() *Mailer {
	mailerOnce.Do(func() {
		host := os.Getenv("MAIL_HOST")
		port := os.Getenv("MAIL_PORT")
		user := os.Getenv("MAIL_USERNAME")
		pass := os.Getenv("MAIL_PASSWORD")
		from := os.Getenv("MAIL_FROM_ADDRESS")
		fromName := os.Getenv("MAIL_FROM_NAME")
		encryption := os.Getenv("MAIL_ENCRYPTION")

		if host == "" {
			host = "smtp.gmail.com"
		}
		if port == "" {
			port = "465"
		}
		if from == "" {
			from = user
		}
		if fromName == "" {
			fromName = "DOSCOM University"
		}

		implicitTLS := port == "465" || strings.EqualFold(encryption, "ssl")
		defaultMailer = &Mailer{
			host:        host,
			port:        port,
			user:        user,
			pass:        pass,
			from:        from,
			fromName:    fromName,
			implicitTLS: implicitTLS,
		}
	})
	return defaultMailer
}

func (m *Mailer) Configured() bool {
	return m.user != "" && m.pass != ""
}

// normalizeCRLF ensures CRLF line endings required by SMTP standards.
func normalizeCRLF(s string) string {
	return strings.ReplaceAll(strings.ReplaceAll(s, "\r\n", "\n"), "\n", "\r\n")
}

// SendOTP sends an email containing the OTP code.
func (m *Mailer) SendOTP(to, name, code string, expiresMinutes int) error {
	if !m.Configured() {
		log.Printf("[mailer] SMTP not configured. OTP code for %s (%s): %s", to, name, code)
		return nil
	}

	body := otpEmailHTML
	body = strings.ReplaceAll(body, "{{.Name}}", name)
	body = strings.ReplaceAll(body, "{{.Code}}", code)
	body = strings.ReplaceAll(body, "{{.ExpiresMinutes}}", fmt.Sprintf("%d", expiresMinutes))

	fromHeader := m.from
	if m.fromName != "" {
		fromHeader = fmt.Sprintf("%s <%s>", m.fromName, m.from)
	}

	subject := "Kode Verifikasi Akun DOSCOM University"

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		fromHeader, to, subject, body)
	msg = normalizeCRLF(msg)

	addr := fmt.Sprintf("%s:%s", m.host, m.port)
	auth := smtp.PlainAuth("", m.user, m.pass, m.host)

	if m.implicitTLS {
		conn, err := net.DialTimeout("tcp", addr, 10*time.Second)
		if err != nil {
			log.Printf("[mailer] DialTimeout failed: %v", err)
			return err
		}
		tlsConn := tls.Client(conn, &tls.Config{ServerName: m.host})
		defer tlsConn.Close()

		client, err := smtp.NewClient(tlsConn, m.host)
		if err != nil {
			log.Printf("[mailer] NewClient failed: %v", err)
			return err
		}
		defer client.Quit()

		if err := client.Auth(auth); err != nil {
			log.Printf("[mailer] client.Auth failed: %v", err)
			return err
		}
		if err := client.Mail(m.from); err != nil {
			log.Printf("[mailer] client.Mail failed: %v", err)
			return err
		}
		if err := client.Rcpt(to); err != nil {
			log.Printf("[mailer] client.Rcpt failed: %v", err)
			return err
		}
		w, err := client.Data()
		if err != nil {
			log.Printf("[mailer] client.Data failed: %v", err)
			return err
		}
		if _, err := w.Write([]byte(msg)); err != nil {
			log.Printf("[mailer] write data failed: %v", err)
			return err
		}
		if err := w.Close(); err != nil {
			log.Printf("[mailer] close writer failed: %v", err)
			return err
		}
		log.Printf("[mailer] Successfully sent OTP email to %s", to)
		return nil
	}

	// Explicit TLS / STARTTLS or standard plain
	if err := smtp.SendMail(addr, auth, m.from, []string{to}, []byte(msg)); err != nil {
		log.Printf("[mailer] SendMail failed: %v", err)
		return err
	}
	log.Printf("[mailer] Successfully sent OTP email to %s", to)
	return nil
}
