package entity

import (
	"time"

	"github.com/google/uuid"
)

// PaymentMethodConfig menyimpan konfigurasi metode pembayaran yang tersedia di sistem.
// Data ini bersifat independen dari Payment (transaksi) dan digunakan untuk
// menampilkan pilihan metode kepada user saat checkout.
type PaymentMethodConfig struct {
	Uid       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	// Name adalah kode metode pembayaran (e.g., BRIVA, OVO, QRIS2)
	Name      string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
	// ImageURL adalah URL gambar/logo dari metode pembayaran tersebut (via MinIO proxy)
	ImageURL  string    `gorm:"type:text" json:"image_url"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
