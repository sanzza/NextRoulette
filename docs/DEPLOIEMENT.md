# Déploiement — NextRoulette

> TL;DR : NextRoulette a besoin d'un **serveur Node avec un disque persistant**
> (pour le fichier SQLite qui contient aussi les photos). **Pas** de serverless
> (Vercel/Netlify) sans base externe, car leur disque est éphémère.

## 1. De quoi as-tu besoin, côté serveur ?

| Besoin | Détail |
|--------|--------|
| **1 serveur Node** | Node 20+ (ou Docker). Un petit plan suffit pour une soirée. |
| **Un disque persistant** | Un volume monté (ex. `/app/data`) pour conserver `nextroulette.db`. |
| **HTTPS** | Fourni automatiquement par la plupart des hébergeurs (Railway/Render/Fly). |
| **~256–512 Mo RAM** | Largement suffisant pour un usage entre potes. |

C'est tout : **aucune base de données externe**, **aucun service de stockage
d'images**, **aucun compte cloud** à configurer. Tout tient dans un fichier.

## 2. Option recommandée pour ce soir : Railway (le plus simple)

1. Pousse le repo sur GitHub (déjà fait ✅).
2. Sur [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
3. Railway détecte le `Dockerfile` et build tout seul.
4. Onglet **Variables** → ajoute :
   - `JWT_SECRET` = *(génère : `openssl rand -base64 48`)*
   - `NEXT_PUBLIC_APP_URL` = l'URL publique que Railway te donne
5. Onglet **Volumes** → crée un volume monté sur **`/app/data`**
   (le `DATABASE_PATH` par défaut de l'image pointe déjà là).
6. Deploy → tu obtiens une URL `https://…up.railway.app`. 🎉

> Render et Fly.io fonctionnent pareil : build via `Dockerfile`, un **disque/volume**
> monté sur `/app/data`, et les mêmes variables d'environnement.

## 2 bis. Cas OVH « hosting-free-100m » (hébergement mutualisé)

⚠️ **Important** : l'offre OVH **mutualisée** (hosting-free-100m, accès **FTP**
uniquement, 100 Mo, **pas de SSH**) sert **PHP + fichiers statiques**. Elle **ne
peut pas exécuter Next.js / Node.js** ni faire tourner un serveur permanent.

**Bonne nouvelle : tu gardes ton domaine.** Le schéma qui marche :

1. Héberger l'app sur une plateforme **Node** (Railway/Render — §2) ou un **VPS**
   (§3–4).
2. **Brancher ton domaine OVH** (ex. `sanzzadev.com`) dessus **via le DNS** :
   - Dans l'**Espace Client OVH → Domaines → sanzzadev.com → Zone DNS**.
   - Ajoute un enregistrement **CNAME** : `roulette` → la cible fournie par
     l'hébergeur (ex. `xxxx.up.railway.app`).
   - L'app sera accessible sur **`https://roulette.sanzzadev.com`** (le HTTPS est
     géré par l'hébergeur Node).
   - L'apex (`sanzzadev.com` sans sous-domaine) n'accepte pas de CNAME : utilise
     un sous-domaine, ou l'enregistrement A/ALIAS indiqué par l'hébergeur.

> Pour un serveur **chez OVH** avec SSH + Docker, prends un **VPS OVHcloud**
> (à partir de ~3,5 €/mois) plutôt que l'hébergement mutualisé, puis suis §3/§4.

## 3. Avec Docker (n'importe quel VPS) — le plus rapide : docker compose

```bash
# Sur ton serveur, à la racine du repo :
echo "JWT_SECRET=$(openssl rand -base64 48)" > .env
echo "NEXT_PUBLIC_APP_URL=https://roulette.sanzzadev.com" >> .env
docker compose up -d --build
```

C'est tout : l'app tourne sur le port 3000, les données sont dans le volume
`nextroulette_data`. Mets un reverse-proxy HTTPS devant (voir plus bas).

### Variante `docker run` (sans compose)

```bash
# Build
docker build -t nextroulette .

# Run avec un volume persistant + secret
docker run -d --name nextroulette \
  -p 3000:3000 \
  -v nextroulette_data:/app/data \
  -e JWT_SECRET="$(openssl rand -base64 48)" \
  -e NEXT_PUBLIC_APP_URL="https://ton-domaine.fr" \
  nextroulette
```

Mets un reverse-proxy (Caddy, Nginx, Traefik) devant pour le HTTPS.

## 4. Sans Docker (serveur Node classique)

```bash
npm ci
JWT_SECRET="..." npm run build
# Le build « standalone » se lance ainsi :
DATABASE_PATH="/var/lib/nextroulette/nextroulette.db" \
JWT_SECRET="..." \
node .next/standalone/server.js
```

Assure-toi que le dossier de `DATABASE_PATH` existe et est **inscriptible**, et
qu'il est **sauvegardé** (c'est là que vivent parties + photos).

## 5. Et Vercel / Netlify ?

Possible, mais leur système de fichiers est **éphémère** : le SQLite serait
réinitialisé à chaque déploiement/scaling. Pour y aller, il faudrait migrer vers
une base managée (PostgreSQL/Neon) + un stockage d'images (Vercel Blob / S3).
C'est l'**étape « scale »** de la [roadmap](ROADMAP.md), pas nécessaire pour ce soir.

## 6. Checklist de mise en ligne

- [ ] `JWT_SECRET` fort défini (jamais celui de l'exemple)
- [ ] Volume persistant monté sur le dossier de `DATABASE_PATH`
- [ ] `NEXT_PUBLIC_APP_URL` = l'URL publique réelle
- [ ] HTTPS actif (cookies `secure` en production)
- [ ] Sauvegarde du fichier `.db` prévue si la soirée doit être conservée

## 7. Sauvegarde & remise à zéro

- **Sauvegarder** : copier le fichier `nextroulette.db` (+ `-wal`/`-shm` s'ils
  existent) suffit à tout conserver.
- **Repartir de zéro** : arrêter l'app, supprimer le fichier `.db`, redémarrer.
