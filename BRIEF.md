# 🚗 Salon de l'Auto de Québec 2026 — Planificateur Bénévoles Tesla

## Contexte
Application web pour le Club Tesla Québec (Club Owners Québec / COQ) pour planifier les bénévoles au kiosque Tesla pendant le Salon de l'Auto de Québec 2026 au Centre de foires de Québec.

## Dates & Plages horaires
- **6 jours:** 3 au 8 mars 2026
- **3 plages par jour:**
  - AM: 9h à 13h
  - PM: 13h à 17h
  - Soir: 17h à 21h
- **Total:** 18 slots

## Fonctionnalités

### Vue publique (sans auth)
1. **Grille horaire** — Tableau 6 jours × 3 plages montrant qui est inscrit à chaque slot
   - Indicateur visuel: vert (3+ bénévoles), jaune (1-2), rouge (0)
   - Affiche les noms des bénévoles inscrits par slot
2. **Inscription bénévole** — Le bénévole:
   - Entre son nom (+ optionnel: téléphone, email)
   - Coche les plages où il est disponible
   - Soumet → inscrit immédiatement
   - Peut revenir modifier ses disponibilités (lookup par nom ou code simple)

### Vue admin (mot de passe simple)
1. **Gestion des affectations** — Modifier/retirer des inscriptions de n'importe quel bénévole
2. **Liste des bénévoles** — Voir tous les inscrits, leurs coordonnées, nombre de plages
3. **Export** — Export JSON ou CSV des affectations

## Contraintes
- **Minimum 3 bénévoles par plage** (indicateur visuel, pas un blocage)
- **Pas de maximum** par plage
- **Self-service** — Les bénévoles s'inscrivent eux-mêmes
- **Simple** — PAS de système de véhicules, PAS d'optimisation auto, PAS de lieux multiples

## Stack technique
- **Frontend:** React 18 + TypeScript + Vite
- **Style:** Tailwind CSS 3 (thème sombre/auto inspiré)
- **Hébergement:** Cloudflare Pages
- **Backend:** Cloudflare Pages Functions (Workers)
- **Base de données:** Cloudflare D1 (SQLite)
- **Auth admin:** Mot de passe simple (sessionStorage + header X-Admin-Key)
- **Package manager:** Bun

## Référence
Inspiré de `~/projects/community/coq/carnaval-transport-2026/` mais BEAUCOUP plus simple.
Réutiliser les patterns Cloudflare Pages + D1 de ce projet.

## Design
- Thème sombre élégant (noir/gris foncé)
- Accent couleur: rouge Tesla (#cc0000) ou bleu électrique
- Mobile-first, responsive
- Logo Tesla ou COQ si disponible

## Livrables
- App fonctionnelle déployable sur Cloudflare Pages
- README avec instructions de déploiement
- Migration D1 pour la DB
