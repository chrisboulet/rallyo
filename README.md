# 🚗 Salon Auto Québec 2026 — Planificateur Bénévoles Tesla

Application web pour planifier les bénévoles Tesla au Salon de l'Auto de Québec 2026.

**Club Owners Québec (COQ) · 3–8 mars 2026 · Centre de foires de Québec**

## Fonctionnalités

- **Grille horaire** — Visualiser qui est inscrit à chaque plage (indicateurs vert/jaune/rouge)
- **Inscription self-service** — Les bénévoles s'inscrivent eux-mêmes et reçoivent un code personnel
- **Mon horaire** — Modifier ses disponibilités avec son code personnel
- **Admin** — Gérer toutes les affectations, exporter CSV

## Plages horaires

| Plage | Heures |
|-------|--------|
| Matin (AM) | 9h – 13h |
| Après-midi (PM) | 13h – 17h |
| Soir | 17h – 21h |

6 jours × 3 plages = **18 slots** au total. Minimum 3 bénévoles par plage (indicateur visuel).

## Stack technique

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v3
- **Backend:** Cloudflare Pages Functions (Workers)
- **Base de données:** Cloudflare D1 (SQLite)
- **Hébergement:** Cloudflare Pages
- **Package manager:** Bun

## Déploiement

### 1. Créer la D1 database

```bash
npx wrangler d1 create salon-auto-db
# Copier le database_id dans wrangler.toml
```

### 2. Appliquer les migrations

```bash
npx wrangler d1 execute salon-auto-db --file=./migrations/0001_init.sql
```

### 3. Configurer wrangler.toml

Remplacer `REPLACE_WITH_YOUR_D1_DATABASE_ID` par l'ID réel.
Changer `ADMIN_PASSWORD` si désiré.

### 4. Build et déploiement

```bash
bun install
bun run build
npx wrangler pages deploy dist
```

### 5. Variables d'environnement (production)

Dans le dashboard Cloudflare Pages, ajouter:
- `ADMIN_PASSWORD` = votre mot de passe admin

## Développement local

```bash
bun install
bun run dev          # Frontend seulement (sans API)
```

Pour tester avec les fonctions Cloudflare:
```bash
npx wrangler pages dev dist --d1 DB=<database_id>
```

## Mot de passe admin

Par défaut: `tesla2026` (configurable dans `wrangler.toml` ou variable d'env)
