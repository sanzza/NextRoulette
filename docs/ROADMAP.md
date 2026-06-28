# Roadmap — NextRoulette

État au démarrage du projet. Cases cochées = livré dans cette fondation.

## ✅ Fondation (cette version)

- [x] Projet Next.js 15 + TypeScript strict + Tailwind v4
- [x] Architecture en couches (`app/`, `components/`, `lib/`, `types/`)
- [x] Validation de la config au boot (`lib/env.ts`, fail-fast)
- [x] Authentification JWT (`jose`) + cookies httpOnly (access + refresh)
- [x] Hachage des mots de passe (bcrypt, comparaison à temps constant)
- [x] Validation des entrées (Zod)
- [x] En-têtes HTTP de sécurité
- [x] Protection des routes `/admin` par middleware (Edge)
- [x] Espace admin : connexion + tableau de bord (démo)
- [x] Page d'accueil festive one-page
- [x] **Roulette jouable** (maquette, données fictives)
- [x] Documentation technique + fonctionnelle + sécurité
- [x] Outillage qualité : ESLint, Prettier, EditorConfig, CI GitHub Actions

## 🔜 Étape 1 — Persistance

- [ ] Base de données **PostgreSQL** + **Prisma** (schéma `User`, `Room`, `ExEntry`)
- [ ] Remplacer `lib/auth/users.ts` (démo) par un repository DB
- [ ] Migrations & seed

## 🔜 Étape 2 — Le vrai jeu

- [ ] Création de **partie** + génération du **lien partageable**
- [ ] Rejoindre une partie via le lien (pseudo joueur)
- [ ] **Upload de photos** (stockage objet + validation/poids/format)
- [ ] Modération des photos dans l'admin
- [ ] Brancher la roulette sur les données réelles d'une partie

## 🔜 Étape 3 — Temps réel & multi-joueurs

- [ ] **WebSockets** : roulette synchronisée pour tous les joueurs d'un salon
- [ ] Présence (qui est connecté), réactions en direct
- [ ] Tour par tour, scores de soirée

## 🔜 Étape 4 — Durcissement & qualité

- [ ] **Rate limiting** sur l'authentification
- [ ] **Rotation/révocation** des refresh tokens + endpoint de refresh auto
- [ ] **Content-Security-Policy** stricte
- [ ] **Tests** : unitaires (Vitest) + e2e (Playwright)
- [ ] **RGPD** : consentement, durée de vie des images, purge automatique

## 💸 Étape 5 — Commercialisation (exploratoire)

- [ ] Comptes & espaces persistants
- [ ] Thèmes premium / modes de jeu (monétisation)
- [ ] Paiement (Stripe)
- [ ] Analytics produit respectueuses de la vie privée

> Les choix de sécurité associés à chaque étape sont détaillés dans
> [`SECURITY.md`](SECURITY.md).
