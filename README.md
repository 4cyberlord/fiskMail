# fiskMail

Laravel 12 application with Inertia.js, React, and Tailwind CSS.

## Requirements

- **PHP** 8.2 or higher
- **Composer**
- **Node.js** 18+ and npm
- **SQLite** (default) or MySQL / MariaDB / PostgreSQL

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/4cyberlord/fiskMail.git
   cd fiskMail
   ```

2. **Install PHP dependencies**

   ```bash
   composer install
   ```

3. **Environment and key**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database**

   Using SQLite (default in `.env.example`):

   ```bash
   touch database/database.sqlite
   php artisan migrate
   ```

   Or set `DB_CONNECTION`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `.env` for MySQL/PostgreSQL, then run:

   ```bash
   php artisan migrate
   ```

5. **Frontend assets**

   ```bash
   npm install
   npm run build
   ```

   **One-line setup** (after cloning): runs composer install, copies `.env`, generates key, runs migrations, npm install, and build:

   ```bash
   composer run setup
   ```

   Ensure `.env` exists and database is configured before `composer run setup`, or run the steps above manually.

## Configuration

Edit `.env` for your environment.

| Variable | Description |
|----------|-------------|
| `APP_NAME` | Application name. |
| `APP_ENV` | `local`, `staging`, or `production`. |
| `APP_DEBUG` | `true` in development, `false` in production. |
| `APP_URL` | Full URL (e.g. `http://localhost:8000`). Required for links and redirects. |
| `DB_CONNECTION` | `sqlite`, `mysql`, or `pgsql`. |
| `DB_*` | Database host, name, username, password (when not using SQLite). |
| `SESSION_DRIVER` | `database` (default), `file`, or `redis`. |
| `MAIL_MAILER` | Mail driver; `.env.example` uses SMTP (e.g. Mailtrap). Set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` as needed. |
| `LOG_CHANNEL` | `stack` (default). `LOG_STACK` and `LOG_DAILY_DAYS` control log targets and retention. |

After changing `.env`, clear config cache in production:

```bash
php artisan config:clear
```

## Running the application

- **Backend only** (use a built frontend):

  ```bash
  php artisan serve
  ```

  Then open `http://localhost:8000` (or your `APP_URL`).

- **Backend + frontend dev server** (hot reload for assets):

  ```bash
  composer run dev
  ```

  Or in two terminals:

  ```bash
  php artisan serve
  npm run dev
  ```

## Development

- **Code style (PHP):** `vendor/bin/pint --dirty --format agent`
- **Code style (JS/TS):** `npm run format`
- **Lint:** `npm run lint`
- **Tests:** `php artisan test --compact`
