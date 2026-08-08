'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getMarketplaceItems,
  getRewardBalance,
  getTransactionsAsync,
  redeemItem,
} from './service'
import type { RewardBalance, RewardItem, RewardTransaction } from './types'

export function useRewardBalance() {
  const [balance, setBalance] = useState<RewardBalance | null>(null)
  const [transactions, setTransactions] = useState<RewardTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRewardBalance(), getTransactionsAsync()])
      .then(([b, txs]) => { setBalance(b); setTransactions(txs) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { balance, transactions, loading }
}

export function useMarketplace() {
  const [items] = useState<RewardItem[]>(getMarketplaceItems)

  const redeem = useCallback(
    (itemId: string) => redeemItem(itemId),
    [],
  )

  return { items, redeem, loading: false }
}
