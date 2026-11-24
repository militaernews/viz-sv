# viz

Reverse media search over Telegram channels: upload a photo (or type text) and find the earliest post of that media in an origin channel and in a backup channel.

This repository holds both parts:

| Folder | What | Stack |
|---|---|---|
| `/` (root) | Web app with the search UI; it proxies requests to the backend API | SvelteKit, Bun, deployed on Vercel |
| [`backend/`](backend/) | Telegram ingest (watcher and backfill), CLIP embeddings, dhash, thumbnails and the search API | Rust (axum, grammers), Postgres, Qdrant, S3 |

`backend/` used to be the separate `viz-rs` repository; its full commit history was moved here.

## Web app

```sh
bun install
bun run dev
```

Environment variables (server-side only):

| Variable | Description |
|---|---|
| `API_BASE_URL` | Base URL of the backend API (`backend/`, binary `api`) |
| `BACKEND_API_KEY` | Shared key, sent as `x-api-key`; must match the backend's `BACKEND_API_KEY` |

`bun run check` type-checks, `bun run lint` runs Prettier and ESLint, `bun run build` builds for production.

## Backend

See [`backend/README.md`](backend/README.md) for the infrastructure, the CLIP models, ingesting channels and running the API. Everything there runs from inside `backend/`:

```sh
cd backend
podman compose up -d
cargo run --release --bin api
```
