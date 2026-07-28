'use client'

import { useQuery } from '@tanstack/react-query'
import { Course } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/constants'
import { apiClient } from '@/lib/api-client'

interface Page<T> {
  data: T[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiClient.get<Page<Course>>(API_ENDPOINTS.COURSES.LIST)
      return res.data ?? []
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () =>
      apiClient.get<Course>(API_ENDPOINTS.COURSES.GET_BY_ID(courseId)),
    staleTime: 1000 * 60 * 5,
    enabled: !!courseId,
  })
}
