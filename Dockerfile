# syntax=docker/dockerfile:1
#
# Több lépcsős build a Next.js standalone szerverhez.
# A futó konténer a 3000-es porton figyel — ezt várja a tárhelyszolgáltatás.

# -----------------------------------------------------------------------------
# 1. Függőségek
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Csak a lockfile-ok, hogy ez a réteg addig cache-elt maradjon, amíg egy
# függőség tényleg nem változik — a teljes forrás bemásolása minden szerkesztésnél
# érvénytelenítené.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund


# -----------------------------------------------------------------------------
# 2. Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# A `NEXT_PUBLIC_*` értékek build időben égnek bele a kliens bundle-be, tehát a
# publikus URL-t itt kell tudni — nem a konténer indulásakor. Felülírás:
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://example.hu
ARG NEXT_PUBLIC_SITE_URL=https://klivo.hu
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Build idejű helyőrző. A `lib/auth/jwt.ts` kulcs nélkül kivételt dob, és az
# admin belépő oldal előrenderelése eléri ezt a kódot. A valódi kulcs futásidőben
# érkezik a környezetből; ez az érték soha nem ír alá felhasználóhoz kerülő tokent.
ENV ADMIN_JWT_SECRET=build-time-placeholder-not-used-at-runtime-0000

# A vetés (seed) a build ELŐTT fut, két okból, és mindkettő számít:
#
#   1. A blog lista és a cikkoldalak a build során előrenderelődnek. Üres
#      adatkönyvtárral "még nincs bejegyzés" állapotban sülnek be, és az ISR
#      ablak miatt a frissen deployolt oldal még a vetés után is ezt szolgálná ki.
#
#   2. A Docker az ÜRES named volume-ot az image tartalmából tölti fel az első
#      csatoláskor. Ha tehát a /app/data benne van az image-ben, az első
#      indításkor magától bevetül — és minden későbbi deploynál érintetlen marad,
#      mert a volume már nem üres.
#
# A script idempotens, így soha nem írja felül az adminban szerkesztett tartalmat.
RUN node scripts/seed-content.mjs \
 && npm run build


# -----------------------------------------------------------------------------
# 3. Futásidő
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Az alkalmazás futásidőben ide ír; csatolj ide volume-ot, különben minden
# bejegyzés, megkeresés és beállítás elvész a következő deploynál.
ENV DATA_DIR=/app/data

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# A `standalone` már tartalmaz egy minimális node_modules-t és a server.js-t.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# A seed script bent marad, hogy a tartalom később újravethető legyen:
#   docker compose exec klivo_web node scripts/seed-content.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# A bevetett tartalom, amelyet a Docker az első csatoláskor bemásol az üres
# named volume-ba. Ettől működik a blog azonnal egy friss deploy után.
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

# Ide írunk futásidőben (bejegyzések, megkeresések, feltöltött borítóképek),
# ezért az alkalmazás felhasználójáé kell legyen. Az itteni létrehozás miatt egy
# csatolt kötet nélküli első indítás is működik.
RUN mkdir -p /app/data/uploads \
 && chown -R nextjs:nodejs /app/data

# A szerver soha nem fut rootként: egy távoli kódfuttatási hiba bármelyik
# függőségben így elszigetelt hiba marad, nem konténer-átvétel.
USER nextjs

EXPOSE 3000

# A healthcheck a főoldalt kéri le; egy hibás renderelés jelölje a konténert
# egészségtelennek, ahelyett hogy némán hibát szolgálna ki.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
