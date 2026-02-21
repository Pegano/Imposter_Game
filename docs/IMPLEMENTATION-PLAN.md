# Implementation Plan

## Milestone Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                     IMPLEMENTATION ROADMAP                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  M1: FOUNDATION        M2: CORE GAME       M3: MULTI-DEVICE    │
│  ┌─────────────┐       ┌─────────────┐     ┌─────────────┐     │
│  │ Project     │       │ Single-     │     │ WebSocket   │     │
│  │ Setup +     │  ──►  │ Device      │ ──► │ Sync +      │     │
│  │ Database    │       │ Gameplay    │     │ Join Flow   │     │
│  └─────────────┘       └─────────────┘     └─────────────┘     │
│                                                                 │
│  M4: POLISH            M5: DEPLOY          M6: EXTRAS          │
│  ┌─────────────┐       ┌─────────────┐     ┌─────────────┐     │
│  │ Animations  │       │ Docker +    │     │ Scoring,    │     │
│  │ + PWA +     │  ──►  │ VPS +       │ ──► │ Stats,      │     │
│  │ UX          │       │ CI/CD       │     │ Themes      │     │
│  └─────────────┘       └─────────────┘     └─────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## M1: Foundation (Project Setup + Database)

### Doel
Werkende project structuur met database en basis UI componenten.

### Taken

- [ ] **1.1 Project Scaffolding**
  - Monorepo setup (apps/web, apps/server, packages/shared)
  - TypeScript config (shared tsconfig)
  - ESLint + Prettier
  - Git repo + .gitignore

- [ ] **1.2 Frontend Basis**
  - Vite + React + TypeScript
  - TailwindCSS setup
  - Router (React Router)
  - Zustand store skeleton
  - Basis pagina's (Home, Lobby, Game, Settings)

- [ ] **1.3 Backend Basis**
  - Express + TypeScript
  - Prisma + SQLite setup
  - Database schema (Category, Word, PlayerGroup, Player)
  - Seed data (default categorieën + woorden)
  - REST endpoints: GET /categories, GET /words

- [ ] **1.4 UI Component Library**
  - Button, Card, Input, Modal
  - Avatar component (met preset images)
  - PlayerCard component

- [ ] **1.5 Avatar Assets**
  - 12 preset avatars (DiceBear of open source)
  - Elk 2 staten: sleeping / awake
  - Avatar selector component

### Testbaar
```bash
# App start, database bevat seed data, UI toont avatars
cd apps/web && npm run dev     # Frontend op localhost:5173
cd apps/server && npm run dev  # Backend op localhost:3001
curl http://localhost:3001/api/categories
```

---

## M2: Core Game (Single-Device Gameplay)

### Doel
Volledig speelbaar spel op 1 device, zonder netwerk.

### Taken

- [ ] **2.1 Game State Machine**
  - Zustand store: gameStore
  - States: lobby → setup → viewing → discussion → reveal
  - Transitions + guards
  - Reset functionaliteit

- [ ] **2.2 Speler Setup Flow**
  - Spelers toevoegen (naam + avatar)
  - Minimaal 3 spelers validatie
  - Speler verwijderen
  - Volgorde shufflen

- [ ] **2.3 Groepen Beheer**
  - Groep opslaan
  - Groep laden
  - Groep verwijderen
  - Persistentie naar database

- [ ] **2.4 Game Settings**
  - Categorie selector (dropdown + "alle")
  - Difficulty selector (3 levels)
  - Timer toggle + duration slider
  - Settings opslaan als defaults

- [ ] **2.5 Role Assignment**
  - Random woord selectie (uit categorie of alle)
  - Random imposter selectie
  - Toewijzing aan spelers
  - hasViewed tracking per speler

- [ ] **2.6 Viewing Phase (Kaart Flip)**
  - Alle spelers tonen met avatar (😴/👀 state)
  - Tap op eigen kaart → flip animatie (basis)
  - Toon woord (normaal) of hint (imposter)
  - Tap terug → kaart dicht, hasViewed = true
  - Progress indicator (X van Y bekeken)

- [ ] **2.7 Discussion Phase**
  - Timer component (countdown)
  - Timer pause/resume
  - Instructie tekst
  - "Onthul" knop (host)

- [ ] **2.8 Reveal Phase**
  - Toon woord
  - Toon imposter (met avatar)
  - Toon imposter's hint
  - "Volgende ronde" / "Stoppen" knoppen

- [ ] **2.9 Content Management**
  - Categorieën CRUD (toevoegen/bewerken/verwijderen)
  - Woorden CRUD (met hints per difficulty)
  - Settings pagina UI

### Testbaar
Volledig spel speelbaar op 1 telefoon doorgeven:
1. App openen
2. 3+ spelers toevoegen
3. Categorie + difficulty kiezen
4. Telefoon doorgeven, ieder bekijkt kaart
5. Discussiëren met timer
6. Imposter onthullen
7. Nieuwe ronde starten

