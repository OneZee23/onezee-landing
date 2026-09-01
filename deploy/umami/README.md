# Self-hosted Umami for onezee.dev

Cookieless, privacy-friendly analytics for the site + blog. Fronted by its **own
Cloudflare Tunnel** — same pattern as onezee.dev itself: no inbound ports, TLS at
Cloudflare's edge, no Caddy/nginx to manage. Three containers: `umami` +
`postgres` + `cloudflared`.

> ⚠️ **Where to run it.** Not on `tt-edge-ru` — that box is ~1 GB and already runs
> the site + redis + triptrack passthrough. Umami + Postgres want ~400–500 MB.
> Use a separate small droplet (cheapest tier is fine), or, if you must reuse a
> box, add a swap file first (`fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`).

## 1. Create the tunnel in Cloudflare

Zero Trust → **Networks → Tunnels** → *Create a tunnel* → **Cloudflared** →
name `umami-onezee` → Save. Copy the **token** (the long string after `--token`).
Leave the Public Hostname step for later (step 3) — the service must be up first.

## 2. Bring Umami up (on the box)

```bash
scp -r deploy/umami onezee@<BOX_IP>:~/umami     # from your Mac
ssh onezee@<BOX_IP>
cd ~/umami
cp .env.example .env
# generate + paste the two secrets, and the tunnel token from step 1:
echo "UMAMI_DB_PASSWORD=$(openssl rand -base64 24)"
echo "UMAMI_APP_SECRET=$(openssl rand -base64 40)"
nano .env                       # fill all three vars
docker compose up -d
docker compose logs -f umami    # wait for "Listening on" (it migrates the DB on first boot)
```

## 3. Route the hostname

Back in the tunnel → **Public Hostnames** → *Add a public hostname*:
- Subdomain `umami` · Domain `onezee.dev`
- Service **HTTP** → URL `http://umami:3000`

Cloudflare auto-creates the `umami.onezee.dev` CNAME. Open it.

## 4. First login → create the website

1. Log in with default `admin` / `umami`. **Change the password immediately.**
2. Settings → Websites → **Add website**: name `onezee.dev`, domain `onezee.dev`.
3. Open it → **Edit** → copy the **Website ID** (UUID).

## 5. Wire the site to it (build-time vars)

The tracking tag is baked into the static build (see `Dockerfile` + BaseHead), so
set them as **GitHub repo Variables** — the image build picks them up:

```bash
gh variable set PUBLIC_UMAMI_SRC --body "https://umami.onezee.dev/script.js"
gh variable set PUBLIC_UMAMI_WEBSITE_ID --body "<Website ID from step 4>"
gh workflow run build-image.yml --ref master   # rebuild :latest with the tag baked in
```

The host cron on tt-edge-ru pulls the new `:latest` within ~5 min. Verify in
Umami → **Realtime** by opening onezee.dev.

## Maintenance

- **Update Umami:** `docker compose pull && docker compose up -d` (migrations run on boot).
- **Backups:** data is in the `umami-db` volume — snapshot it / `pg_dump` on your usual cadence.
