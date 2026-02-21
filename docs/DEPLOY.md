# Deployment Guide

## Overzicht

De app draait via Docker Compose op de VPS. GitHub Actions bouwt de images automatisch en deployt bij elke push naar `main`.

```
GitHub push → Actions: build images → push to ghcr.io → SSH naar VPS → docker compose up
```

**Stack op VPS:**
- VPS nginx (bestaand) → poort 3010 → Docker web container (nginx + static files)
- Docker web container proxyt `/api` en `/socket.io` → server container
- Docker server container → SQLite in Docker volume

---

## Eenmalige VPS setup

### 1. Docker installeren op VPS

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Log opnieuw in om groepswijziging te activeren.

### 2. App directory aanmaken

```bash
mkdir -p ~/imposter-game
```

### 3. VPS nginx configureren

Voeg een nieuw server block toe (of een location in het bestaande config):

```nginx
server {
    listen 443 ssl;
    server_name imposter.jouwdomain.nl;

    ssl_certificate     /etc/letsencrypt/live/imposter.jouwdomain.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/imposter.jouwdomain.nl/privkey.pem;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

SSL aanvragen:
```bash
sudo certbot --nginx -d imposter.jouwdomain.nl
```

---

## GitHub Secrets instellen

Ga naar je GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Voeg toe:

| Secret | Waarde |
|--------|--------|
| `VPS_HOST` | IP of domein van je VPS |
| `VPS_USER` | SSH gebruikersnaam (bijv. `root`) |
| `VPS_SSH_KEY` | Inhoud van je private SSH key (`~/.ssh/id_rsa`) |

`GITHUB_TOKEN` is automatisch beschikbaar — geen actie nodig.

---

## Eerste deployment

1. Push naar `main` branch
2. GitHub Actions bouwt de images en pusht naar `ghcr.io`
3. Actions SSH't naar VPS en runt `docker compose pull && docker compose up -d`
4. Database wordt automatisch aangemaakt + geseed bij de eerste start

Controleer de logs:
```bash
# Op de VPS
cd ~/imposter-game
docker compose logs -f server   # server logs
docker compose logs -f web      # nginx logs
```

---

## Handmatige deploy (noodgeval)

```bash
# Op de VPS
cd ~/imposter-game
export GITHUB_REPOSITORY_OWNER=Pegano
echo "GITHUB_TOKEN" | docker login ghcr.io -u Pegano --password-stdin
docker compose pull
docker compose up -d
```

---

## Database beheer

De SQLite database staat in een Docker volume (`db_data`). Backup:

```bash
# Op de VPS — database exporteren
docker run --rm \
  -v imposter-game_db_data:/data \
  -v $(pwd):/backup \
  alpine \
  cp /data/imposter.db /backup/imposter-backup-$(date +%Y%m%d).db
```

---

## Poorten overzicht

| Container | Interne poort | Extern |
|-----------|---------------|--------|
| web (nginx) | 80 | 3010 → VPS nginx |
| server (node) | 3001 | alleen intern |

---

## Deployment flow diagram

```
git push main
     │
     ▼
GitHub Actions
     ├── Build web image  → ghcr.io/pegano/imposter-game-web:latest
     ├── Build server image → ghcr.io/pegano/imposter-game-server:latest
     └── SSH naar VPS
              ├── docker compose pull
              └── docker compose up -d
                       │
                       ├── web container (nginx:alpine)
                       │     ├── Serveert static files
                       │     └── Proxyt /api + /socket.io → server
                       └── server container (node:20-alpine)
                             ├── prisma db push (schema sync)
                             ├── seed.ts (woorden/categorieën)
                             └── tsx src/index.ts (Express + Socket.IO)
```
