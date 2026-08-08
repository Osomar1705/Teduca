export interface ReviewCreate {
  rating: number
  comment?: string
}

export interface Review {
  id: string
  user_id: string
  course_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer_name: string
  reviewer_avatar: string | null
}

export interface ReviewSummary {
  avg_rating: number
  count: number
  distribution: Record<number, number>
}
