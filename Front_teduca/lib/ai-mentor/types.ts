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
  xp: number
  level: string
  weeklyXP: number
  weeklyGoal: number
  orbits: number
  reservationsCount: number
  coursesCount: number
  projectInterests: string[]
  learningStyles: string[]
}

export interface MentorRecommendation {
  text: string
  type: 'mentoría' | 'curso' | 'comunidad' | 'estudio'
  ctaLabel?: string
  ctaHref?: string
  teacherId?: string
}

export interface WeeklyGoal {
  title: string
  description: string
  progress: number   // 0-100
  completed: boolean
  xpReward: number
}

export interface MentorMemory {
  chatHistory: MentorMessage[]
  weeklyGoalCompleted: boolean
  lastSeen: string | null
  notes: string[]
}

export interface MentorData {
  context: MentorContext
  greeting: string
  recommendation: MentorRecommendation
  weeklyGoal: WeeklyGoal
  patterns: string[]
}
