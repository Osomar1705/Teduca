export interface Announcement {
  id: string
  title: string
  body?: string
  image?: string
  type: 'info' | 'event' | 'alert'
  pinned: boolean
  active: boolean
  created_at: string
}
