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

## ✅ Étape 1 — Persistance (livrée)

- [x] Base **SQLite** (`better-sqlite3`), photos stockées en BLOB → un seul fichier
- [x] Couche d'accès (`lib/db/rooms.ts`, `lib/db/photos.ts`), init paresseuse
- [x] Build **standalone** + **Dockerfile** + volume persistant (déploiement)

## ✅ Étape 2 — Le vrai jeu (livrée)

- [x] Création de **partie** + génération des **liens** (partage + hôte)
- [x] Contribution via le lien (pseudo joueur, sans compte)
- [x] **Upload de photos** avec validation (signature, taille, formats, limite)
- [x] **Confidentialité** : chacun ne voit que ses photos ; hôte voit tout
- [x] Roulette branchée sur les **photos réelles** d'une partie
- [ ] Modération des photos dans l'admin *(à venir)*

## 🔜 Étape 2 bis — Persistance « scale » (si commercialisation)

- [ ] Bascule optionnelle vers **PostgreSQL** + stockage objet (S3/Blob) pour le
      serverless et le multi-instances

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
