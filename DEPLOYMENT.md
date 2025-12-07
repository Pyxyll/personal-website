# Deployment Guide - Dokploy

This guide covers deploying the personal website to a VPS using Dokploy.

## Prerequisites

- A VPS with at least 1GB RAM (2GB recommended)
- Domain name pointed to your VPS IP
- SSH access to the server

## 1. Install Dokploy

SSH into your server and run:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Access Dokploy at `http://your-server-ip:3000` and create your admin account.

## 2. Create Project

1. In Dokploy, create a new **Project** (e.g., "Personal Website")
2. Add the following services:

## 3. Set Up PostgreSQL

1. Add a new **PostgreSQL** database service
2. Configure:
   - Database Name: `personal_website`
   - Username: `laravel`
   - Password: (generate a secure password)
3. Note the internal hostname (usually `postgres` or the service name)

## 4. Deploy Backend (Laravel)

1. Add a new **Application** service
2. Connect your Git repository
3. Set source path: `/backend`
4. Set build method: **Dockerfile**
5. Add environment variables:

```
APP_NAME=Dylan Collins
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=your-postgres-service-name
DB_PORT=5432
DB_DATABASE=personal_website
DB_USERNAME=laravel
DB_PASSWORD=your-db-password

CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=sync

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com

# Admin user for seeding
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_NAME=Your Name
ADMIN_PASSWORD=your-secure-admin-password
```

6. Set up domain: `api.yourdomain.com`
7. Enable HTTPS (Let's Encrypt)

### Generate APP_KEY

Run locally or in the container:
```bash
php artisan key:generate --show
```

## 5. Deploy Frontend (Next.js)

1. Add a new **Application** service
2. Connect your Git repository
3. Set source path: `/frontend`
4. Set build method: **Dockerfile**
5. Add build arguments:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

6. Set up domain: `yourdomain.com`
7. Enable HTTPS (Let's Encrypt)

## 6. Run Migrations

After deploying the backend, run migrations:

1. Go to your backend service in Dokploy
2. Open the **Terminal** tab
3. Run:

```bash
php artisan migrate --force
php artisan db:seed --class=AdminUserSeeder --force
```

## 7. DNS Configuration

Add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | your-server-ip |
| A | api | your-server-ip |
| A | www | your-server-ip |

Or use Cloudflare for DNS + CDN.

## Environment Variables Reference

### Backend (Laravel)

| Variable | Description |
|----------|-------------|
| APP_KEY | Laravel encryption key |
| APP_URL | Backend URL |
| DB_HOST | PostgreSQL service hostname |
| DB_PASSWORD | Database password |
| SANCTUM_STATEFUL_DOMAINS | Frontend domain(s) |
| ADMIN_EMAIL | Admin user email for seeding |
| ADMIN_NAME | Admin user name for seeding |
| ADMIN_PASSWORD | Admin user password for seeding |

### Frontend (Next.js)

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | Backend API URL |
| NEXT_PUBLIC_SITE_URL | Frontend URL |

## Updating

1. Push changes to your Git repository
2. In Dokploy, click **Redeploy** on the service
3. Or enable auto-deploy from Git webhooks

## Troubleshooting

### Check Logs
- Go to service > Logs tab in Dokploy

### Database Connection Issues
- Ensure DB_HOST matches the PostgreSQL service name
- Check if PostgreSQL is healthy

### CORS Issues
- Verify SANCTUM_STATEFUL_DOMAINS includes your frontend domain
- Check SESSION_DOMAIN is set correctly

### Build Failures
- Check Dockerfile syntax
- Ensure all dependencies are available
- Review build logs in Dokploy
