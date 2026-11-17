package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestListRedeemCodesIncludesPrimaryAndAssignedMentorCourses(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL required for PostgreSQL integration test")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}
	defer sqlDB.Close()
	tx := db.Begin()
	if tx.Error != nil {
		t.Fatal(tx.Error)
	}
	defer tx.Rollback()
	previousDB := database.DB
	database.DB = tx
	defer func() { database.DB = previousDB }()
	for _, statement := range []string{
		`CREATE TEMP TABLE users (uid uuid PRIMARY KEY, role text) ON COMMIT DROP`,
		`CREATE TEMP TABLE courses (uid uuid PRIMARY KEY, mentor_uid uuid, title text) ON COMMIT DROP`,
		`CREATE TEMP TABLE course_mentors (course_uid uuid, mentor_uid uuid, status text) ON COMMIT DROP`,
		`CREATE TEMP TABLE redeem_codes (uid uuid PRIMARY KEY, course_uid uuid, code text, target_email text, max_uses int, used_count int, is_active bool, expires_at timestamptz, created_by_uid uuid, created_at timestamptz) ON COMMIT DROP`,
	} {
		if err := tx.Exec(statement).Error; err != nil {
			t.Fatal(err)
		}
	}
	mentorUID := uuid.New()
	otherUID := uuid.New()
	if err := tx.Exec(`INSERT INTO users VALUES (?, 'mentor')`, mentorUID).Error; err != nil {
		t.Fatal(err)
	}
	for _, fixture := range []struct {
		code, status string
		primary      bool
	}{
		{code: "PRIMARY", primary: true},
		{code: "SELECTED", status: "selected"},
		{code: "JOINED", status: "joined"},
		{code: "PENDING", status: "pending"},
		{code: "OTHER"},
	} {
		courseUID := uuid.New()
		owner := otherUID
		if fixture.primary {
			owner = mentorUID
		}
		if err := tx.Exec(`INSERT INTO courses VALUES (?, ?, ?)`, courseUID, owner, fixture.code).Error; err != nil {
			t.Fatal(err)
		}
		if fixture.status != "" {
			if err := tx.Exec(`INSERT INTO course_mentors VALUES (?, ?, ?)`, courseUID, mentorUID, fixture.status).Error; err != nil {
				t.Fatal(err)
			}
		}
		if err := tx.Exec(`INSERT INTO redeem_codes (uid, course_uid, code, max_uses, used_count, is_active, created_at) VALUES (?, ?, ?, 1, 0, true, NOW())`, uuid.New(), courseUID, fixture.code).Error; err != nil {
			t.Fatal(err)
		}
	}
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/admin/redeem-codes", func(c *gin.Context) {
		c.Set(middleware.UIDCK, mentorUID)
		ListRedeemCodesFunc(c)
	})
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/admin/redeem-codes", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", response.Code, response.Body.String())
	}
	var body struct {
		Data struct {
			Items []struct {
				Code string `json:"code"`
			} `json:"items"`
		} `json:"data"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	codes := map[string]bool{}
	for _, item := range body.Data.Items {
		codes[item.Code] = true
	}
	if len(codes) != 3 || !codes["PRIMARY"] || !codes["SELECTED"] || !codes["JOINED"] {
		t.Fatalf("want PRIMARY, SELECTED, JOINED only; got %v", codes)
	}
}

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
