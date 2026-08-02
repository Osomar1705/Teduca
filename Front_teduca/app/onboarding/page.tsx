'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { getSession } from '@/lib/auth-client'
import { getOnboardingStatus } from '@/lib/onboarding/service'
import { APP_ROUTES } from '@/lib/constants'

export default function OnboardingPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      const session = await getSession()
      if (!session) {
        router.replace(APP_ROUTES.LOGIN)
        return
      }
      const status = await getOnboardingStatus().catch(() => null)
      if (status?.completed) {
        router.replace(APP_ROUTES.DASHBOARD)
        return
      }
      setEmail(session.user.email)
    }
    bootstrap()
  }, [router])

  if (!email) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <OnboardingFlow userEmail={email} />
}
