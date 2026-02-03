package dto

import "time"

type Invoice struct {
	ID        string
	UserEmail string
	Amount    float64
	CreatedAt time.Time
}
