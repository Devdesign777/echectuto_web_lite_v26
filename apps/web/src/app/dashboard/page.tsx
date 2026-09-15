import { redirect } from 'next/navigation'
import { logout } from '../auth/actions'
import { getPlayerSnapshot } from '@/features/profile/server/get-player-snapshot'
import { PlayerSnapshotCache } from '@/features/profile/components/player-snapshot-cache'

export default async function DashboardPage() {
  const snapshot = await getPlayerSnapshot()
  if (!snapshot) redirect('/auth/login')

  return (
    <main>
      <PlayerSnapshotCache snapshot={snapshot} />
      <h1>EchecTuto — espace joueur</h1>
      <p>Profil : {snapshot.profile.displayName ?? snapshot.profile.username}</p>
      <p>XP : {snapshot.balance.xp} · ETS : {snapshot.balance.ets} · Étoiles : {snapshot.balance.stars}</p>
      <p>Missions validées : {snapshot.completedMissionIds.length}</p>
      <p>Ces valeurs viennent du serveur. La copie locale sert uniquement de cache hors ligne.</p>
      <form action={logout}><button type="submit">Se déconnecter</button></form>
    </main>
  )
}
