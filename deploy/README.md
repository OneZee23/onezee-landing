# Deploying onezee.dev (Docker Compose + Cloudflare Tunnel)

onezee.dev runs as three small containers on **tt-edge-ru** (`217.198.9.156`):

| service | what it is |
|---|---|
| `app` | the Astro Node server (SSR + `/api/like`, `/api/view`), image from GHCR |
| `redis` | persists likes + view counts (AOF on a Docker volume) |
| `cloudflared` | Cloudflare Tunnel: serves `onezee.dev → http://app:4321` |

No inbound ports are opened. The tunnel reaches the app from *inside* the compose
network, so the existing triptrack `443` TCP passthrough is never touched.

```
visitor ─https─▶ Cloudflare ─tunnel─▶ cloudflared ─▶ app:4321 ─▶ redis
```

---

## One-time setup

### 1. Build & publish the image (GitHub)
The **Build image** workflow builds the Dockerfile and pushes
`ghcr.io/onezee23/onezee-landing:latest`. Run it once now:
Actions → **Build image** → *Run workflow* (or just push to `master`).

Then make the package pullable from the server — either:
- make it **public**: GitHub → your profile → Packages → `onezee-landing` → Package settings → *Change visibility → Public*, **or**
- `docker login ghcr.io -u onezee23` on the server with a PAT (read:packages).

### 2. Create the Cloudflare Tunnel
Cloudflare dashboard → **Zero Trust** → **Networks → Tunnels** → *Create a tunnel*
→ type **Cloudflared** → name it `onezee` → **Save**.
- Copy the **token** (the long string after `--token` in the shown install command).
- Tab **Public Hostnames** → *Add a public hostname*:
  - Subdomain: *(empty)* · Domain: **onezee.dev** · Path: *(empty)*
  - Service: **HTTP** · URL: **app:4321**
  - (optional) add another for `www.onezee.dev` the same way.

Cloudflare auto-creates the `onezee.dev` CNAME to the tunnel. In **DNS**, delete
the old **A record** that pointed at the dead Timeweb origin. Set **SSL/TLS → Full**.

### 3. Install Docker on the server
```bash
ssh onezee@217.198.9.156
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker onezee
exit            # re-login so the docker group applies
```

### 4. Start it
```bash
ssh onezee@217.198.9.156
mkdir -p ~/onezee && cd ~/onezee
# copy deploy/docker-compose.yml and deploy/.env.example here (scp or paste)
cp .env.example .env
nano .env       # paste TUNNEL_TOKEN=...
docker compose up -d
docker compose ps
docker compose logs -f cloudflared   # should show 4 connections registered
```

Open https://onezee.dev — new site. Like/view counters now persist in Redis.

---

## Updating (auto-deploy)
Push to `master` (or a Telegram ingest) → **Build image** publishes a fresh `:latest`.
A host cron pulls it within ~5 min and restarts only `app`:
```cron
*/5 * * * * cd /home/onezee/onezee && /usr/bin/docker compose pull -q app && /usr/bin/docker compose up -d app >> /home/onezee/onezee/deploy.log 2>&1
```
Install it once with:
```bash
( crontab -l 2>/dev/null; echo '*/5 * * * * cd /home/onezee/onezee && /usr/bin/docker compose pull -q app && /usr/bin/docker compose up -d app >> /home/onezee/onezee/deploy.log 2>&1' ) | crontab -
```
`pull` is a cheap digest check when nothing changed; `up -d app` only recreates the
container when the image actually changed. Watch progress in `~/onezee/deploy.log`.
Manual deploy any time: `cd ~/onezee && docker compose pull app && docker compose up -d app`.

> We use cron instead of a watchtower container: the unmaintained `containrrr/watchtower`
> image ships a Docker API client too old for modern Docker daemons (API ≥ 1.40).

## Handy
```bash
docker compose logs -f app            # app logs
docker compose restart app            # restart just the app
docker stats --no-stream              # memory use (box has ~1 GB)
docker exec -it onezee-redis-1 redis-cli ping
```
