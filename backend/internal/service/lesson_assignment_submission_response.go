package service

import (
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func preloadSubmissionRelations(db *gorm.DB) *gorm.DB {
	return db.Preload("User").Preload("GradedBy")
}

func userToSubmissionParticipantResponse(user *entity.User) gin.H {
	if user == nil {
		return nil
	}

	name, _ := utils.Decrypt(user.Name)
	return gin.H{
		"uid":        user.Uid,
		"name":       name,
		"avatar_url": user.AvatarURL,
	}
}

func userToGradedByResponse(user *entity.User) gin.H {
	if user == nil {
		return nil
	}

	name, _ := utils.Decrypt(user.Name)
	return gin.H{
		"uid":        user.Uid,
		"name":       name,
		"avatar_url": user.AvatarURL,
		"role":       user.Role,
	}
}

func submissionToResponse(sub entity.LessonAssignmentSubmission) gin.H {
	item := gin.H{
		"uid":                    sub.Uid,
		"lesson_assignment_uid":  sub.LessonAssignmentUid,
		"user_uid":               sub.UserUid,
		"plain_text":             sub.PlainText,
		"rich_text":              sub.RichText,
		"file_url":               sub.FileURL,
		"file_original_filename": sub.FileOriginalFilename,
		"file_description":       sub.FileDescription,
		"quiz_answers":           sub.QuizAnswers,
		"score_percent":          sub.ScorePercent,
		"passed":                 sub.Passed,
		"quiz_correct_count":     sub.QuizCorrectCount,
		"quiz_question_count":    sub.QuizQuestionCount,
		"feedback":               sub.Feedback,
		"graded_at":              sub.GradedAt,
		"graded_by_uid":          sub.GradedByUid,
		"is_auto_graded":         sub.IsAutoGraded,
		"attempt_count":          sub.AttemptCount,
		"created_at":             sub.CreatedAt,
		"updated_at":             sub.UpdatedAt,
	}

	if sub.User != nil {
		item["user"] = userToSubmissionParticipantResponse(sub.User)
	}
	item["graded_by"] = userToGradedByResponse(sub.GradedBy)

	return item
}

func submissionsToResponse(submissions []entity.LessonAssignmentSubmission) []gin.H {
	items := make([]gin.H, 0, len(submissions))
	for _, sub := range submissions {
		items = append(items, submissionToResponse(sub))
	}
	return items
}
