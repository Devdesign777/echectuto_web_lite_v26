import Link from 'next/link'
import { requestPasswordReset } from '../actions'

export default function ForgotPasswordPage() {
  return <main><h1>Réinitialiser le mot de passe</h1><p>Entre l’adresse e-mail associée au compte. Le message de confirmation reste volontairement générique.</p><form action={requestPasswordReset}><label>E-mail<input name="email" type="email" autoComplete="email" required /></label><button type="submit">Envoyer le lien sécurisé</button></form><p><Link href="/auth/login">Retour à la connexion</Link></p></main>
}
