export type MentorMessageRole = 'user' | 'mentor'

export interface MentorMessage {
  id: string
  role: MentorMessageRole
  content: string
  createdAt: string
}

export interface MentorContext {
  userName: string
  goals: string[]
  subjects: string[]
  streakDays: number
  recentActivity: string[]
}
