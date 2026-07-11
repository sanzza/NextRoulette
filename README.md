# 🎰 The nEXt Roulette

> *(nom de code technique : `nextroulette`)*

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
| Persistance       | **SQLite** (`better-sqlite3`)          | Un seul fichier (photos incluses), zéro service externe |
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

| Route                    | Description                                        |
|--------------------------|----------------------------------------------------|
| `/`                      | Accueil festif + démo de roulette                  |
| `/creer`                 | Créer une partie → obtenir les liens               |
| `/r/{slug}`              | Ajouter ses ex (contribution privée)               |
| `/r/{slug}/roulette`     | La roulette (réservée à l'hôte)                    |
| `/admin/login` · `/admin`| Espace d'administration plateforme (JWT)           |
| `/api/health`            | Sonde de santé                                     |
| `/api/rooms/*`           | Parties, upload & photos (voir specs)              |

### 🎬 Comment jouer

1. **Créer** une partie sur `/creer` → tu obtiens un **lien de partage** et un
   **lien secret d'hôte**.
2. **Partager** le lien de partage avec les potes : chacun ajoute ses ex **en
   privé** (personne ne voit les photos des autres).
3. **Ouvrir** ton lien d'hôte → **lance la roulette** : une photo est tirée,
   tout le monde devine, puis on révèle **l'ex de qui** ! 😱

### 🧪 Tester avec des photos d'exemple

```bash
npm run samples          # génère des PNG d'exemple (scripts/samples/)
npm run build && npm start
BASE_URL=http://localhost:3000 npm run smoke   # 16 vérifications, dont la confidentialité
```

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

- [`docs/SPECIFICATIONS-FONCTIONNELLES.md`](docs/SPECIFICATIONS-FONCTIONNELLES.md) — **specs fonctionnelles complètes** (acteurs, exigences, règles, écrans)
- [`docs/FONCTIONNEL.md`](docs/FONCTIONNEL.md) — présentation du jeu & parcours (vue produit)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — choix techniques & structure
- [`docs/SECURITY.md`](docs/SECURITY.md) — modèle de sécurité (JWT, cookies, confidentialité)
- [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md) — **mettre le site en ligne** (Railway, Docker, VPS)
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — ce qui est fait / ce qui vient
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — conventions de contribution

---

## ⚠️ État actuel

Le jeu est **fonctionnel de bout en bout** : création de partie, contribution
privée de photos, et roulette qui révèle les ex. La persistance est un simple
**fichier SQLite** (photos incluses) → déploiement facile avec un disque
persistant. Le **temps réel multi-écrans** (roulette synchronisée) est la
prochaine grande étape, dans la [roadmap](docs/ROADMAP.md).

---

## 🎈 Contexte

Projet imaginé par **Sanzza & Lisly** pour un OVNI festif (OVJF), avec l'ambition
de potentiellement le commercialiser. Conçu maintenable et sécurisé dès le départ.
