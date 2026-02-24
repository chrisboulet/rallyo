export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <span className="text-2xl">📅</span>
          <span className="font-black text-xl tracking-tight">Rallyo</span>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Planifiez vos <span className="text-ctq-blue">bénévoles</span> en&nbsp;3&nbsp;clics
          </h1>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Rallyo est un outil gratuit pour les OBNL qui organisent des événements avec des bénévoles.
            Créez votre grille horaire, partagez le lien, et vos bénévoles s'inscrivent eux-mêmes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="mailto:christian@bouletstrategies.ca?subject=Rallyo%20-%20Créer%20mon%20événement" className="btn-tesla text-lg px-8 py-3">
              🚀 Créer mon événement
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left max-w-3xl mx-auto">
            <div className="card">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-bold mb-2">1. Créez vos plages</h3>
              <p className="text-sm text-zinc-400">Définissez vos jours et plages horaires. Indiquez combien de bénévoles vous avez besoin par plage.</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-bold mb-2">2. Partagez le lien</h3>
              <p className="text-sm text-zinc-400">Envoyez le lien à vos bénévoles. Ils s'inscrivent eux-mêmes en cochant leurs disponibilités.</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-bold mb-2">3. C'est prêt!</h3>
              <p className="text-sm text-zinc-400">Voyez en temps réel qui est inscrit où. Ajustez au besoin dans la vue admin.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
        Rallyo — Gratuit et open source · <a href="https://bouletstrategies.ca" className="text-ctq-blue hover:underline">Boulet Stratégies TI</a>
      </footer>
    </div>
  )
}
