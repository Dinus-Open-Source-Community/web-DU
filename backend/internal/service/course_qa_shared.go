package service

import (
	"backend/internal/model/entity"
	"backend/internal/utils"
)

func qaAuthorRole(user *entity.User) string {
	if user == nil {
		return "student"
	}
	switch user.Role {
	case entity.MentorRole:
		return "mentor"
	case entity.AdminRole, entity.SuperAdminRole:
		return "admin"
	default:
		return "student"
	}
}

func isStaffRole(role entity.UserRole) bool {
	return role == entity.MentorRole || role == entity.AdminRole || role == entity.SuperAdminRole
}

func threadHasStaffReply(replies []entity.CourseQaReply) bool {
	for _, reply := range replies {
		if reply.Author != nil && isStaffRole(reply.Author.Role) {
			return true
		}
	}
	return false
}

func mapQaReplyItem(reply entity.CourseQaReply) map[string]any {
	authorName := ""
	authorAvatar := ""
	role := "student"
	if reply.Author != nil {
		authorName, _ = utils.Decrypt(reply.Author.Name)
		authorAvatar = reply.Author.AvatarURL
		role = qaAuthorRole(reply.Author)
	}
	return map[string]any{
		"uid":          reply.Uid,
		"author":       authorName,
		"authorAvatar": authorAvatar,
		"role":         role,
		"body":         reply.Body,
		"createdAt":    reply.CreatedAt,
	}
}

func mapAdminQaThreadItem(thread entity.CourseQaThread) map[string]any {
	authorName := ""
	authorAvatar := ""
	if thread.Author != nil {
		authorName, _ = utils.Decrypt(thread.Author.Name)
		authorAvatar = thread.Author.AvatarURL
	}
	courseTitle := ""
	if thread.Course != nil {
		courseTitle = thread.Course.Title
	}

	status := "unanswered"
	if threadHasStaffReply(thread.Replies) {
		status = "answered"
	}

	replies := make([]map[string]any, 0, len(thread.Replies))
	for _, reply := range thread.Replies {
		replies = append(replies, mapQaReplyItem(reply))
	}

	return map[string]any{
		"uid":          thread.Uid,
		"courseUid":    thread.CourseUid,
		"authorUid":    thread.AuthorUid,
		"courseTitle":  courseTitle,
		"title":        thread.Title,
		"author":       authorName,
		"authorAvatar": authorAvatar,
		"body":         thread.Body,
		"createdAt":    thread.CreatedAt,
		"repliesCount": len(thread.Replies),
		"status":       status,
		"replies":      replies,
	}
}
