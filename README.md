# 🎰 NextRoulette

> Le jeu festif entre potes : chacun ajoute la photo d'un ex via un lien partagé,
> la roulette en désigne un… et tout le monde doit deviner **« c'est l'ex de qui ? »**

NextRoulette est une application web **one-page, dynamique et colorée**, pensée
pour les soirées. Cette base de code est une **fondation propre** : architecture
claire, sécurité dès le départ, et une **maquette jouable de la roulette** pour
visualiser le concept tout de suite.

---

## 🧱 Stack technique

| Couche            | Choix                                  | Pourquoi |
|-------------------|----------------------------------------|----------|
| Framework         | **Next.js 15** (App Router)            | Front + back dans un seul projet, idéal one-page |
| Langage           | **TypeScript** (strict)                | Un seul langage, sûr et maintenable |
| Style             | **Tailwind CSS v4**                    | UI festive rapide à itérer |
| Auth              | **JWT** (`jose`) + cookies httpOnly    | Sécurisé, compatible Edge Runtime |
| Validation        | **Zod**                                | Validation des entrées centralisée |
| Mots de passe     | **bcrypt** (`bcryptjs`)                | Hachage standard de l'industrie |

> 💡 **Pourquoi Next.js plutôt que PHP/Symfony ?** Pour une appli interactive et
> temps réel (roulette synchronisée, multi-joueurs) destinée à être
> commercialisée, le tout-JS/TS réduit la complexité (un seul langage), facilite
> le temps réel (WebSockets) et le déploiement (Vercel). Voir
> [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
#    puis générer un secret JWT :
openssl rand -base64 48          # → coller dans JWT_SECRET

# 3. (optionnel) créer le hash du mot de passe admin de démo
node -e "console.log(require('bcryptjs').hashSync('monMotDePasse', 12))"
#    → coller dans ADMIN_PASSWORD_HASH, et renseigner ADMIN_EMAIL

# 4. Lancer en développement
npm run dev
```

L'application tourne sur **http://localhost:3000**.

| Route             | Description                                   |
|-------------------|-----------------------------------------------|
| `/`               | Page d'accueil festive + roulette jouable     |
| `/admin/login`    | Connexion à l'espace admin                    |
| `/admin`          | Tableau de bord (protégé)                      |
| `/api/health`     | Sonde de santé                                |
| `/api/auth/*`     | Login / logout / me                           |

---

## 📜 Scripts npm

| Script                | Action                                |
|-----------------------|---------------------------------------|
| `npm run dev`         | Serveur de développement              |
| `npm run build`       | Build de production                   |
| `npm start`           | Démarre le build de production        |
| `npm run lint`        | Analyse ESLint                        |
| `npm run typecheck`   | Vérification TypeScript (sans build)  |
| `npm run format`      | Formate le code (Prettier)            |

---

## 📂 Structure du projet

```
NextRoulette/
├── src/
│   ├── app/                 # Routes (App Router)
│   │   ├── page.tsx         # Accueil one-page + roulette
│   │   ├── admin/           # Espace admin (login + dashboard)
│   │   └── api/             # Route Handlers (health, auth)
│   ├── components/          # Composants UI (Roulette, LogoutButton)
│   ├── lib/                 # Logique transverse
│   │   ├── env.ts           # Validation des variables d'env (fail-fast)
│   │   ├── validation.ts    # Schémas Zod
│   │   ├── fixtures.ts      # Données de démo
│   │   └── auth/            # JWT, mots de passe, session, users
│   ├── types/               # Types métier partagés
│   └── middleware.ts        # Protection des routes /admin
├── docs/                    # Documentation technique & fonctionnelle
└── .env.example             # Modèle de configuration
```

---

## 📚 Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — choix techniques & structure
- [`docs/SECURITY.md`](docs/SECURITY.md) — modèle de sécurité (JWT, cookies, headers)
- [`docs/FONCTIONNEL.md`](docs/FONCTIONNEL.md) — règles du jeu & parcours utilisateur
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — ce qui est fait / ce qui vient
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — conventions de contribution

---

## ⚠️ État actuel

Cette version est une **fondation** : l'authentification, la sécurité et la
maquette de la roulette sont en place, mais la **persistance en base** (parties,
ex, photos) et le **temps réel multi-joueurs** sont les prochaines étapes
documentées dans la [roadmap](docs/ROADMAP.md).

---

## 🎈 Contexte

Projet imaginé par **Sanzza & Lisly** pour un OVNI festif (OVJF), avec l'ambition
de potentiellement le commercialiser. Conçu maintenable et sécurisé dès le départ.
