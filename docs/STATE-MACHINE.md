# Game State Machine

## Staten Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    ┌────────┐                                                  │
│    │ LOBBY  │ ◄──────────────────────────────────────────┐     │
│    └───┬────┘                                            │     │
│        │ Host start game                                 │     │
│        ▼                                                 │     │
│    ┌────────────┐                                        │     │
│    │  JOINING   │  Spelers joinen met code               │     │
│    └───┬────────┘                                        │     │
│        │ Host klikt "Start"                              │     │
│        ▼                                                 │     │
│    ┌────────────┐                                        │     │
│    │   SETUP    │  Categorie + Difficulty kiezen         │     │
│    └───┬────────┘                                        │     │
│        │ Instellingen bevestigd                          │     │
│        ▼                                                 │     │
│    ┌────────────┐                                        │     │
│    │ ASSIGNING  │  Server kiest woord + imposter         │     │
│    └───┬────────┘                                        │     │
│        │ Rollen toegewezen                               │     │
│        ▼                                                 │     │
│    ┌────────────┐                                        │     │
│    │  VIEWING   │  Spelers bekijken woord/hint           │     │
│    └───┬────────┘                                        │     │
│        │ Iedereen heeft gekeken (alle 👀)                │     │
│        ▼                                                 │     │
│    ┌────────────┐                                        │     │
│    │ DISCUSSION │  Timer loopt (optioneel)               │     │
│    └───┬────────┘                                        │     │
│        │ Host klikt "Onthul"                             │     │
│        ▼                                                 │     │
│    ┌────────────┐                                        │     │
│    │  REVEAL    │  Toon wie imposter was + woord         │     │
│    └───┬────────┘                                        │     │
│        │                                                 │     │
│        ├─── "Volgende ronde" ───────────► SETUP ────────┤     │
│        │                                                 │     │
│        └─── "Stoppen" ───────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Definities

```typescript
type GameState =
  | 'lobby'
  | 'joining'
  | 'setup'
  | 'assigning'
  | 'viewing'
  | 'discussion'
  | 'reveal'
```

---

## State Details

### 1. LOBBY

```typescript
state: 'lobby'
```

| Wat gebeurt | Data mutatie |
|-------------|--------------|
| Host opent app | `GameSession` aangemaakt |
| Game code gegenereerd | `session.code = "BLAUW-7392"` |
| Host kiest: nieuw spel of groep laden | - |

**UI Host**: Keuze tussen "Nieuwe spelers" of "Groep laden"
**UI Anderen**: Nog niet gejoined

---

### 2. JOINING

```typescript
state: 'joining'
```

| Wat gebeurt | Data mutatie |
|-------------|--------------|
| Spelers voeren code in | `GamePlayer` toegevoegd aan `session.players[]` |
| Speler kiest naam + avatar | `player.name`, `player.avatarId` |
| Real-time sync | Alle spelers zien wie joinet |

**UI Host**: Ziet lijst met spelers, "Start" knop (disabled tot ≥3 spelers)
**UI Speler**: Naam invoer + avatar keuze

**Transitie**: Host klikt "Start" → `state = 'setup'`

---

### 3. SETUP

```typescript
state: 'setup'
```

| Wat gebeurt | Data mutatie |
|-------------|--------------|
| Host kiest categorie (optioneel) | `session.categoryId = '...'` of `null` |
| Host kiest difficulty | `session.difficulty = 1 \| 2 \| 3` |
| Host zet timer aan/uit | `session.timerEnabled`, `session.timerSeconds` |

**UI Host**: Instellingen scherm
**UI Spelers**: "Wachten op host..." scherm

**Transitie**: Host bevestigt → `state = 'assigning'`

---

### 4. ASSIGNING

```typescript
state: 'assigning'
```

| Wat gebeurt | Data mutatie |
|-------------|--------------|
| Server kiest random woord | `session.wordId = '...'` |
| Server kiest random imposter | `players[x].isImposter = true` |
| Alle hasViewed reset | `players[*].hasViewed = false` |

**Logica**:

```typescript
// Server-side
function assignRoles(session: GameSession, words: Word[]): void {
  // Filter woorden op categorie (of alle)
  const availableWords = session.categoryId
    ? words.filter(w => w.categoryId === session.categoryId)
    : words

  // Kies random woord
  const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)]
  session.wordId = randomWord.id

  // Kies random imposter
  const imposterIndex = Math.floor(Math.random() * session.players.length)

  // Reset alle spelers
  session.players.forEach((player, index) => {
    player.isImposter = (index === imposterIndex)
    player.hasViewed = false
  })
}
```

