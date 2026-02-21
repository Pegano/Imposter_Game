# Domain Model

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PERSISTENCE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐       ┌──────────────────┐                   │
│  │    Player    │       │   PlayerGroup    │                   │
│  ├──────────────┤       ├──────────────────┤                   │
│  │ id: PK       │       │ id: PK           │                   │
│  │ name: string │◄──────│ name: string     │                   │
│  │ avatarId: FK │   N:1 │ createdAt: date  │                   │
│  │ groupId: FK? │       └──────────────────┘                   │
│  └──────────────┘                                              │
│                                                                 │
│  ┌──────────────┐       ┌──────────────────┐                   │
│  │   Category   │       │       Word       │                   │
│  ├──────────────┤       ├──────────────────┤                   │
│  │ id: PK       │       │ id: PK           │                   │
│  │ name: string │◄──────│ categoryId: FK   │                   │
│  │ icon: string?│   1:N │ word: string     │                   │
│  │ isDefault    │       │ hintEasy: string │                   │
│  └──────────────┘       │ hintMedium: str  │                   │
│                         │ hintHard: string │                   │
│                         └──────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       GAME SESSION (Runtime)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐       ┌──────────────────┐               │
│  │   GameSession    │       │   GamePlayer     │               │
│  ├──────────────────┤       ├──────────────────┤               │
│  │ id: PK           │       │ id: PK           │               │
│  │ code: string     │◄──────│ sessionId: FK    │               │
│  │ hostId: FK       │   1:N │ name: string     │               │
│  │ state: enum      │       │ avatarId: string │               │
│  │ wordId: FK       │       │ isImposter: bool │               │
│  │ categoryId: FK?  │       │ hasViewed: bool  │               │
│  │ difficulty: 1-3  │       │ isHost: bool     │               │
│  │ timerEnabled     │       │ isConnected: bool│               │
│  │ timerSeconds     │       │ joinedAt: date   │               │
│  │ createdAt: date  │       └──────────────────┘               │
│  └──────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Schema Details

### Player (Opgeslagen speler)

```typescript
interface Player {
  id: string
  name: string
  avatarId: string          // Referentie naar avatar preset
  groupId?: string          // null = losse speler
  createdAt: Date
}
```

### PlayerGroup (Groep voor hergebruik)

```typescript
interface PlayerGroup {
  id: string
  name: string              // "Familie", "Vriendengroep"
  createdAt: Date
  players: Player[]         // 1:N relatie
}
```

### Category

```typescript
interface Category {
  id: string
  name: string              // "Dieren", "Eten", "Films"
  icon?: string             // Emoji of icon naam
  isDefault: boolean        // true = meegeleverd, false = custom
  createdAt: Date
}
```

### Word (met hints per difficulty)

```typescript
interface Word {
  id: string
  categoryId: string
  word: string              // Het echte woord: "Olifant"
  hintEasy: string          // "Groot grijs dier met slurf"
  hintMedium: string        // "Dier uit Afrika"
  hintHard: string          // "Safari"
  createdAt: Date
}
```

### GameSession (Live game state)

```typescript
interface GameSession {
  id: string
  code: string              // "BLAUW-7392" - join code
  hostId: string            // Wie host is
  state: GameState          // Zie state machine
  wordId?: string           // Huidige woord (null in lobby)
  categoryId?: string       // null = alle categorieën
  difficulty: 1 | 2 | 3
  timerEnabled: boolean
  timerSeconds: number      // Default: 120
  players: GamePlayer[]
  createdAt: Date
  expiresAt: Date           // Auto-cleanup na X uur
}

type GameState =
  | 'lobby'                 // Wachten op spelers
  | 'setup'                 // Host configureert game
  | 'viewing'               // Spelers bekijken hun woord/hint
  | 'discussion'            // Discussie fase (timer loopt)
  | 'reveal'                // Rollen worden onthuld
```

### GamePlayer (Speler in huidige sessie)

```typescript
interface GamePlayer {
  id: string
  sessionId: string
  name: string
  avatarId: string
  isImposter: boolean       // Door server bepaald
  hasViewed: boolean        // Heeft woord/hint gezien
  isHost: boolean
  isConnected: boolean      // WebSocket status
  joinedAt: Date
}
```

---

## Avatar Systeem

### Avatar Preset

```typescript
interface AvatarPreset {
  id: string
  name: string              // "Vos", "Panda", etc.
  imageNotViewed: string    // URL naar "ogen dicht" versie
  imageViewed: string       // URL naar "ogen open" versie
}
```

### Meegeleverde Avatars

| Categorie | Karakters |
|-----------|-----------|
| **Dieren** | Vos, Panda, Leeuw, Kat, Hond, Uil, Konijn |
| **Fantasy** | Tovenaar, Prinses, Ridder, Draak, Eenhoorn |
| **Modern** | Robot, Astronaut, Superheld, Ninja |

### Custom Avatar (Toekomst)

```typescript
interface CustomAvatar {
  id: string
  playerId: string
  imageUrl: string          // Uploaded image
  // Effect voor viewed state: grayscale → color
}
```

---

## Hint Structuur

### Voorbeeld: Pizza

```json
{
  "word": "Pizza",
  "categoryId": "cat_food",
  "hintEasy": "Italiaans gerecht, rond, met tomatensaus en kaas",
  "hintMedium": "Populair bezorgeten uit Italië",
  "hintHard": "Napels"
}
```

### Hint per Difficulty

| Difficulty | Imposter ziet |
|------------|---------------|
| Easy (1) | Specifieke hint met meerdere kenmerken |
| Medium (2) | Vagere hint met minder details |
| Hard (3) | Minimale hint, vaak slechts één woord/associatie |

---

## Database: Prisma Schema

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Category {
  id        String   @id @default(uuid())
  name      String
  icon      String?
  isDefault Boolean  @default(false)
  words     Word[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Word {
  id         String   @id @default(uuid())
  word       String
  hintEasy   String
  hintMedium String
  hintHard   String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model PlayerGroup {
  id        String   @id @default(uuid())
  name      String
  players   Player[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Player {
  id        String       @id @default(uuid())
  name      String
  avatarId  String
  group     PlayerGroup? @relation(fields: [groupId], references: [id], onDelete: Cascade)
  groupId   String?
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}
```

---

## Runtime State (In-Memory + WebSocket)

Game sessions worden **niet** in SQLite opgeslagen, maar in-memory gehouden:

```typescript
// Server-side in-memory store
const gameSessions = new Map<string, GameSession>()

// Cleanup na 4 uur inactiviteit
const SESSION_TTL = 4 * 60 * 60 * 1000
```

### Waarom in-memory?

| Aspect | In-Memory | Database |
|--------|-----------|----------|
| Snelheid | ✅ Instant | ❌ Query overhead |
| Real-time | ✅ Direct beschikbaar | ❌ Polling nodig |
| Persistentie | ❌ Verloren bij restart | ✅ Bewaard |
| Complexiteit | ✅ Simpel | ❌ Migrations nodig |

**Besluit**: Games zijn kortdurend (< 1 uur), persistentie niet nodig.