---

## M3: Multi-Device Support

### Doel
Meerdere telefoons syncen via WebSocket.

### Taken

- [ ] **3.1 Socket.IO Setup**
  - Server: Socket.IO integratie met Express
  - Client: useSocket hook
  - Connection status indicator
  - Reconnection handling

- [ ] **3.2 Game Rooms**
  - Game code generatie (WOORD-1234 format)
  - Room creatie (host)
  - Room join (spelers)
  - Room cleanup (na inactiviteit)

- [ ] **3.3 Join Flow**
  - "Deelnemen" pagina (code invoer)
  - QR code generatie (host)
  - QR code scanner (speler)
  - Naam + avatar selectie na join

- [ ] **3.4 State Synchronization**
  - Game state broadcast naar alle clients
  - Player joined/left events
  - hasViewed sync
  - Conflict resolution (host authoritative)

- [ ] **3.5 Host Controls**
  - Alleen host kan game starten
  - Alleen host kan settings wijzigen
  - Alleen host kan onthullen
  - Host transfer (als host weggaat)

- [ ] **3.6 Multi-Device Viewing**
  - Elke speler ziet alleen eigen kaart om te flippen
  - Real-time update van wie gekeken heeft
  - "Wachten op anderen" state

### Testbaar
3+ telefoons kunnen samen spelen via game code:
1. Host maakt spel → krijgt code "ROOD-5678"
2. Anderen openen app → "Deelnemen" → code invoeren
3. Iedereen ziet dezelfde lobby
4. Spel speelt synchroon op alle devices

---

## M4: Polish (Animations + PWA + UX)

### Doel
App voelt smooth en professioneel, installeerbaar.

### Taken

- [ ] **4.1 Kaart Flip Animatie**
  - Framer Motion 3D flip
  - Avatar sleeping → awake transitie
  - Haptic feedback (vibration API)
  - Sound effects (optioneel, toggle)

- [ ] **4.2 Page Transitions**
  - Slide transitions tussen pagina's
  - Loading states
  - Skeleton screens

- [ ] **4.3 PWA Setup**
  - Manifest.json
  - Service worker
  - Offline fallback pagina
  - Install prompt
  - App icons (alle formaten)

- [ ] **4.4 Responsive Design**
  - Mobile-first (telefoon primair)
  - Tablet layout
  - Touch targets (minimaal 44px)
  - Safe areas (notch handling)

- [ ] **4.5 Accessibility**
  - Grote fonts optie
  - High contrast
  - Screen reader basics
  - Focus indicators

- [ ] **4.6 Error Handling**
  - Connection lost UI
  - Reconnection attempts
  - Graceful degradation
  - User-friendly error messages

- [ ] **4.7 Kindvriendelijke UX**
  - Grote knoppen
  - Duidelijke iconen
  - Simpele taal
  - Vrolijke kleuren

### Testbaar
App installeerbaar, animaties smooth, kids kunnen het gebruiken.

---

## M5: Deployment

### Doel
Live op VPS, automatische deploys.

### Taken

- [ ] **5.1 Docker Setup**
  - Dockerfile frontend (nginx)
  - Dockerfile backend (node)
  - docker-compose.yml
  - Volume voor SQLite persistence

- [ ] **5.2 VPS Configuratie**
  - Domain/subdomain setup
  - SSL certificaat (Let's Encrypt)
  - Nginx reverse proxy
  - Firewall rules

- [ ] **5.3 CI/CD Pipeline**
  - GitHub Actions workflow
  - Build + test on push
  - Auto-deploy naar VPS op main branch
  - Environment variables management

- [ ] **5.4 Monitoring**
  - Health check endpoint
  - Basic logging
  - Error tracking (optioneel: Sentry)

### Testbaar
Push naar GitHub → automatisch live op imposter.jouwdomain.nl

---

## M6: Extras (Backlog)

### Toekomstige Features

- [ ] Scoring systeem
- [ ] Statistieken per speler
- [ ] Thema's (dark mode, kleuren)
- [ ] Meerdere imposters (4+ spelers)
- [ ] Custom avatar upload
- [ ] AI-gegenereerde avatars
- [ ] Meerdere talen
- [ ] Sound effects pack
- [ ] Spectator mode
- [ ] Game history / replay

---

## Milestone Dependencies

```
M1 ──────► M2 ──────► M3
 │          │          │
 │          │          ▼
 │          │         M4 ──────► M5 ──────► M6
 │          │          ▲
 │          └──────────┘
 │
 └──► (M1 nodig voor alles)
```

---

## Definition of Done

Elke milestone is klaar wanneer:

1. ✅ Alle taken afgevinkt
2. ✅ Code gereviewed
3. ✅ Geen TypeScript errors
4. ✅ Handmatig getest op telefoon
5. ✅ Documentatie bijgewerkt
