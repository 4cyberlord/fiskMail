# Logging guide

How logs are set up and how to use them to fix bugs.

## Where logs are stored

| File | Contents |
|------|----------|
| `storage/logs/laravel-YYYY-MM-DD.log` | Main app log (daily rotation). Exceptions, framework messages, and anything sent to the default `Log` facade. |
| `storage/logs/laravel-app-YYYY-MM-DD.log` | Optional app channel. Use for focused debug logs (see below). |

Today’s main log is always `storage/logs/laravel-<today>.log`. Old files are kept for **14 days** (configurable via `LOG_DAILY_DAYS` in `.env`).

## Watch logs in real time

**Option 1 – Laravel Pail (recommended)**

```bash
php artisan pail
```

Streams the main log to the terminal. Use this while reproducing a bug.

**Option 2 – tail**

```bash
tail -f storage/logs/laravel-$(date +%Y-%m-%d).log
```

## Environment

In `.env`:

- `LOG_STACK=daily` – Use daily rotating files (already set).
- `LOG_DAILY_DAYS=14` – Keep logs for 14 days.
- `LOG_LEVEL=debug` – Log level (debug, info, warning, error, critical). Use `debug` locally to see more.

After changing these, run: `php artisan config:clear`.

## Logging for easier debugging

Add context when you log so you can track requests and fix bugs faster.

**Basic:**

```php
use Illuminate\Support\Facades\Log;

Log::info('OTP sent', ['email' => $email]);
Log::error('Login failed', ['email' => $email, 'reason' => $e->getMessage()]);
```

**With stack trace:**

```php
Log::error('Unexpected error', [
    'user_id' => auth()->id(),
    'exception' => $e->getMessage(),
    'trace' => $e->getTraceAsString(),
]);
```

**Dedicated app channel** (writes to `laravel-app-*.log` only):

```php
Log::channel('app')->info('Custom debug', ['step' => 'before_send_otp']);
```

Use the app channel for noisy or detailed debug logs so the main `laravel-*.log` stays easier to scan.

## Quick checklist when fixing a bug

1. Reproduce the issue with `php artisan pail` running (or `tail -f` on today’s log).
2. Check the latest entries in `storage/logs/laravel-<today>.log` for the request that failed.
3. Search the log file for the user email, route, or a string you log (e.g. “OTP sent”).
4. Add temporary `Log::info()` / `Log::error()` with context (user id, email, input) if you need more detail, then reproduce again.
