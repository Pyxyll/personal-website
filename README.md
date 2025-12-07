# Personal Website

A personal portfolio website with an ASCII/terminal aesthetic, built with Next.js, Laravel, and PostgreSQL.

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗ ██╗   ██╗██╗  ██╗██╗   ██╗██╗                   ║
║   ██╔══██╗╚██╗ ██╔╝╚██╗██╔╝╚██╗ ██╔╝██║                   ║
║   ██████╔╝ ╚████╔╝  ╚███╔╝  ╚████╔╝ ██║                   ║
║   ██╔═══╝   ╚██╔╝   ██╔██╗   ╚██╔╝  ██║                   ║
║   ██║        ██║   ██╔╝ ██╗   ██║   ███████╗              ║
║   ╚═╝        ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝              ║
║                                                           ║
║   [ Developer / Creator / Builder ]                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable UI components
- **TypeScript** - Type-safe JavaScript
- **IBM Plex Mono** - Monospace font for terminal aesthetic

### Backend
- **Laravel 12** - PHP framework
- **PostgreSQL** - Database
- **Laravel Sanctum** - API authentication

## Features

- **Home Page** - ASCII art logo, featured projects, recent blog posts
- **About Page** - Bio, skills, timeline, contact info
- **CV Page** - Professional experience, education, certifications
- **Projects Page** - Filterable project showcase
- **Blog** - Markdown blog posts with tags and search
- **Now Page** - Current focus and activities (inspired by nownownow.com)

## Getting Started

### Prerequisites
- Node.js 18+
- PHP 8.2+
- Composer
- PostgreSQL (or use SQLite for development)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure database in .env
# For SQLite (easy setup):
# DB_CONNECTION=sqlite

# For PostgreSQL:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=personal_website
# DB_USERNAME=postgres
# DB_PASSWORD=your_password

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Start the server
php artisan serve
```

The API will be available at `http://localhost:8000`

## Project Structure

```
personal-website/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/
│   │   │   ├── ascii/       # ASCII-styled components
│   │   │   └── ui/          # shadcn/ui components
│   │   └── lib/             # Utilities and API client
│   └── ...
│
├── backend/                  # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/     # API controllers
│   │   └── Models/          # Eloquent models
│   ├── database/
│   │   └── migrations/      # Database migrations
│   └── routes/
│       └── api.php          # API routes
│
└── README.md
```

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects` | List all projects |
| GET | `/api/v1/projects/{slug}` | Get project by slug |
| GET | `/api/v1/posts` | List published blog posts |
| GET | `/api/v1/posts/{slug}` | Get post by slug |
| GET | `/api/v1/posts/tags` | Get all tags |
| GET | `/api/v1/now` | Get current /now page content |

### Protected Endpoints (require authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/projects` | Create project |
| PUT | `/api/v1/projects/{id}` | Update project |
| DELETE | `/api/v1/projects/{id}` | Delete project |
| POST | `/api/v1/posts` | Create blog post |
| PUT | `/api/v1/posts/{id}` | Update blog post |
| DELETE | `/api/v1/posts/{id}` | Delete blog post |
| POST | `/api/v1/now` | Create now update |
| PUT | `/api/v1/now/{id}` | Update now entry |
| DELETE | `/api/v1/now/{id}` | Delete now entry |

## Customization

### Updating Content

The frontend currently uses static data in the page components. To use the API:

1. Set up the Laravel backend with a database
2. Seed the database with your content
3. Update the page components to fetch from the API

### Changing Colors

The ASCII terminal theme colors are defined in `frontend/src/app/globals.css`. Key variables:

- `--primary`: Main accent color (default: #00ff00 - terminal green)
- `--accent`: Secondary accent color (default: #00ffff - cyan)
- `--background`: Background color (default: #0a0a0a)
- `--foreground`: Text color (default: #e0e0e0)

### Updating ASCII Logo

Edit `frontend/src/components/ascii/AsciiLogo.tsx` to customize the ASCII art.

## License

MIT
