export interface UserLevel {
  level: number
  title: string
  xpMin: number
  xpMax: number
  color: string
}

export interface Streak {
  current: number
  longest: number
  lastActiveDate: string | null
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string | null
  xpReward: number
  category: 'learning' | 'social' | 'streak' | 'milestone'
}

export interface GamificationState {
  xp: number
  level: UserLevel
  streak: Streak
  achievements: Achievement[]
  weeklyXP: number
  weeklyGoal: number
}
