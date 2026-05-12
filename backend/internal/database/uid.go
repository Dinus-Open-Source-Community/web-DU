package database

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/google/uuid"
)

// hexOnlyRegex memastikan input hanya berisi karakter hex (lowercase).
var hexOnlyRegex = regexp.MustCompile(`^[0-9a-f]+$`)

// ErrUIDAmbiguous dikembalikan jika prefix UID cocok dengan lebih dari satu
// record. Frontend dapat menanggulanginya dengan mengirim prefix yang lebih
// panjang (>8 karakter) atau full UID (36 karakter).
var ErrUIDAmbiguous = errors.New("ambiguous uid prefix: more than one record matches, please use a longer prefix or full uid")

// ErrUIDNotFound dikembalikan jika tidak ada record yang cocok dengan prefix.
var ErrUIDNotFound = errors.New("uid not found")

// ErrUIDInvalid dikembalikan jika input bukan format hex valid.
var ErrUIDInvalid = errors.New("invalid uid format")

// ResolveUID menerima full UUID (36 char) atau prefix hex (>=4 char) dan
// mengembalikan full uuid.UUID hasil lookup pada tabel `table` kolom `uid`.
//
// Aturan:
//   - Jika input parse sukses sebagai uuid.UUID -> langsung dikembalikan tanpa
//     query DB tambahan.
//   - Jika input adalah hex murni -> lakukan WHERE uid::text LIKE '<input>%'
//     pada tabel yang diberikan. Dibatasi 2 baris untuk deteksi collision.
//   - Jika tidak ditemukan -> ErrUIDNotFound.
//   - Jika lebih dari satu cocok -> ErrUIDAmbiguous.
func ResolveUID(table, idOrPrefix string) (uuid.UUID, error) {
	s := strings.TrimSpace(idOrPrefix)
	if s == "" {
		return uuid.Nil, ErrUIDInvalid
	}

	if id, err := uuid.Parse(s); err == nil {
		return id, nil
	}

	lower := strings.ToLower(s)
	if !hexOnlyRegex.MatchString(lower) {
		return uuid.Nil, ErrUIDInvalid
	}

	if len(lower) < 4 {
		return uuid.Nil, fmt.Errorf("%w: prefix too short (minimum 4 hex chars)", ErrUIDInvalid)
	}

	type uidRow struct {
		Uid uuid.UUID `gorm:"column:uid"`
	}

	var rows []uidRow
	if err := DB.
		Table(table).
		Select("uid").
		Where("uid::text LIKE ?", lower+"%").
		Limit(2).
		Scan(&rows).Error; err != nil {
		return uuid.Nil, err
	}

	if len(rows) == 0 {
		return uuid.Nil, ErrUIDNotFound
	}
	if len(rows) > 1 {
		return uuid.Nil, ErrUIDAmbiguous
	}
	return rows[0].Uid, nil
}

// ResolveUIDs mengembalikan slice full UUIDs dari slice prefix/full UIDs.
// Berguna untuk DTO yang menerima array UID seperti AssignMentorsToCourseRequest.
// Akan mengembalikan error pada item pertama yang gagal di-resolve.
func ResolveUIDs(table string, idsOrPrefixes []string) ([]uuid.UUID, error) {
	out := make([]uuid.UUID, 0, len(idsOrPrefixes))
	for _, raw := range idsOrPrefixes {
		id, err := ResolveUID(table, raw)
		if err != nil {
			return nil, err
		}
		out = append(out, id)
	}
	return out, nil
}
