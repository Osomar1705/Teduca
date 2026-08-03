'use client'

import { useCallback, useState } from 'react'
import {
  getMarketplaceItems,
  getRewardBalance,
  getTransactions,
  redeemItem,
} from './service'
import type { RewardBalance, RewardItem, RewardTransaction } from './types'

export function useRewardBalance() {
  const [balance] = useState<RewardBalance | null>(getRewardBalance)
  const [transactions] = useState<RewardTransaction[]>(getTransactions)

  return { balance, transactions, loading: false }
}

export function useMarketplace() {
  const [items] = useState<RewardItem[]>(getMarketplaceItems)

  const redeem = useCallback(
    (itemId: string) => redeemItem(itemId),
    [],
  )

  return { items, redeem, loading: false }
}
