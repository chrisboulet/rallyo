# 📅 Rallyo — Planification bénévoles pour OBNL

Outil gratuit et open source pour planifier les bénévoles lors d'événements communautaires.

**[rallyo.pages.dev](https://rallyo.pages.dev)**

## Fonctionnalités

- **Création d'événement self-service** — Wizard 2 étapes, prêt en 2 minutes
- **Grille horaire visuelle** — Indicateurs 🟢🟡🔴🔵 pour la couverture
- **Inscription self-service** — Les bénévoles cochent leurs dispos, reçoivent un code personnel
- **Admin sécurisé** — Gérer les affectations, configurer min/max par plage, export CSV
- **Mobile-first** — Interface optimisée pour téléphone
- **Multi-événements** — Chaque événement a son propre slug et sa propre config

## Pour qui?

Festivals, salons, événements sportifs, marchés de Noël, courses, événements culturels, communautés religieuses, écoles — tout OBNL qui a besoin de planifier des bénévoles.

## Stack technique

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v3
- **Backend:** Cloudflare Pages Functions
- **Base de données:** Cloudflare D1 (SQLite)
- **Hébergement:** Cloudflare Pages
- **Coût:** 0$ (free tiers Cloudflare)

## Déploiement

### 1. Cloner et installer

```bash
git clone https://github.com/chrisboulet/rallyo.git
cd rallyo
bun install
```

### 2. Créer la D1 database

```bash
npx wrangler d1 create rallyo-db
# Copier le database_id dans wrangler.toml
```

### 3. Appliquer les migrations

```bash
npx wrangler d1 execute rallyo-db --remote --file=./migrations/0001_rallyo.sql
```

### 4. Configurer wrangler.toml

- Remplacer le `database_id`
- Changer `MASTER_KEY` (clé pour créer des événements via API)

### 5. Build et déploiement

```bash
bun run build
npx wrangler pages deploy dist
```

## Développement local

```bash
bun install
bun run dev
```

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/events` | Lister les événements publics |
| GET | `/api/events/:slug` | Info événement + grille complète |
| POST | `/api/events/create` | Créer un événement (master key) |
| POST | `/api/events/:slug/register` | Inscrire un bénévole |
| GET | `/api/events/:slug/volunteer/:token` | Voir ses inscriptions |
| PUT | `/api/events/:slug/volunteer/:token` | Modifier ses inscriptions |
| GET | `/api/events/:slug/admin` | Liste des bénévoles (admin) |
| POST/DELETE | `/api/events/:slug/admin/registrations` | Gérer les affectations (admin) |
| PUT | `/api/events/:slug/admin/slots` | Modifier min/max d'une plage (admin) |

## Licence

MIT — Boulet Stratégies TI
