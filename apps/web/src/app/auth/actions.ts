'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = value(formData, 'email')
  const password = value(formData, 'password')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/auth/login?error=invalid_credentials')
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = value(formData, 'email')
  const password = value(formData, 'password')
  const username = value(formData, 'username')
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
  if (error) redirect('/auth/sign-up?error=signup_failed')
  redirect('/auth/login?status=check_email')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = value(formData, 'email')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  // Deliberately return the same UI outcome whether or not the address exists.
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/auth/callback?next=/auth/update-password` })
  redirect('/auth/forgot-password?status=sent')
}

export async function updatePassword(formData: FormData) {
  const password = value(formData, 'password')
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) redirect('/auth/update-password?error=update_failed')
  redirect('/auth/login?status=password_updated')
}
