package utils

import "testing"

func TestShortenUIDsInJSON(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{
			name: "single uid field",
			in:   `{"uid":"c62d9b2b-dd3e-4bc3-9248-31f0565cf9ab"}`,
			want: `{"uid":"c62d9b2b"}`,
		},
		{
			name: "multiple uid fields",
			in:   `{"uid":"c62d9b2b-dd3e-4bc3-9248-31f0565cf9ab","mentor_uid":"abcdef12-3456-7890-abcd-ef1234567890"}`,
			want: `{"uid":"c62d9b2b","mentor_uid":"abcdef12"}`,
		},
		{
			name: "uid inside url is not modified",
			in:   `{"cover_url":"/files/courses/c62d9b2b-dd3e-4bc3-9248-31f0565cf9ab.png"}`,
			want: `{"cover_url":"/files/courses/c62d9b2b-dd3e-4bc3-9248-31f0565cf9ab.png"}`,
		},
		{
			name: "uid in invoice path filename is not modified",
			in:   `{"invoice_url":"http://x/files/invoices/c62d9b2b-dd3e-4bc3-9248-31f0565cf9ab__a1b2c3d4-1111-2222-3333-444455556666__20231025.pdf"}`,
			want: `{"invoice_url":"http://x/files/invoices/c62d9b2b-dd3e-4bc3-9248-31f0565cf9ab__a1b2c3d4-1111-2222-3333-444455556666__20231025.pdf"}`,
		},
		{
			name: "uid in array",
			in:   `{"items":[{"uid":"c62d9b2b-dd3e-4bc3-9248-31f0565cf9ab"},{"uid":"99999999-aaaa-bbbb-cccc-dddddddddddd"}]}`,
			want: `{"items":[{"uid":"c62d9b2b"},{"uid":"99999999"}]}`,
		},
		{
			name: "non-uuid hex strings unchanged",
			in:   `{"hash":"abc123def","short":"deadbeef"}`,
			want: `{"hash":"abc123def","short":"deadbeef"}`,
		},
		{
			name: "uppercase uid is supported",
			in:   `{"uid":"C62D9B2B-DD3E-4BC3-9248-31F0565CF9AB"}`,
			want: `{"uid":"C62D9B2B"}`,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := string(ShortenUIDsInJSON([]byte(tc.in)))
			if got != tc.want {
				t.Errorf("ShortenUIDsInJSON(%q) = %q, want %q", tc.in, got, tc.want)
			}
		})
	}
}
