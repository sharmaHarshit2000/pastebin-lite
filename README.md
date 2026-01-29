# Pastebin-Lite

A small Pastebin-like application. Users can create a text paste and
share a link to view it.

Optional constraints:
- time-based expiry (TTL)
- view-count limit (max_views)


## GitHub Repository

https://github.com/sharmaHarshit2000/pastebin-lite

## Vercel Deployment

https://pastebin-lite-five-iota.vercel.app

## Tech stack

-   Next.js (App Router)
-   Upstash Redis (persistence)

## Run locally

### 1) Install dependencies

``` bash
npm install
```

### 2) Configure environment variables

Create `.env.local` from the example:

``` bash
cp .env.example .env.local
```

Edit `.env.local` and set:

    UPSTASH_REDIS_REST_URL
    UPSTASH_REDIS_REST_TOKEN

(You can get these from your Upstash Redis dashboard.)

### 3) Start dev server

``` bash
npm run dev
```

Open:\
http://localhost:3000

------------------------------------------------------------------------

## Persistence layer

This app uses Upstash Redis for persistence.\
Each paste is stored as a Redis hash containing:

- `content`
- `created_at_ms`
- `expires_at_ms`
- `remaining_views`


------------------------------------------------------------------------

## Design decisions

### View limits

`GET /api/pastes/:id` **counts as a view**.

View decrement and enforcement are done **atomically** with a Redis Lua
script to avoid race conditions.

`GET /p/:id` returns HTML and **does NOT decrement views** (as required
in the assignment).

------------------------------------------------------------------------

### TTL expiry

TTL is enforced at read time:

    now > expires_at_ms → paste expired (404)

------------------------------------------------------------------------

### Deterministic time for testing (TEST_MODE)

If `TEST_MODE=1`:

-   The header `x-test-now-ms: <timestamp>` becomes the "current time".
-   If the header is missing → fallback to real system time.

This is required for automated grading.

------------------------------------------------------------------------

## Required routes

### `GET /api/healthz`

Returns:

``` json
{ "ok": true }
```

### `POST /api/pastes`

Creates a paste and returns:

``` json
{ "id": "...", "url": "..." }
```

### `GET /api/pastes/:id`

Fetches paste content and counts as a view.

### `GET /p/:id`

Returns HTML rendering the paste safely.

------------------------------------------------------------------------

## Quick test checklist (curl)

### Health check

``` bash
curl -i http://localhost:3000/api/healthz
```

### Create a paste

``` bash
curl -s -X POST http://localhost:3000/api/pastes   -H 'content-type: application/json'   -d '{"content":"hello","max_views":2,"ttl_seconds":60}'
```

### Fetch a paste

``` bash
curl -i http://localhost:3000/api/pastes/<id>
```

### View-limit behavior

For `max_views=2`:

``` bash
curl -i http://localhost:3000/api/pastes/<id>  # 200
curl -i http://localhost:3000/api/pastes/<id>  # 200
curl -i http://localhost:3000/api/pastes/<id>  # 404
```

### Deterministic TTL test (TEST_MODE)

1.  Set `TEST_MODE=1` in `.env.local`
2.  Restart server
3.  Create with `ttl_seconds=1`
4.  Fetch using fake time:

``` bash
curl -i http://localhost:3000/api/pastes/<id>   -H 'x-test-now-ms: 9999999999999'
```
