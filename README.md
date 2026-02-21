# 🎭 Imposter Game

Een lokaal multiplayer party game waarin spelers moeten raden wie de imposter is. Speelbaar op één device (doorgeven) of met meerdere telefoons.

## 🎮 Hoe werkt het?

1. **Setup**: Host maakt een spel, spelers joinen met een code
2. **Rollen**: Eén speler wordt willekeurig de **Imposter**
3. **Bekijken**:
   - Normale spelers zien het **woord** (bijv. "Pizza")
   - De Imposter ziet een **hint** (bijv. "Italiaans gerecht")
4. **Discussie**: Om de beurt beschrijft iedereen het woord *zonder het te noemen*
5. **Stemmen**: De groep beslist wie de Imposter is
6. **Onthulling**: Was de gok juist?

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development (frontend + backend)
npm run dev

# Frontend only
npm run dev:web

# Backend only
npm run dev:server
```

## 📁 Project Structuur

```
imposter-game/
├── apps/
│   ├── web/                 # React frontend (Vite)
│   └── server/              # Node.js backend (Express)
├── packages/
│   └── shared/              # Gedeelde TypeScript types
├── docs/                    # Documentatie
│   ├── SPECIFICATION.md     # Technische specificatie
│   ├── DOMAIN-MODEL.md      # Data model
│   ├── STATE-MACHINE.md     # Game states
│   ├── UX-FLOW.md           # Scherm-voor-scherm UX
│   ├── TECH-STACK.md        # Technologie keuzes
│   └── IMPLEMENTATION-PLAN.md
└── docker-compose.yml       # Production deployment
```

## 🛠️ Tech Stack

| Laag | Technologie |
|------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS |
| State | Zustand |
| Backend | Node.js + Express |
| Real-time | Socket.IO |
| Database | SQLite + Prisma |
| Deploy | Docker + VPS |

## 📖 Documentatie

- [Technische Specificatie](docs/SPECIFICATION.md)
- [Domain Model](docs/DOMAIN-MODEL.md)
- [State Machine](docs/STATE-MACHINE.md)
- [UX Flow](docs/UX-FLOW.md)
- [Tech Stack](docs/TECH-STACK.md)
- [Implementation Plan](docs/IMPLEMENTATION-PLAN.md)

## 🎯 Features

### MVP
- [x] Single-device gameplay (telefoon doorgeven)
- [x] Multi-device gameplay (ieder eigen telefoon)
- [x] Categorieën en woorden beheren
- [x] Spelersgroepen opslaan
- [x] 3 moeilijkheidsniveaus
- [x] Optionele timer
- [x] PWA (installeerbaar)

### Toekomst
- [ ] Scoring systeem
- [ ] Statistieken
- [ ] Thema's (dark mode)
- [ ] Meerdere imposters
- [ ] Custom avatar upload

## 📱 Screenshots

*Coming soon*

## 🤝 Ontwikkeling

```bash
# Database migratie
npm run db:migrate

# Database seeden (default woorden)
npm run db:seed

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📄 Licentie

MIT
