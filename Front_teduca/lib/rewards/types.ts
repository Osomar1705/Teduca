// Sistema de recompensas desacoplado — el nombre "Orbit" es solo display, no está en el código

export type RewardType =
  | 'points'
  | 'discount'
  | 'food'
  | 'transport'
  | 'merchandise'
  | 'book'
  | 'course'
  | 'certificate'
  | 'event'
  | 'gift_card'
  | 'benefit'

export type RewardStatus = 'available' | 'claimed' | 'expired' | 'locked' | 'pending'

export type RewardCategory = 'university' | 'food' | 'transport' | 'education' | 'lifestyle' | 'partner'

export type EarnEventType =
  | 'mentorship_attended'
  | 'course_completed'
  | 'module_completed'
  | 'streak_milestone'
  | 'helped_student'
  | 'answer_accepted'
  | 'good_grade'
  | 'event_participated'
  | 'hackathon_joined'
  | 'research_published'
  | 'content_published'
  | 'weekly_challenge'
  | 'referral'
  | 'became_mentor'
  | 'high_participation'
  | 'daily_login'
  | 'onboarding_complete'

export interface EarnRule {
  event: EarnEventType
  label: string
  description: string
  pointsAwarded: number
  isActive: boolean
  maxPerDay?: number
  maxPerWeek?: number
  icon: string
}

export interface RewardItem {
  id: string
  name: string
  description: string
  type: RewardType
  category: RewardCategory
  value: number
  displayValue: string
  imageUrl?: string
  partner?: string
  stock?: number
  expiresAt?: string
  conditions: string[]
  status: RewardStatus
  featured?: boolean
}

export interface RewardTransaction {
  id: string
  type: 'earned' | 'redeemed'
  event?: EarnEventType
  itemId?: string
  itemName?: string
  points: number
  balance: number
  description: string
  createdAt: string
  status: 'completed' | 'pending' | 'cancelled'
}

export interface RewardBalance {
  total: number
  unit: string
  label: string
  weeklyEarned: number
  monthlyEarned: number
  totalEarned: number
  totalRedeemed: number
}

export interface RankingEntry {
  position: number
  userId: string
  name: string
  avatar?: string
  university?: string
  career?: string
  score: number
  pointsBalance: number
  streak: number
  isCurrentUser?: boolean
}

export interface RankingData {
  global: RankingEntry[]
  byUniversity: RankingEntry[]
  byCareer: RankingEntry[]
  weekly: RankingEntry[]
  monthly: RankingEntry[]
  friends: RankingEntry[]
  currentUserPosition: { global: number; university: number; career: number }
}
