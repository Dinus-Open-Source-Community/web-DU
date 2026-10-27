import { useQuery } from '@tanstack/react-query'

import { fetchPublicMentors } from '@/services/mentor'

export function usePublicMentors(perPage = 100) {
  return useQuery({
    queryKey: ['public-mentors', perPage],
    queryFn: () => fetchPublicMentors(perPage),
  })
}
