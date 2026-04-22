package service

import "backend/internal/model/entity"

func roleLevel(role entity.UserRole) int {
	switch role {
	case entity.SuperAdminRole:
		return 4
	case entity.AdminRole:
		return 3
	case entity.MentorRole:
		return 2
	case entity.StudentRole:
		return 1
	default:
		return 0
	}
}

func hasAdminAccess(role entity.UserRole) bool {
	return roleLevel(role) >= roleLevel(entity.AdminRole)
}

func hasMentorAccess(role entity.UserRole) bool {
	return roleLevel(role) >= roleLevel(entity.MentorRole)
}
