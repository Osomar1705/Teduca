export type RewardType =
  | 'points'
  | 'discount'
  | 'food'
  | 'transport'
  | 'merchandise'
  | 'benefit'

export type RewardStatus = 'available' | 'claimed' | 'expired' | 'locked'

export interface Reward {
  id: string
  name: string
  description: string
  value: number
  unit: string
  type: RewardType
  status: RewardStatus
  expiresAt?: string
  imageUrl?: string
  partner?: string
}

export interface RewardBalance {
  total: number
  unit: string
  label: string
}