**UI**: Kort laadscherm (< 1 seconde)

**Transitie**: Automatisch → `state = 'viewing'`

---

### 5. VIEWING

```typescript
state: 'viewing'
```

| Wat gebeurt | Data mutatie |
|-------------|--------------|
| Speler tikt op eigen avatar | - |
| Kaart flipt, toont woord of hint | - |
| Speler tikt terug | `player.hasViewed = true` |
| Avatar verandert (😴 → 👀) | Real-time sync naar alle devices |

**Content per rol**:

```typescript
function getPlayerContent(player: GamePlayer, word: Word, difficulty: number): string {
  if (player.isImposter) {
    switch (difficulty) {
      case 1: return word.hintEasy
      case 2: return word.hintMedium
      case 3: return word.hintHard
    }
  }
  return word.word
}
```

**Transitie**: Alle spelers `hasViewed = true` → Host ziet "Start discussie" knop

---

### 6. DISCUSSION

```typescript
state: 'discussion'
```

| Wat gebeurt | Data mutatie |
|-------------|--------------|
| Timer start (indien enabled) | `session.timerStartedAt = now()` |
| Spelers discussiëren mondeling | Geen app interactie |
| Host kan timer pauzeren | `session.timerPaused = true` |

**Timer logica**:

```typescript
interface TimerState {
  enabled: boolean
  totalSeconds: number
  remainingSeconds: number
  isPaused: boolean
  startedAt?: Date
}
```

**Transitie**: Host klikt "Onthul" → `state = 'reveal'`

---

### 7. REVEAL

```typescript
state: 'reveal'
```

| Wat gebeurt | Data mutatie |
|-------------|--------------|
| Toon het woord | - |
| Toon wie imposter was | - |
| Toon imposter's hint | - |

**Transities**:
- "Volgende ronde" → `state = 'setup'` (of direct `'assigning'` met zelfde settings)
- "Stoppen" → `state = 'lobby'`

---

## State Transitions Matrix

```typescript
const transitions: Record<GameState, GameState[]> = {
  'lobby':      ['joining'],
  'joining':    ['setup', 'lobby'],           // terug als host annuleert
  'setup':      ['assigning', 'joining'],     // terug om spelers aan te passen
  'assigning':  ['viewing'],                  // automatisch
  'viewing':    ['discussion'],
  'discussion': ['reveal'],
  'reveal':     ['setup', 'lobby'],           // volgende ronde of stoppen
}

function canTransition(from: GameState, to: GameState): boolean {
  return transitions[from].includes(to)
}
```

---

## WebSocket Events

### Client → Server

```typescript
type ClientEvent =
  | { type: 'CREATE_GAME' }
  | { type: 'JOIN_GAME', code: string, name: string, avatarId: string }
  | { type: 'LEAVE_GAME' }
  | { type: 'START_GAME' }                    // alleen host
  | { type: 'UPDATE_SETTINGS', settings: GameSettings }
  | { type: 'CONFIRM_SETTINGS' }              // alleen host
  | { type: 'MARK_VIEWED' }                   // speler heeft gekeken
  | { type: 'START_DISCUSSION' }              // alleen host
  | { type: 'TOGGLE_TIMER_PAUSE' }            // alleen host
  | { type: 'REVEAL' }                        // alleen host
  | { type: 'NEXT_ROUND' }                    // alleen host
  | { type: 'END_GAME' }                      // alleen host
```

### Server → Client

```typescript
type ServerEvent =
  | { type: 'GAME_CREATED', session: GameSession }
  | { type: 'GAME_STATE', state: GameSession }
  | { type: 'PLAYER_JOINED', player: GamePlayer }
  | { type: 'PLAYER_LEFT', playerId: string }
  | { type: 'PLAYER_VIEWED', playerId: string }
  | { type: 'YOUR_ROLE', isImposter: boolean, content: string }
  | { type: 'TIMER_UPDATE', remainingSeconds: number }
  | { type: 'GAME_REVEALED', word: string, imposter: GamePlayer, hint: string }
  | { type: 'ERROR', message: string }
```

---

## State Guards

```typescript
// Validaties voordat state transitions mogen
const guards = {
  canStartGame: (session: GameSession): boolean => {
    return session.players.length >= 3
  },

  canStartDiscussion: (session: GameSession): boolean => {
    return session.players.every(p => p.hasViewed)
  },

  canReveal: (session: GameSession): boolean => {
    return session.state === 'discussion'
  },

  isHost: (session: GameSession, playerId: string): boolean => {
    return session.hostId === playerId
  }
}
```
