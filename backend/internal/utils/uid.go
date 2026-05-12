package utils

import "regexp"

// ShortUIDLength adalah panjang prefix UID yang dipakai untuk response ke frontend.
// 8 hex chars = 32 bit (~4 milyar kemungkinan), sangat kecil chance collision
// untuk dataset LMS.
const ShortUIDLength = 8

// uidJSONRegex menangkap UID dengan format UUID v4 yang berdiri sendiri sebagai
// nilai string JSON (di antara dua tanda kutip ganda). Pattern ini sengaja
// menyertakan tanda kutip pembuka & penutup agar tidak ikut memotong UID yang
// muncul di dalam URL/path string seperti `/uploads/<uuid>.png`.
var uidJSONRegex = regexp.MustCompile(`"([0-9a-fA-F]{8})-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"`)

// ShortenUIDString mengembalikan ShortUIDLength karakter pertama dari sebuah
// UUID string. Jika panjang kurang dari ShortUIDLength, string asli dikembalikan.
func ShortenUIDString(s string) string {
	if len(s) >= ShortUIDLength {
		return s[:ShortUIDLength]
	}
	return s
}

// ShortenUIDsInJSON mengganti semua UUID standalone (di dalam tanda kutip JSON)
// dengan ShortUIDLength karakter pertama. UID yang muncul di dalam string lain
// (URL/path) tidak ikut terpotong karena regex meng-anchor tanda kutip.
func ShortenUIDsInJSON(body []byte) []byte {
	return uidJSONRegex.ReplaceAll(body, []byte(`"$1"`))
}
