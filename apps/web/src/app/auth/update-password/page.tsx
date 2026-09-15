import { updatePassword } from '../actions'

export default function UpdatePasswordPage() {
  return <main><h1>Nouveau mot de passe</h1><form action={updatePassword}><label>Nouveau mot de passe<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label><button type="submit">Mettre à jour</button></form></main>
}
