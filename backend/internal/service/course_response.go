package service

import (
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func userToMentorResponse(user entity.User) gin.H {
	name, _ := utils.Decrypt(user.Name)
	email, _ := utils.Decrypt(user.Email)
	description, _ := utils.Decrypt(user.Description)

	return gin.H{
		"uid":         user.Uid,
		"name":        name,
		"email":       email,
		"role":        user.Role,
		"is_verified": user.IsVerified,
		"avatar_url":  user.AvatarURL,
		"description": description,
		"created_at":  user.CreatedAt,
		"updated_at":  user.UpdatedAt,
	}
}

func categoryResponse(category *entity.CourseCategory) gin.H {
	if category == nil {
		return nil
	}

	return gin.H{
		"uid":         category.Uid,
		"name":        category.Name,
		"description": category.Description,
		"is_active":   category.IsActive,
		"created_at":  category.CreatedAt,
		"updated_at":  category.UpdatedAt,
	}
}

func courseTypeResponse(courseType *entity.ClassType) gin.H {
	if courseType == nil {
		return nil
	}

	return gin.H{
		"uid":         courseType.Uid,
		"name":        courseType.Name,
		"description": courseType.Description,
		"is_active":   courseType.IsActive,
		"created_at":  courseType.CreatedAt,
		"updated_at":  courseType.UpdatedAt,
	}
}

func mentorsResponse(course entity.Course) []gin.H {
	mentors := make([]gin.H, 0)
	seen := make(map[uuid.UUID]struct{})

	for _, mentor := range course.Mentors {
		if _, ok := seen[mentor.Uid]; ok {
			continue
		}
		seen[mentor.Uid] = struct{}{}
		mentors = append(mentors, userToMentorResponse(mentor))
	}

	if course.Mentor != nil {
		if _, ok := seen[course.Mentor.Uid]; !ok {
			seen[course.Mentor.Uid] = struct{}{}
			mentors = append(mentors, userToMentorResponse(*course.Mentor))
		}
	}

	return mentors
}

func courseResponse(course entity.Course) gin.H {
	return gin.H{
		"uid":             course.Uid,
		"mentor_uid":      course.MentorUid,
		"event_uid":       course.EventUid,
		"title":           course.Title,
		"subtitle":        course.Subtitle,
		"slot":            course.Slot,
		"category_uid":    course.CategoryUid,
		"course_type_uid": course.ClassTypeUid,
		"slug":            course.Slug,
		"description":     course.Description,
		"cover_url":       course.CoverURL,
		"thumbnail_url":   course.ThumbnailURL,
		"level":           course.Level,
		"status":          course.Status,
		"price":           course.Price,
		"price_strike":    course.PriceStrike,
		"what_you_learn":  course.WhatYouLearn,
		"is_premium":      course.IsPremium,
		"is_published":    course.IsPublished,
		"created_at":      course.CreatedAt,
		"updated_at":      course.UpdatedAt,
		"category":        categoryResponse(course.Category),
		"course_type":     courseTypeResponse(course.ClassType),
		"mentors":         mentorsResponse(course),
		"modules":         course.Modules,
	}
}

func courseListItemResponse(course entity.Course) gin.H {
	return gin.H{
		"uid":             course.Uid,
		"event_uid":       course.EventUid,
		"mentor_uid":      course.MentorUid,
		"category_uid":    course.CategoryUid,
		"course_type_uid": course.ClassTypeUid,
		"title":           course.Title,
		"subtitle":        course.Subtitle,
		"slot":            course.Slot,
		"slug":            course.Slug,
		"description":     course.Description,
		"cover_url":       course.CoverURL,
		"thumbnail_url":   course.ThumbnailURL,
		"level":           course.Level,
		"status":          course.Status,
		"price":           course.Price,
		"price_strike":    course.PriceStrike,
		"what_you_learn":  course.WhatYouLearn,
		"is_premium":      course.IsPremium,
		"is_published":    course.IsPublished,
		"created_at":      course.CreatedAt,
		"updated_at":      course.UpdatedAt,
		"mentors":         mentorsResponse(course),
	}
}

func lessonSummaryResponse(lessons []entity.Lesson) []gin.H {
	items := make([]gin.H, 0, len(lessons))
	for _, lesson := range lessons {
		items = append(items, gin.H{
			"uid":         lesson.Uid,
			"module_uid":  lesson.ModuleUid,
			"order_index": lesson.OrderIndex,
			"created_at":  lesson.CreatedAt,
			"updated_at":  lesson.UpdatedAt,
		})
	}
	return items
}

func moduleDetailResponse(modules []entity.Module) []gin.H {
	items := make([]gin.H, 0, len(modules))
	for _, module := range modules {
		items = append(items, gin.H{
			"uid":         module.Uid,
			"course_uid":  module.CourseUid,
			"title":       module.Title,
			"order_index": module.OrderIndex,
			"created_at":  module.CreatedAt,
			"lessons":     lessonSummaryResponse(module.Lessons),
		})
	}
	return items
}

func parseWhatYouLearnResponse(raw json.RawMessage) any {
	if len(raw) == 0 {
		return []string{}
	}

	var list []string
	if err := json.Unmarshal(raw, &list); err == nil {
		return list
	}

	return raw
}

func courseDetailResponse(course entity.Course) gin.H {
	return gin.H{
		"uid":            course.Uid,
		"event_uid":      course.EventUid,
		"title":          course.Title,
		"subtitle":       course.Subtitle,
		"slot":           course.Slot,
		"slug":           course.Slug,
		"description":    course.Description,
		"cover_url":      course.CoverURL,
		"thumbnail_url":  course.ThumbnailURL,
		"level":          course.Level,
		"status":         course.Status,
		"price":          course.Price,
		"price_strike":   course.PriceStrike,
		"what_you_learn": parseWhatYouLearnResponse(course.WhatYouLearn),
		"is_premium":     course.IsPremium,
		"is_published":   course.IsPublished,
		"created_at":     course.CreatedAt,
		"updated_at":     course.UpdatedAt,
		"category":       categoryResponse(course.Category),
		"course_type":    courseTypeResponse(course.ClassType),
		"mentors":        mentorsResponse(course),
		"modules":        moduleDetailResponse(course.Modules),
	}
}

func courseListResponse(courses []entity.Course) []gin.H {
	items := make([]gin.H, 0, len(courses))
	for _, course := range courses {
		items = append(items, courseListItemResponse(course))
	}
	return items
}

func joinedCourseListItemResponse(course entity.Course, enrollment entity.Enrollment) gin.H {
	item := courseListItemResponse(course)
	item["enrolled_at"] = enrollment.EnrolledAt
	item["progress"] = enrollment.Progress
	item["enrollment_status"] = enrollment.Status
	return item
}
