'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getMarketplaceItems,
  getRewardBalance,
  getTransactions,
  redeemItem,
} from './service'
import type { RewardBalance, RewardItem, RewardTransaction } from './types'

export function useRewardBalance() {
  const [balance, setBalance] = useState<RewardBalance | null>(null)
  const [transactions, setTransactions] = useState<RewardTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setBalance(getRewardBalance())
    setTransactions(getTransactions())
    setLoading(false)
  }, [])

  return { balance, transactions, loading }
}

export function useMarketplace() {
  const [items, setItems] = useState<RewardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setItems(getMarketplaceItems())
    setLoading(false)
  }, [])

  const redeem = useCallback(
    (itemId: string) => redeemItem(itemId),
    [],
  )

  return { items, redeem, loading }
}
