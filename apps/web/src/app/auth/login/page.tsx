import Link from 'next/link'
import { login } from '../actions'

export default function LoginPage() {
  return <main><h1>Connexion EchecTuto</h1><form action={login}><label>E-mail<input name="email" type="email" autoComplete="email" required /></label><label>Mot de passe<input name="password" type="password" autoComplete="current-password" required /></label><button type="submit">Se connecter</button></form><p><Link href="/auth/forgot-password">Mot de passe oublié ?</Link></p><p><Link href="/auth/sign-up">Créer un compte</Link></p></main>
}
