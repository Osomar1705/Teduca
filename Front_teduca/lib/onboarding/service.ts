'use client'

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/constants'

export interface OnboardingStatus {
  completed: boolean
  current_step: number
}

export interface OnboardingData {
  id: string
  user_id: string
  full_name: string | null
  username: string | null
  birth_date: string | null
  is_edu_verified: boolean
  institution: string | null
  career: string | null
  academic_year: string | null
  goals: string[]
  subject_tags: string[]
  project_interests: string[]
  learning_styles: string[]
  current_step: number
  completed: boolean
}

export interface Step1Payload {
  full_name: string
  username: string
  birth_date: string
}

export interface Step2Payload {
  institution: string
  career: string
  academic_year: string
  goals: string[]
}

export interface Step3Payload {
  subject_tags: string[]
  project_interests: string[]
  learning_styles: string[]
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  return apiClient.get<OnboardingStatus>(API_ENDPOINTS.ONBOARDING.STATUS)
}

export async function getOnboarding(): Promise<OnboardingData> {
  return apiClient.get<OnboardingData>(API_ENDPOINTS.ONBOARDING.ME)
}

export async function checkUsername(username: string): Promise<{ available: boolean }> {
  return apiClient.post<{ available: boolean }>(API_ENDPOINTS.ONBOARDING.CHECK_USERNAME, {
    username,
  })
}

export async function saveStep1(data: Step1Payload): Promise<OnboardingData> {
  return apiClient.put<OnboardingData>(API_ENDPOINTS.ONBOARDING.STEP1, data)
}

export async function saveStep2(data: Step2Payload): Promise<OnboardingData> {
  return apiClient.put<OnboardingData>(API_ENDPOINTS.ONBOARDING.STEP2, data)
}

export async function saveStep3(data: Step3Payload): Promise<OnboardingData> {
  return apiClient.put<OnboardingData>(API_ENDPOINTS.ONBOARDING.STEP3, data)
}

export async function completeOnboarding(): Promise<OnboardingData> {
  return apiClient.post<OnboardingData>(API_ENDPOINTS.ONBOARDING.COMPLETE, {})
}
