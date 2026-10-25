import { useQuery } from '@tanstack/react-query'

import { fetchPublicMentors } from '@/services/mentor'

export function usePublicMentors() {
  return useQuery({
    queryKey: ['public-mentors'],
    queryFn: fetchPublicMentors,
  })
}
