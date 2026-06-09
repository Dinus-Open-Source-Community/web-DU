package service

import (
	"backend/internal/database"
	"backend/internal/model/entity"
	"errors"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func submissionAttemptFromRow(sub *entity.LessonAssignmentSubmission, attemptNumber int) entity.LessonAssignmentSubmissionAttempt {
	return entity.LessonAssignmentSubmissionAttempt{
		LessonAssignmentSubmissionUid: sub.Uid,
		AttemptNumber:                 attemptNumber,
		PlainText:                     sub.PlainText,
		RichText:                      sub.RichText,
		FileURL:                       sub.FileURL,
		FileOriginalFilename:          sub.FileOriginalFilename,
		FileDescription:               sub.FileDescription,
		QuizAnswers:                   sub.QuizAnswers,
		ScorePercent:                  sub.ScorePercent,
		Passed:                        sub.Passed,
		QuizCorrectCount:              sub.QuizCorrectCount,
		QuizQuestionCount:             sub.QuizQuestionCount,
		Feedback:                      sub.Feedback,
		GradedAt:                      sub.GradedAt,
		IsAutoGraded:                  sub.IsAutoGraded,
	}
}

func recordSubmissionAttempt(sub *entity.LessonAssignmentSubmission, attemptNumber int) error {
	return createSubmissionAttempt(database.DB, sub, attemptNumber)
}

func createSubmissionAttempt(tx *gorm.DB, sub *entity.LessonAssignmentSubmission, attemptNumber int) error {
	attempt := submissionAttemptFromRow(sub, attemptNumber)
	return tx.Create(&attempt).Error
}

func ensureSubmissionAttemptsBackfilled(sub *entity.LessonAssignmentSubmission) error {
	var count int64
	if err := database.DB.Model(&entity.LessonAssignmentSubmissionAttempt{}).
		Where("lesson_assignment_submission_uid = ?", sub.Uid).
		Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	return recordSubmissionAttempt(sub, sub.AttemptCount)
}

func listSubmissionAttemptsForUser(submissionUID uuid.UUID) ([]entity.LessonAssignmentSubmissionAttempt, error) {
	var attempts []entity.LessonAssignmentSubmissionAttempt
	err := database.DB.Where("lesson_assignment_submission_uid = ?", submissionUID).
		Order("attempt_number ASC").
		Find(&attempts).Error
	return attempts, err
}

func buildAttemptGradingPayload(attempt *entity.LessonAssignmentSubmissionAttempt) gin.H {
	feedbackTrim := strings.TrimSpace(attempt.Feedback)
	isGraded := attempt.ScorePercent != nil || attempt.GradedAt != nil
	return gin.H{
		"score_percent":       attempt.ScorePercent,
		"passed":              attempt.Passed,
		"feedback":            feedbackTrim,
		"has_feedback":        feedbackTrim != "",
		"is_graded":           isGraded,
		"graded_at":           attempt.GradedAt,
		"is_auto_graded":      attempt.IsAutoGraded,
		"quiz_correct_count":  attempt.QuizCorrectCount,
		"quiz_question_count": attempt.QuizQuestionCount,
	}
}

func buildSubmissionAttemptItem(attempt entity.LessonAssignmentSubmissionAttempt) gin.H {
	return gin.H{
		"uid":                    attempt.Uid,
		"attempt_number":         attempt.AttemptNumber,
		"submitted_at":           attempt.CreatedAt,
		"plain_text":             attempt.PlainText,
		"rich_text":              attempt.RichText,
		"file_url":               attempt.FileURL,
		"file_original_filename": attempt.FileOriginalFilename,
		"file_description":       attempt.FileDescription,
		"quiz_answers":           attempt.QuizAnswers,
		"grading":                buildAttemptGradingPayload(&attempt),
	}
}

func syncLatestAttemptGradingFromSubmission(tx *gorm.DB, sub *entity.LessonAssignmentSubmission) error {
	var attempt entity.LessonAssignmentSubmissionAttempt
	err := tx.Where("lesson_assignment_submission_uid = ? AND attempt_number = ?", sub.Uid, sub.AttemptCount).
		First(&attempt).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return createSubmissionAttempt(tx, sub, sub.AttemptCount)
	}
	if err != nil {
		return err
	}

	attempt.ScorePercent = sub.ScorePercent
	attempt.Passed = sub.Passed
	attempt.QuizCorrectCount = sub.QuizCorrectCount
	attempt.QuizQuestionCount = sub.QuizQuestionCount
	attempt.Feedback = sub.Feedback
	attempt.GradedAt = sub.GradedAt
	attempt.IsAutoGraded = sub.IsAutoGraded
	return tx.Save(&attempt).Error
}
