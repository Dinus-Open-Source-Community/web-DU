package service

import (
	"backend/internal/database"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type courseReviewSummary struct {
	AverageRating float64
	TotalReviews  int
}

func emptyCourseReviewSummary() courseReviewSummary {
	return courseReviewSummary{}
}

func courseReviewSummaryFromMap(summaries map[uuid.UUID]courseReviewSummary, courseUID uuid.UUID) courseReviewSummary {
	if summaries == nil {
		return emptyCourseReviewSummary()
	}
	if summary, ok := summaries[courseUID]; ok {
		return summary
	}
	return emptyCourseReviewSummary()
}

func fetchCourseReviewSummaries(courseUIDs []uuid.UUID) map[uuid.UUID]courseReviewSummary {
	result := make(map[uuid.UUID]courseReviewSummary, len(courseUIDs))
	if len(courseUIDs) == 0 {
		return result
	}

	type summaryRow struct {
		CourseUID     uuid.UUID `gorm:"column:course_uid"`
		AverageRating float64   `gorm:"column:average_rating"`
		TotalReviews  int64     `gorm:"column:total_reviews"`
	}

	var rows []summaryRow
	if err := database.DB.Table("course_reviews").
		Select("course_uid, AVG(rating) AS average_rating, COUNT(*) AS total_reviews").
		Where("course_uid IN ?", courseUIDs).
		Group("course_uid").
		Scan(&rows).Error; err != nil {
		return result
	}

	for _, row := range rows {
		result[row.CourseUID] = courseReviewSummary{
			AverageRating: row.AverageRating,
			TotalReviews:  int(row.TotalReviews),
		}
	}
	return result
}

func fetchCourseReviewsByCourseUID(courseUID uuid.UUID) ([]entity.CourseReview, error) {
	var reviews []entity.CourseReview
	err := database.DB.
		Where("course_uid = ?", courseUID).
		Preload("User").
		Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		Preload("Replies.Replier").
		Order("created_at DESC").
		Find(&reviews).Error
	return reviews, err
}

func computeCourseReviewSummary(reviews []entity.CourseReview) courseReviewSummary {
	if len(reviews) == 0 {
		return emptyCourseReviewSummary()
	}

	totalRating := 0
	for _, review := range reviews {
		totalRating += review.Rating
	}

	return courseReviewSummary{
		AverageRating: float64(totalRating) / float64(len(reviews)),
		TotalReviews:  len(reviews),
	}
}

func userToReviewAuthorResponse(user *entity.User) gin.H {
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

func courseReviewReplyResponse(reply entity.CourseReviewReply) gin.H {
	return gin.H{
		"uid":        reply.Uid,
		"comment":    reply.Comment,
		"created_at": reply.CreatedAt,
		"replier":    userToReviewAuthorResponse(reply.Replier),
	}
}

func courseReviewsResponse(reviews []entity.CourseReview) []gin.H {
	items := make([]gin.H, 0, len(reviews))
	for _, review := range reviews {
		replies := make([]gin.H, 0, len(review.Replies))
		for _, reply := range review.Replies {
			replies = append(replies, courseReviewReplyResponse(reply))
		}

		items = append(items, gin.H{
			"uid":        review.Uid,
			"rating":     review.Rating,
			"comment":    review.Comment,
			"created_at": review.CreatedAt,
			"user":       userToReviewAuthorResponse(review.User),
			"replies":    replies,
		})
	}
	return items
}

func applyReviewSummaryFields(item gin.H, summary courseReviewSummary) {
	item["rating"] = summary.AverageRating
	item["total_reviews"] = summary.TotalReviews
}

func courseUIDsFromCourses(courses []entity.Course) []uuid.UUID {
	uids := make([]uuid.UUID, len(courses))
	for i, course := range courses {
		uids[i] = course.Uid
	}
	return uids
}
