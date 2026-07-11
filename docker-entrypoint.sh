#!/bin/sh
# Démarre en root, répare la propriété du dossier de données (les volumes
# Railway/Docker sont montés root:root), puis exécute l'app en utilisateur
# non privilégié `nextjs`.
set -e

DATA_DIR="$(dirname "${DATABASE_PATH:-/app/data/nextroulette.db}")"
mkdir -p "$DATA_DIR"
chown -R nextjs:nodejs "$DATA_DIR"

exec su-exec nextjs "$@"
