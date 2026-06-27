#!/bin/bash
# Script de deploiement production (a executer sur le serveur)
# Usage: bash deploy.sh [branch]

set -e

BRANCH="${1:-main}"
APP_DIR="/var/www/autoecoles"

echo "=== Deploiement AutoEcoles SaaS — branche: $BRANCH ==="

cd "$APP_DIR"

# 1. Activer le mode maintenance
php artisan down --render="errors::503" --retry=60

# 2. Mettre a jour le code
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# 3. Dependances PHP (sans dev)
composer install --no-dev --optimize-autoloader --no-interaction

# 4. Dependances JS et build
npm ci --omit=dev
npm run build

# 5. Migrations
php artisan migrate --force

# 6. Vider et rebuilder les caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan icons:cache 2>/dev/null || true

# 7. Queue workers: restart propre (zero downtime)
php artisan queue:restart

# 8. Permissions stockage
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 9. Sortir du mode maintenance
php artisan up

echo "=== Deploiement termine avec succes ! ==="
