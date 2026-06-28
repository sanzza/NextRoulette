# Sécurité — NextRoulette

La sécurité est traitée **dès la fondation**, pas après coup. Ce document liste les
mesures en place et les points de vigilance pour la suite.

## 1. Authentification & sessions

- **JWT signés en HS256** via [`jose`](https://github.com/panva/jose) (compatible
  Edge Runtime). Secret dans `JWT_SECRET` (≥ 32 octets, jamais committé).
- **Access token court** (15 min) + **refresh token** (7 j) → limite la fenêtre
  d'exploitation d'un token volé.
- Claims vérifiés : **signature**, **émetteur** (`iss`), **audience** (`aud`),
  **expiration** (`exp`).
- Stockage en **cookies httpOnly** :
  - `httpOnly` → le JavaScript de la page **ne peut pas lire** les tokens (anti-XSS).
  - `secure` en production → transmis uniquement en HTTPS.
  - `sameSite=lax` → réduit la surface CSRF tout en gardant les liens cliquables.

## 2. Mots de passe

- Hachés avec **bcrypt** (coût 12), jamais stockés en clair.
- **Comparaison à temps constant** systématique : même quand l'e-mail n'existe pas,
  on exécute un `compare` sur un hash vide pour éviter une **fuite de timing**
  révélant l'existence d'un compte.
- Messages d'erreur **génériques** (« Identifiants incorrects ») → anti-énumération
  de comptes.

## 3. Validation des entrées

- **Toute** donnée venant du client passe par un **schéma Zod** (`lib/validation.ts`)
  avant traitement. Pas de confiance aveugle dans le payload.
- Les variables d'environnement sont validées au démarrage (`lib/env.ts`,
  **fail-fast**) : une config invalide stoppe l'appli plutôt que de créer un trou
  silencieux.

## 4. En-têtes HTTP de sécurité

Définis dans `next.config.ts` (défense en profondeur) :

| En-tête | Rôle |
|---------|------|
| `X-Content-Type-Options: nosniff` | Empêche le MIME-sniffing |
| `X-Frame-Options: DENY` | Anti-clickjacking |
| `Referrer-Policy: strict-origin-when-cross-origin` | Limite la fuite d'URL |
| `Permissions-Policy` | Désactive caméra/micro/géoloc par défaut |
| `Strict-Transport-Security` | Force HTTPS (HSTS) |

> ℹ️ Une **Content-Security-Policy** stricte est listée dans la roadmap (elle
> demande d'inventorier les sources autorisées une fois l'UI stabilisée).

## 5. Protection des routes

- `middleware.ts` garde `/admin/**` : pas d'access token `admin` valide →
  redirection vers `/admin/login`. La page de login elle-même est exclue.

## 6. Gestion des secrets

- `.env`, `.env.local` et variantes sont **dans `.gitignore`**.
- `.env.example` documente les variables **sans** valeur sensible.
- En production, fournir les secrets via les variables d'environnement de
  l'hébergeur (jamais dans le dépôt).

## 7. Points de vigilance pour la suite

- [ ] **Rate limiting** sur `/api/auth/login` (anti brute-force).
- [ ] **Rotation** du refresh token + révocation côté serveur.
- [ ] **CSRF token** pour les mutations sensibles si on ajoute des formulaires
      cross-site.
- [ ] **CSP** stricte une fois l'UI figée.
- [ ] **Modération** des photos uploadées (contenu sensible, RGPD : ce sont des
      photos de tiers → consentement, droit à l'effacement).
- [ ] **Chiffrement / durée de vie** des images et purge automatique des parties.

## 8. Signaler une faille

En attendant une politique dédiée, signaler toute vulnérabilité en privé aux
mainteneurs (Sanzza / Lisly) plutôt que via une issue publique.
