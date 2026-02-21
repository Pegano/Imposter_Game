# Tech Stack

## Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        TECH STACK                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   FRONTEND                        BACKEND                       │
│   ┌─────────────────────┐        ┌─────────────────────┐       │
│   │  React + TypeScript │        │  Node.js + Express  │       │
│   │  Vite (bundler)     │        │  Socket.IO          │       │
│   │  TailwindCSS        │        │  TypeScript         │       │
│   │  PWA (installable)  │        │                     │       │
│   └─────────────────────┘        └─────────────────────┘       │
│                                             │                   │
│                                             ▼                   │
│                                  ┌─────────────────────┐       │
│                                  │  SQLite + Prisma    │       │
│                                  └─────────────────────┘       │
│                                                                 │
│   DEPLOYMENT                                                    │
│   ┌─────────────────────────────────────────────────────┐      │
│   │  VPS: Docker Compose (frontend + backend + db)      │      │
│   │  CI/CD: GitHub Actions                              │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend

### Core: React + Vite + TypeScript

| Criterium | Waarom React |
|-----------|--------------|
| **Snelle iteratie** | Hot reload, grote ecosystem |
| **PWA support** | Vite PWA plugin, makkelijke setup |
| **Animaties** | Framer Motion voor kaart-flip animaties |
| **Kindvriendelijk** | Touch-friendly componenten |
| **Consistentie** | Zelfde stack als andere projecten |

### Styling: TailwindCSS

| Waarom |
|--------|
| Snel prototypen |
| Responsive out-of-box |
| Consistente design tokens |
| Kleine bundle (purge unused) |

### State Management: Zustand

```typescript
// Simpel en type-safe
const useGameStore = create<GameState>((set) => ({
  session: null,
  players: [],
  setSession: (session) => set({ session }),
  addPlayer: (player) => set((s) => ({
    players: [...s.players, player]
  })),
}))
```

| Waarom Zustand |
|----------------|
| Minimale boilerplate |
| TypeScript native |
| Geen providers nodig |
| Makkelijke devtools |

### Animaties: Framer Motion

```typescript
// Kaart flip animatie
<motion.div
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={{ duration: 0.6 }}
>
  {isFlipped ? <CardFront /> : <CardBack />}
</motion.div>
```

---

## Backend

### Core: Node.js + Express + TypeScript

| Criterium | Waarom Node.js |
|-----------|----------------|
| **WebSocket native** | Socket.IO is de standaard |
| **Zelfde taal** | TypeScript front + back |
| **SQLite support** | Prisma werkt perfect |
| **Simpele deploy** | Single process, makkelijk op VPS |

### Real-time: Socket.IO

```typescript
// Server
io.on('connection', (socket) => {
  socket.on('join_game', ({ code, name }) => {
    socket.join(code)
    io.to(code).emit('player_joined', { name })
  })
})

// Client
socket.emit('join_game', { code: 'BLAUW-7392', name: 'Piet' })
socket.on('player_joined', (player) => {
  // Update UI
})
```

| Waarom Socket.IO |
|------------------|
| Automatische reconnect |
| Room support (per game) |
| Fallback naar polling |
| Grote community |

### ORM: Prisma

```prisma
model Word {
  id         String   @id @default(uuid())
  word       String
  hintEasy   String
  hintMedium String
  hintHard   String
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId String
}
```

| Waarom Prisma |
|---------------|
| Type-safe queries |
| Makkelijke migrations |
| SQLite → PostgreSQL later mogelijk |
| Goede DX |

---

## Database: SQLite

| Aspect | SQLite |
|--------|--------|
| Setup | Geen server nodig, file-based |
| Performance | Meer dan voldoende voor deze app |
| Backup | Kopieer één bestand |
| Migratie | Prisma migrate |

### Schema

```
┌──────────────┐     ┌──────────────┐
│  Category    │────<│    Word      │
└──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐
│ PlayerGroup  │────<│   Player     │
└──────────────┘     └──────────────┘
```

---

## PWA Setup

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Imposter Game',
        short_name: 'Imposter',
        theme_color: '#6366f1',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ]
      }
    })
  ]
}
```

| PWA Features |
|--------------|
| Installeerbaar op home screen |
| Offline fallback pagina |
| Full-screen modus |
| App icons |

---

## Project Structuur

```
imposter-game/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/         # Buttons, Cards, etc.
│   │   │   │   ├── game/       # Game-specific components
│   │   │   │   └── avatars/    # Avatar componenten
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Lobby.tsx
│   │   │   │   ├── Game.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSocket.ts
│   │   │   │   └── useGame.ts
│   │   │   ├── stores/         # Zustand state
│   │   │   └── lib/
│   │   ├── public/
│   │   │   └── avatars/        # Avatar images
│   │   └── vite.config.ts
│   │
│   └── server/                 # Node.js backend
│       ├── src/
│       │   ├── routes/
│       │   ├── socket/
│       │   │   ├── handlers.ts
│       │   │   └── events.ts
│       │   ├── services/
│       │   │   ├── game.ts
│       │   │   └── words.ts
│       │   └── db/
│       │       └── prisma/
│       └── package.json
│
├── packages/
│   └── shared/                 # Gedeelde types
│       └── types.ts
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

---

## Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  web:
    build: ./apps/web
    ports:
      - "3000:80"
    depends_on:
      - server

  server:
    build: ./apps/server
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=file:/app/data/imposter.db
      - NODE_ENV=production
```

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to VPS
        run: |
          ssh user@server 'cd /app && git pull && docker-compose up -d --build'
```

---

## Dependencies Overzicht

### Frontend (apps/web)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "zustand": "^4.x",
    "socket.io-client": "^4.x",
    "framer-motion": "^10.x",
    "@tanstack/react-query": "^5.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "vite-plugin-pwa": "^0.17.x"
  }
}
```

### Backend (apps/server)

```json
{
  "dependencies": {
    "express": "^4.x",
    "socket.io": "^4.x",
    "@prisma/client": "^5.x",
    "cors": "^2.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "prisma": "^5.x",
    "tsx": "^4.x",
    "nodemon": "^3.x"
  }
}
```
