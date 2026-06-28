# Contribuer — NextRoulette

Merci de garder le projet **propre et maintenable**. Quelques règles simples.

## Mise en route

```bash
npm install
cp .env.example .env.local   # remplir JWT_SECRET, ADMIN_*
npm run dev
```

## Avant de pousser

Lance la trilogie qualité — la CI fera la même chose :

```bash
npm run lint
npm run typecheck
npm run build
```

(`npm run format` pour formater automatiquement.)

## Conventions de code

- **TypeScript strict** : pas de `any` non justifié, pas de variable inutilisée.
- Imports via l'alias **`@/`** (= `src/`).
- **Valider toute entrée** côté serveur avec un schéma Zod (`lib/validation.ts`).
- La couche `lib/` **ne dépend pas du HTTP** : logique testable et réutilisable.
- UI et commentaires **en français**.

## Branches & commits

- Une branche par sujet : `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Messages de commit clairs et au présent (ex. `feat: ajoute l'upload de photos`).
- Format conseillé : [Conventional Commits](https://www.conventionalcommits.org/).

## Pull requests

- Décrire **le quoi et le pourquoi**.
- Mettre à jour la **documentation** (`docs/`) si le comportement change.
- Vérifier que `lint`, `typecheck` et `build` passent.

## Sécurité

Toute évolution touchant l'auth, les cookies, les uploads ou les données
personnelles doit être pensée avec [`SECURITY.md`](SECURITY.md) à l'esprit, et
idéalement le mettre à jour.
