package service

import (
	"os"
	"strings"
	"testing"
)

func TestBuildPaymentReturnURL(t *testing.T) {
	// Ensure a known FRONTEND_BASE_URL for deterministic tests.
	os.Setenv("FRONTEND_BASE_URL", "http://localhost:4173")
	defer os.Unsetenv("FRONTEND_BASE_URL")

	tests := []struct {
		name        string
		providedURL string
		merchantRef string
		wantPrefix  string
		wantContains []string
	}{
		{
			name:        "default URL when frontend provides none",
			providedURL: "",
			merchantRef: "INV123",
			wantPrefix:  "http://localhost:4173/student/transactions/payment",
			wantContains: []string{"merchant_ref=INV123"},
		},
		{
			name:        "appends merchant_ref to provided URL",
			providedURL: "http://example.com/student/transactions",
			merchantRef: "INV456",
			wantPrefix:  "http://example.com/student/transactions",
			wantContains: []string{"merchant_ref=INV456"},
		},
		{
			name:        "does not duplicate merchant_ref",
			providedURL: "http://example.com/student/transactions/payment?merchant_ref=INV789",
			merchantRef: "INV789",
			wantPrefix:  "http://example.com/student/transactions/payment?merchant_ref=INV789",
			wantContains: []string{"merchant_ref=INV789"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := buildPaymentReturnURL(tt.providedURL, tt.merchantRef)
			if !strings.HasPrefix(got, tt.wantPrefix) {
				t.Errorf("buildPaymentReturnURL() = %q, want prefix %q", got, tt.wantPrefix)
			}
			for _, want := range tt.wantContains {
				if !strings.Contains(got, want) {
					t.Errorf("buildPaymentReturnURL() = %q, want to contain %q", got, want)
				}
			}
		})
	}
}

func TestGetFrontendBaseURL(t *testing.T) {
	os.Setenv("FRONTEND_BASE_URL", "http://example.com/")
	defer os.Unsetenv("FRONTEND_BASE_URL")

	if got := getFrontendBaseURL(); got != "http://example.com" {
		t.Errorf("getFrontendBaseURL() = %q, want %q", got, "http://example.com")
	}
}
