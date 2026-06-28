# Architecture — NextRoulette

Ce document explique **les choix techniques** et **comment le code est organisé**,
pour qu'un nouveau contributeur soit opérationnel rapidement.

## 1. Vision

NextRoulette est une application web **one-page, festive et interactive**. Le cœur
de l'expérience est une **roulette** qui désigne au hasard un « ex » ajouté par les
joueurs, le tout en multi-joueurs via un **lien partagé**.

Objectifs structurants :

1. **Maintenable à deux** → un seul langage (TypeScript), conventions claires.
2. **Sécurisé dès le départ** → voir [`SECURITY.md`](SECURITY.md).
3. **Prêt à grandir** → architecture qui supporte l'ajout de la base de données
   et du temps réel sans tout réécrire.

## 2. Pourquoi Next.js (et pas PHP/Symfony) ?

Le besoin initial évoquait « full JS » **et** « PHP/Symfony » — deux directions
opposées. Pour cette application précise, **full TypeScript avec Next.js** l'emporte :

| Critère | Next.js (TS) | PHP / Symfony |
|--------|--------------|----------------|
| Un seul langage front+back | ✅ | ❌ (PHP + JS) |
| Temps réel (roulette synchro) | ✅ WebSockets natif | ⚠️ plus complexe |
| One-page dynamique | ✅ React | ⚠️ via SPA séparée |
| Déploiement / scaling SaaS | ✅ Vercel & co | ✅ mais plus d'ops |
| Vivier de devs / écosystème | ✅ très large | ✅ large |

Symfony reste un excellent framework ; il est simplement **surdimensionné** ici,
là où Next.js couvre front + API + temps réel dans un seul projet cohérent.

## 3. Couches & responsabilités

```
Navigateur (React, Tailwind)
    │  fetch JSON / cookies httpOnly
    ▼
Next.js App Router
    ├── Server Components  → rendu serveur, lecture session (lib/auth/session)
    ├── Route Handlers     → API (/api/*) : auth, health…
    └── middleware.ts      → garde /admin (vérif JWT sur l'Edge)
    │
    ▼
Couche lib/ (logique métier transverse)
    ├── env.ts          → config validée (fail-fast)
    ├── validation.ts   → schémas Zod des entrées
    ├── auth/jwt.ts     → signature/vérif JWT (jose)
    ├── auth/password.ts→ hachage bcrypt
    ├── auth/session.ts → cookies httpOnly access/refresh
    └── auth/users.ts   → magasin d'utilisateurs (démo → DB plus tard)
```

**Principe clé** : la couche `lib/` ne connaît pas le HTTP. On peut donc tester la
logique isolément et remplacer une implémentation (ex. `users.ts` → base de données)
sans toucher aux routes.

## 4. Flux d'authentification

1. L'utilisateur poste e-mail + mot de passe à `POST /api/auth/login`.
2. `validation.ts` valide le corps, `users.authenticate()` vérifie le hash bcrypt.
3. `session.createSession()` signe un **access token** (15 min) et un **refresh
   token** (7 j) et les pose en **cookies httpOnly**.
4. Les pages `/admin/**` sont gardées par `middleware.ts` qui vérifie l'access
   token et le rôle `admin` sur l'Edge Runtime.
5. `GET /api/auth/me` renvoie l'utilisateur courant ; `POST /api/auth/logout`
   efface les cookies.

> Le refresh token est posé et prêt à l'emploi ; l'endpoint de rafraîchissement
> automatique est listé dans la [roadmap](ROADMAP.md).

## 5. La roulette (maquette)

`components/Roulette.tsx` est un **composant client** autonome :

- la roue est un `conic-gradient` divisé en N segments égaux ;
- au clic, on tire un index au hasard et on calcule l'angle final pour que le
  segment s'arrête sous le curseur, avec plusieurs tours d'élan ;
- l'animation est 100 % CSS (`transform` + `transition`), donc fluide et sans
  dépendance.

Les données viennent de `lib/fixtures.ts` (démo). Elles seront remplacées par les
données d'une vraie partie.

## 6. Conventions

- **TypeScript strict** (`noUncheckedIndexedAccess`, `noUnusedLocals`…).
- Alias d'import **`@/`** → `src/`.
- Validation **systématique** des entrées via Zod avant tout traitement.
- Commentaires et UI **en français** (public cible francophone).

## 7. Prochaines briques

Voir [`ROADMAP.md`](ROADMAP.md) : base de données (Prisma + PostgreSQL), upload de
photos, salons partagés par lien, temps réel (WebSockets), tests automatisés.
