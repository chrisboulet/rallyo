export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <span className="font-black text-xl tracking-tight">Rallyo</span>
          </div>
          <a href="/create" className="btn-tesla text-sm">🚀 Créer un événement</a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-ctq-blue/10 text-ctq-blue text-sm font-semibold rounded-full px-4 py-1 mb-6">
              ✨ Gratuit pour les OBNL
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
              Planifiez vos <span className="text-ctq-blue">bénévoles</span><br />en 3 clics
            </h1>
            <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
              Rallyo simplifie la planification des bénévoles pour les festivals, salons, événements sportifs et toutes les activités communautaires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/create" className="btn-tesla text-lg px-8 py-3">🚀 Créer mon événement</a>
              <a href="#how" className="btn-ghost text-lg px-8 py-3">Comment ça marche?</a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-16 px-6 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-center mb-12">Comment ça marche?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-ctq-blue/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📋</div>
                <h3 className="font-bold text-lg mb-2">1. Créez vos plages</h3>
                <p className="text-sm text-zinc-400">Définissez vos jours, horaires et combien de bénévoles vous avez besoin par plage. Le tout en quelques clics.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-ctq-blue/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔗</div>
                <h3 className="font-bold text-lg mb-2">2. Partagez le lien</h3>
                <p className="text-sm text-zinc-400">Envoyez le lien à vos bénévoles par email, texto ou réseaux sociaux. Ils s'inscrivent eux-mêmes.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-ctq-blue/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                <h3 className="font-bold text-lg mb-2">3. C'est prêt!</h3>
                <p className="text-sm text-zinc-400">Voyez en temps réel qui est inscrit. Ajustez les affectations, configurez les min/max, exportez en CSV.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-center mb-12">Tout ce qu'il vous faut</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { emoji: '📅', title: 'Grille visuelle', desc: 'Indicateurs vert/jaune/rouge pour voir la couverture d\'un coup d\'oeil.' },
                { emoji: '✋', title: 'Inscription self-service', desc: 'Les bénévoles cochent leurs disponibilités. Zéro friction.' },
                { emoji: '🔑', title: 'Code personnel', desc: 'Chaque bénévole reçoit un code pour modifier ses disponibilités.' },
                { emoji: '🔒', title: 'Admin sécurisé', desc: 'Gérez les affectations, configurez min/max, mot de passe protégé.' },
                { emoji: '📱', title: 'Mobile-first', desc: 'Interface optimisée pour téléphone. Vos bénévoles s\'inscrivent de partout.' },
                { emoji: '📥', title: 'Export CSV', desc: 'Exportez la liste complète des bénévoles et affectations en un clic.' },
                { emoji: '⚙️', title: 'Min/Max par plage', desc: 'Configurez le minimum et maximum de bénévoles pour chaque plage horaire.' },
                { emoji: '🎨', title: 'Personnalisable', desc: 'Nom, organisation, logo — chaque événement a sa propre identité.' },
              ].map(f => (
                <div key={f.title} className="card flex gap-4 items-start">
                  <span className="text-2xl">{f.emoji}</span>
                  <div>
                    <h3 className="font-bold mb-1">{f.title}</h3>
                    <p className="text-sm text-zinc-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-16 px-6 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-black mb-8">Pour qui?</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['🎪 Festivals', '🏟️ Événements sportifs', '🚗 Salons et expositions', '🎄 Marchés de Noël', '🏃 Courses et marathons', '🎭 Événements culturels', '⛪ Communautés religieuses', '🏫 Écoles et universités'].map(u => (
                <span key={u} className="bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm">{u}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-4">Prêt à simplifier votre planification?</h2>
            <p className="text-zinc-400 mb-8">Créez votre premier événement gratuitement en moins de 2 minutes.</p>
            <a href="/create" className="btn-tesla text-lg px-8 py-3">🚀 Commencer maintenant</a>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span className="font-bold">Rallyo</span>
            <span>— Gratuit et open source</span>
          </div>
          <div className="flex gap-4">
            <a href="https://bouletstrategies.ca" className="text-ctq-blue hover:underline">Boulet Stratégies TI</a>
            <a href="https://github.com/BouletStrategiesTI/rallyo" className="text-ctq-blue hover:underline">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
