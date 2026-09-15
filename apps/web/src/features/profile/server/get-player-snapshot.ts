import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type PlayerSnapshot = {
  userId: string
  profile: { username: string; displayName: string | null; locale: string; onboardingCompleted: boolean }
  balance: { xp: number; ets: number; stars: number }
  completedMissionIds: string[]
  serverTime: string
}

export async function getPlayerSnapshot(): Promise<PlayerSnapshot | null> {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (claimsError || !userId) return null

  const [profileResult, balanceResult, completionsResult] = await Promise.all([
    supabase.from('profiles').select('username, display_name, locale, onboarding_completed').eq('user_id', userId).single(),
    supabase.from('player_balances').select('xp, ets, stars').eq('user_id', userId).single(),
    supabase.from('mission_completions').select('mission_id').eq('user_id', userId).order('completed_at', { ascending: true }),
  ])

  if (profileResult.error) throw new Error('PLAYER_PROFILE_LOAD_FAILED')
  if (balanceResult.error) throw new Error('PLAYER_BALANCE_LOAD_FAILED')
  if (completionsResult.error) throw new Error('PLAYER_COMPLETIONS_LOAD_FAILED')

  return {
    userId,
    profile: {
      username: profileResult.data.username,
      displayName: profileResult.data.display_name,
      locale: profileResult.data.locale,
      onboardingCompleted: profileResult.data.onboarding_completed,
    },
    balance: {
      xp: Number(balanceResult.data.xp),
      ets: Number(balanceResult.data.ets),
      stars: Number(balanceResult.data.stars),
    },
    completedMissionIds: completionsResult.data.map((row) => row.mission_id),
    serverTime: new Date().toISOString(),
  }
}
