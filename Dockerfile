# Build the Astro site, then run it as a small Node server.
# Most routes are pre-rendered static HTML (great for SEO); the Node runtime
# exists only to serve them + the on-demand routes (/api/like, /health/check).

FROM node:20-alpine AS builder
WORKDIR /app
# Canonical origin baked into the build (sitemap + <link rel=canonical>).
# Override per environment, e.g. werf/docker build --build-arg SITE_URL=https://onezee.ru
ARG SITE_URL=https://onezee.dev
ENV SITE_URL=$SITE_URL
# Umami analytics tag — baked at build time (Astro reads PUBLIC_* during `astro build`).
# Empty by default → BaseHead omits the tag, so local/dev images stay clean.
ARG PUBLIC_UMAMI_SRC=
ARG PUBLIC_UMAMI_WEBSITE_ID=
ENV PUBLIC_UMAMI_SRC=$PUBLIC_UMAMI_SRC
ENV PUBLIC_UMAMI_WEBSITE_ID=$PUBLIC_UMAMI_WEBSITE_ID
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
