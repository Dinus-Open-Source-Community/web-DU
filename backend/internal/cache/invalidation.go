package cache

import (
	"context"
	"log"
	"time"
)

const (
	NamespaceCourseList       = "course:list"
	NamespaceCourseDetail     = "course:detail"
	NamespaceCourseCategories = "course:categories"
	NamespaceCourseTypes      = "course:types"
	NamespaceGalleryList      = "gallery:list"
	NamespaceMentorDirectory  = "mentor:public:list"
)

func InvalidateNamespaces(namespaces ...string) {
	if Default == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), operationTimeout*time.Duration(len(namespaces)+1))
	defer cancel()
	for _, namespace := range namespaces {
		if err := Default.Invalidate(ctx, namespace); err != nil {
			log.Printf("redis cache invalidation failed namespace=%s: %v", namespace, err)
		}
	}
}

func InvalidateCourseList()           { InvalidateNamespaces(NamespaceCourseList) }
func InvalidateCourseDetail(_ string) { InvalidateNamespaces(NamespaceCourseDetail) }
func InvalidateCourseCategories()     { InvalidateNamespaces(NamespaceCourseCategories) }
func InvalidateCourseTypes()          { InvalidateNamespaces(NamespaceCourseTypes) }
func InvalidateGalleryList()          { InvalidateNamespaces(NamespaceGalleryList) }
func InvalidateMentorDirectory()      { InvalidateNamespaces(NamespaceMentorDirectory) }

func InvalidateCourse(_ string) {
	InvalidateNamespaces(NamespaceCourseList, NamespaceCourseDetail, "course:mentors", NamespaceCourseCategories, NamespaceCourseTypes)
}

func InvalidateCourseContent(_ string) {
	InvalidateNamespaces(NamespaceCourseDetail, "course:mentors")
}

func InvalidateUserAuth(emailHash string) { InvalidateAuthSession(emailHash) }
