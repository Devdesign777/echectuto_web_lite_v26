const boundaries = [
  ["Client", "Échiquier, animations, thème, préférences et entraînement local"],
  ["Serveur", "Compte, progression officielle, XP/ETS, récompenses, inventaire et compétitions"],
  ["Hybride", "Missions, parties, Coach IA et synchronisation hors ligne"],
] as const;

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">EC-CLOUD-04</p>
        <h1>EchecTuto</h1>
        <p className="lead">La nouvelle application se construit en parallèle de la v191, sans modifier la baseline.</p>
        <div className="actions">
          <a className="primary" href="/legacy/index.html">Ouvrir la v191 de référence</a>
          <span className="status">Migration incrémentale active</span>
        </div>
      </section>
      <section className="grid" aria-label="Frontières d'autorité">
        {boundaries.map(([title, text]) => (
          <article key={title} className="card">
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
