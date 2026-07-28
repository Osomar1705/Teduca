'use client'

import { useQuery } from '@tanstack/react-query'
import { Assignment } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/constants'
import { apiClient } from '@/lib/api-client'

/** Lista las tareas de un curso (FastAPI: GET /courses/{id}/assignments). */
export function useAssignments(courseId: string) {
  return useQuery({
    queryKey: ['assignments', courseId],
    queryFn: () =>
      apiClient.get<Assignment[]>(API_ENDPOINTS.COURSES.ASSIGNMENTS(courseId)),
    staleTime: 1000 * 60 * 5,
    enabled: !!courseId,
  })
}

export function useAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () =>
      apiClient.get<Assignment>(
        API_ENDPOINTS.ASSIGNMENTS.GET_BY_ID(assignmentId)
      ),
    staleTime: 1000 * 60 * 5,
    enabled: !!assignmentId,
  })
}
