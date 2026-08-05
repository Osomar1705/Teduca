import { apiClient } from '@/lib/api-client'

export interface PostAuthor {
  id: string
  name: string
  avatar?: string | null
}

export interface ApiPost {
  id: string
  author: PostAuthor
  category: string
  title?: string | null
  content: string
  tags: string[]
  image_urls: string[]
  location?: string | null
  deadline?: string | null
  link?: string | null
  likes_count: number
  comments_count: number
  saves_count: number
  liked_by_me: boolean
  saved_by_me: boolean
  created_at: string
}

export interface PostFeed {
  items: ApiPost[]
  total: number
  page: number
  page_size: number
}

export interface CreatePostData {
  content: string
  category: string
  title?: string
  location?: string
  deadline?: string
  link?: string
  tags?: string[]
  image_urls?: string[]
}

const BASE = '/api/v1/community/posts'

export function fetchPosts(params: {
  page?: number
  page_size?: number
  category?: string
  search?: string
}): Promise<PostFeed> {
  const qs = new URLSearchParams()
  if (params.page)      qs.set('page',      String(params.page))
  if (params.page_size) qs.set('page_size', String(params.page_size))
  if (params.category && params.category !== 'todo') qs.set('category', params.category)
  if (params.search)    qs.set('search',    params.search)
  return apiClient.get<PostFeed>(`${BASE}?${qs}`)
}

export function createPost(data: CreatePostData): Promise<ApiPost> {
  return apiClient.post<ApiPost>(BASE, data)
}

export function toggleLike(postId: string): Promise<{ liked: boolean; likes_count: number }> {
  return apiClient.post(`${BASE}/${postId}/like`)
}

export function toggleSave(postId: string): Promise<{ saved: boolean; saves_count: number }> {
  return apiClient.post(`${BASE}/${postId}/save`)
}

export function deletePost(postId: string): Promise<void> {
  return apiClient.delete(`${BASE}/${postId}`)
}
