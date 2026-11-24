package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
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
	rootDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	rootSQLDB, err := rootDB.DB()
	if err != nil {
		t.Fatal(err)
	}
	defer rootSQLDB.Close()
	schema := "redeem_delete_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	if err := rootDB.Exec("CREATE SCHEMA " + schema).Error; err != nil {
		t.Fatal(err)
	}
	defer rootDB.Exec("DROP SCHEMA " + schema + " CASCADE")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}
	defer sqlDB.Close()
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxOpenConns(1)
	if err := db.Exec("SET search_path TO " + schema).Error; err != nil {
		t.Fatal(err)
	}
	previousDB := database.DB
	database.DB = db
	defer func() { database.DB = previousDB }()
	for _, statement := range []string{
		`CREATE TEMP TABLE users (uid uuid PRIMARY KEY, role text, name text) ON COMMIT DROP`,
		`CREATE TEMP TABLE courses (uid uuid PRIMARY KEY, mentor_uid uuid, title text) ON COMMIT DROP`,
		`CREATE TEMP TABLE course_mentors (course_uid uuid, mentor_uid uuid, status text) ON COMMIT DROP`,
		`CREATE TEMP TABLE redeem_codes (uid uuid PRIMARY KEY, course_uid uuid, code text, target_email text, max_uses int, used_count int, is_active bool, expires_at timestamptz, created_by_uid uuid, created_at timestamptz) ON COMMIT DROP`,
	} {
		if err := db.Exec(statement).Error; err != nil {
			t.Fatal(err)
		}
	}
	mentorUID := uuid.New()
	if err := db.Exec(`INSERT INTO users (uid, role, name) VALUES (?, 'mentor', 'Mentor')`, mentorUID).Error; err != nil {
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
		var owner *uuid.UUID
		if fixture.primary {
			owner = &mentorUID
		}
		if err := db.Exec(`INSERT INTO courses VALUES (?, ?, ?)`, courseUID, owner, fixture.code).Error; err != nil {
			t.Fatal(err)
		}
		if fixture.status != "" {
			if err := db.Exec(`INSERT INTO course_mentors VALUES (?, ?, ?)`, courseUID, mentorUID, fixture.status).Error; err != nil {
				t.Fatal(err)
			}
		}
		if err := db.Exec(`INSERT INTO redeem_codes (uid, course_uid, code, max_uses, used_count, is_active, created_at) VALUES (?, ?, ?, 1, 0, true, NOW())`, uuid.New(), courseUID, fixture.code).Error; err != nil {
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

func TestMentorCanManageRedeemCourseOnlyWhenAssigned(t *testing.T) {
	ownedCourse := uuid.MustParse("11111111-1111-4111-8111-111111111111")
	otherCourse := uuid.MustParse("22222222-2222-4222-8222-222222222222")
	if !mentorCanManageRedeemCourse(ownedCourse, []uuid.UUID{ownedCourse}) {
		t.Fatal("mentor must manage assigned course redeem codes")
	}
	if mentorCanManageRedeemCourse(otherCourse, []uuid.UUID{ownedCourse}) {
		t.Fatal("mentor must not manage codes for an unassigned course")
	}
}

func TestDeleteRedeemCodeAllowsMentorOnlyForUnusedOwnedCourseCodes(t *testing.T) {
	if os.Getenv("RUN_REDEEM_DELETE_INTEGRATION") != "1" {
		t.Skip("set RUN_REDEEM_DELETE_INTEGRATION=1 for PostgreSQL integration test")
	}
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL required for PostgreSQL integration test")
	}
	rootDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	rootSQLDB, err := rootDB.DB()
	if err != nil {
		t.Fatal(err)
	}
	defer rootSQLDB.Close()
	schema := "redeem_delete_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	if err := rootDB.Exec("CREATE SCHEMA " + schema).Error; err != nil {
		t.Fatal(err)
	}
	defer rootDB.Exec("DROP SCHEMA " + schema + " CASCADE")
	db, err := gorm.Open(postgres.New(postgres.Config{DSN: dsn, PreferSimpleProtocol: true}), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}
	defer sqlDB.Close()
	sqlDB.SetMaxOpenConns(1)
	if err := db.Exec("SET search_path TO " + schema).Error; err != nil {
		t.Fatal(err)
	}
	previousDB := database.DB
	database.DB = db
	defer func() { database.DB = previousDB }()
	for _, statement := range []string{
		fmt.Sprintf(`CREATE TABLE %s.users (uid uuid PRIMARY KEY, role text, name text)`, schema),
		fmt.Sprintf(`CREATE TABLE %s.courses (uid uuid PRIMARY KEY, mentor_uid uuid, title text)`, schema),
		fmt.Sprintf(`CREATE TABLE %s.course_mentors (course_uid uuid, mentor_uid uuid, status text)`, schema),
		fmt.Sprintf(`CREATE TABLE %s.redeem_codes (uid uuid PRIMARY KEY, course_uid uuid, code text, target_email text, max_uses int, used_count int, is_active bool, expires_at timestamptz, created_by_uid uuid, created_at timestamptz)`, schema),
		fmt.Sprintf(`CREATE TABLE %s.redeem_code_usages (uid uuid PRIMARY KEY, redeem_code_uid uuid)`, schema),
	} {
		if err := db.Exec(statement).Error; err != nil {
			t.Fatal(err)
		}
	}
	mentorUID, courseUID := uuid.New(), uuid.New()
	if err := db.Exec(`INSERT INTO users (uid, role, name) VALUES (?, 'mentor', 'Mentor')`, mentorUID).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Exec(`INSERT INTO courses VALUES (?, ?, 'Mentor course')`, courseUID, nil).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Exec(`UPDATE courses SET mentor_uid = ? WHERE uid = ?`, mentorUID, courseUID).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Exec(`INSERT INTO course_mentors (course_uid, mentor_uid, status) VALUES (?, ?, 'joined')`, courseUID, mentorUID).Error; err != nil {
		t.Fatal(err)
	}
	ownedCodeUID, foreignCodeUID, usedCodeUID := uuid.New(), uuid.New(), uuid.New()
	for _, item := range []struct {
		uid, course uuid.UUID
		code        string
		used        int
	}{
		{ownedCodeUID, courseUID, "OWNED", 0},
		{foreignCodeUID, uuid.New(), "FOREIGN", 0},
		{usedCodeUID, courseUID, "USED", 1},
	} {
		if err := db.Exec(`INSERT INTO redeem_codes (uid, course_uid, code, max_uses, used_count, is_active, created_at) VALUES (?, ?, ?, 1, ?, true, NOW())`, item.uid, item.course, item.code, item.used).Error; err != nil {
			t.Fatal(err)
		}
	}
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.DELETE("/admin/redeem-codes/:id", func(c *gin.Context) {
		c.Set(middleware.UIDCK, mentorUID)
		DeleteRedeemCodeFunc(c)
	})
	request := func(uid uuid.UUID) (int, string) {
		response := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodDelete, "/admin/redeem-codes/"+uid.String(), nil)
		router.ServeHTTP(response, request)
		return response.Code, response.Body.String()
	}
	if status, body := request(ownedCodeUID); status != http.StatusOK {
		t.Fatalf("mentor owned-code deletion status=%d, want %d, body=%s", status, http.StatusOK, body)
	}
	if status, _ := request(foreignCodeUID); status != http.StatusForbidden {
		t.Fatalf("mentor foreign-code deletion status=%d, want %d", status, http.StatusForbidden)
	}
	if status, _ := request(usedCodeUID); status != http.StatusConflict {
		t.Fatalf("mentor used-code deletion status=%d, want %d", status, http.StatusConflict)
	}
	if status, _ := request(ownedCodeUID); status != http.StatusNotFound {
		t.Fatalf("deleted code status=%d, want %d", status, http.StatusNotFound)
	}
}
