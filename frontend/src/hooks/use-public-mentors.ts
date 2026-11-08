import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchPublicMentors } from '@/services/mentor'

export function usePublicMentors(perPage = 8) {
  return useQuery({
    queryKey: ['public-mentors', perPage],
    queryFn: () => fetchPublicMentors(perPage, 1),
  })
}

export function useInfinitePublicMentors(perPage = 8) {
  const queryClient = useQueryClient()
  return useInfiniteQuery({
    queryKey: ['public-mentors-infinite', perPage],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPublicMentors(perPage, pageParam),
    initialData: () => {
      const cachedFirstPage = queryClient.getQueryData<
        Awaited<ReturnType<typeof fetchPublicMentors>>
      >(['public-mentors', perPage])
      if (!cachedFirstPage) return undefined
      return {
        pages: [cachedFirstPage],
        pageParams: [1],
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.total_pages
        ? lastPage.meta.current_page + 1
        : undefined,
  })
}
