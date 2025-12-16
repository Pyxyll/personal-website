#!/bin/sh
set -e

echo "=== Starting entrypoint script ==="

# Create log directories
mkdir -p /var/log/php
mkdir -p /var/log/supervisor
mkdir -p /var/log/nginx
mkdir -p /run/nginx

echo "Log directories created"

# Wait for database to be ready
echo "Waiting for database at ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
timeout=60
counter=0
while ! nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432}; do
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
        echo "ERROR: Database connection timeout after ${timeout} seconds"
        exit 1
    fi
    echo "Waiting... ($counter/$timeout)"
    sleep 1
done
echo "Database is ready!"

# Run migrations
echo "Running migrations..."
php artisan migrate --force || echo "Migration failed but continuing..."

# Create storage symlink for serving uploaded files
echo "Creating storage symlink..."
php artisan storage:link --force || true

# Clear and cache config
echo "Optimizing application..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Create upload directories
echo "Creating upload directories..."
mkdir -p /var/www/html/storage/app/public/images/posts

# Set permissions (use numeric IDs for compatibility)
echo "Setting permissions..."
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage

echo "=== Starting supervisord ==="
exec "$@"
