import { apiClient } from '../api-client'
import type { Review, ReviewCreate, ReviewSummary } from './types'

interface PagedReviews {
  data: Review[]
  total: number
  page: number
  size: number
}

export async function upsertReview(courseId: string, data: ReviewCreate): Promise<Review> {
  return apiClient.post<Review>(`/api/v1/reviews/courses/${courseId}`, data)
}

export async function listReviews(courseId: string, page = 1, size = 20): Promise<PagedReviews> {
  return apiClient.get<PagedReviews>(
    `/api/v1/reviews/courses/${courseId}?page=${page}&size=${size}`,
  )
}

export async function getReviewSummary(courseId: string): Promise<ReviewSummary> {
  return apiClient.get<ReviewSummary>(`/api/v1/reviews/courses/${courseId}/summary`)
}

export async function getMyReviews(): Promise<Review[]> {
  return apiClient.get<Review[]>('/api/v1/reviews/me')
}
