import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '../auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/auth/login')
  return <main><h1>EchecTuto — espace joueur</h1><p>Session serveur vérifiée. La migration du gameplay viendra ensuite.</p><form action={logout}><button type="submit">Se déconnecter</button></form></main>
}
