package service

import "testing"

func TestRedeemCodeCanDelete(t *testing.T) {
	tests := []struct {
		name       string
		usedCount  int
		usageCount int64
		want       bool
	}{
		{name: "unused code", want: true},
		{name: "used counter", usedCount: 1, want: false},
		{name: "usage history", usageCount: 1, want: false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := redeemCodeCanDelete(test.usedCount, test.usageCount); got != test.want {
				t.Fatalf("redeemCodeCanDelete(%d, %d) = %t, want %t", test.usedCount, test.usageCount, got, test.want)
			}
		})
	}
}
