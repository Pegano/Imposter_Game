# Technische Specificatie

## Overzicht

Imposter Game is een lokaal multiplayer party game vergelijkbaar met hidden role guessing games. Het spel is speelbaar op één device (doorgeven) of met meerdere telefoons via een game code.

---

## Architectuur

```
┌─────────────────────────────────────────────────────────────────┐
│                      SPELERS                                    │
│  📱 Browser/PWA    📱 Browser/PWA    📱 Browser/PWA             │
└─────────────────┬───────────────────────────────────────────────┘
                  │ WebSocket / REST
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   VPS SERVER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Backend   │  │  Database   │  │  WebSocket  │             │
│  │  (Node.js)  │  │  (SQLite)   │  │   Server    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Speelmodi

| Modus | Werking |
|-------|---------|
| **Multi-device** | Host maakt game → krijgt code (bijv. `BLAUW-7392`) → anderen joinen met code → ieder ziet eigen scherm |
| **Single-device** | Zelfde flow, maar 1 apparaat wordt doorgegeven met privacy-schermen |

---

## Kernregels

| Aspect | Specificatie |
|--------|--------------|
| Spelers | Minimum 3, geen maximum |
| Imposter | Altijd precies 1 |
| Imposter ziet | Een **hint** (niet het woord) |
| Anderen zien | Het **echte woord** |
| Categorie | Optioneel filter, anders random uit alle woorden |
| Moeilijkheid | 3 niveaus (beïnvloedt hoe vaag de hint is) |
| Stemmen | Mondeling, niet in-app |
| Timer | Optioneel, aan/uit te zetten |
| Groepen | Spelersgroepen opslaan voor hergebruik |

---

## Game Flow

```
Lobby → Player Setup → [Load Group OR Enter Names] → Save Group?
    → Category Selection (optional) → Difficulty Selection → Start Round
    → Role Assignment (hidden) → Pass Device: Each Player Views Hint
    → Discussion Phase (timer optional) → Host Triggers Reveal
    → Show Roles & Word → Next Round OR End Session
```

---

## Spellogica

### Rolverdeling

| Rol | Ziet op scherm |
|-----|----------------|
| **Imposter** (1 speler) | Een **hint** (vaag, gerelateerd aan het woord) |
| **Normale spelers** (alle anderen) | Het **echte woord** |

### Speelverloop

1. Iedereen bekijkt hun scherm (woord of hint)
2. Om de beurt zegt elke speler iets over het woord **zonder het woord te noemen**
3. Na 2 ronden beschrijvingen (of eerder) → groep wijst de Imposter aan

---

## Privacy Mechanisme (Single-Device)

### Avatar Staten

Elke speler heeft een avatar met twee visuele staten:

| Status | Visueel | Betekenis |
|--------|---------|-----------|
| **Niet bekeken** | Avatar met ogen dicht (😴) | Speler heeft nog niet gekeken |
| **Bekeken** | Avatar met ogen open (👀) | Speler heeft al gekeken |

### Verificatie Flow

```
1. Telefoon bij Jan
   Jan (😴) │ Mieke (😴) │ Piet (😴)
        ↓ tik

2. Jan tikt op zijn kaart → kaart draait → toont woord/hint

3. Jan tikt terug → kaart draait dicht → avatar nu 👀
   Jan (👀) │ Mieke (😴) │ Piet (😴)

4. Telefoon naar Mieke
   → Mieke ZIET dat Jan (👀) al gekeken heeft
   → Mieke ZIET dat Piet (😴) nog NIET gekeken heeft
   → Mieke weet: veilig om te kijken
```

### Garanties

| Wat je ziet | Betekenis |
|-------------|-----------|
| Jouw kaart = 😴 (dicht) | Niemand heeft jouw woord gezien |
| Vorige speler = 👀 (open) | Die heeft al gekeken, veilig om door te geven |
| Volgende speler = 😴 (dicht) | Die heeft nog niet gekeken bij jou |

---

## Moeilijkheidsniveaus

| Difficulty | Normale spelers zien | Imposter ziet |
|------------|---------------------|---------------|
| Easy | Het woord: "Pizza" | "Italiaans gerecht, rond, met tomatensaus en kaas" |
| Medium | Het woord: "Pizza" | "Populair bezorgeten uit Italië" |
| Hard | Het woord: "Pizza" | "Napels" |

---

## Technische Eisen

- **PWA** (Progressive Web App) → installeerbaar als "app"
- **Responsive** → werkt op telefoon én tablet
- **Real-time sync** → alle spelers zien zelfde game state
- **Persistentie** → categorieën, woorden, groepen blijven bewaard
- **Kindvriendelijk** → grote knoppen, simpele UI

---

## Niet in Scope (MVP)

- Scoring systeem (geparkeerd voor later)
- Image/foto bij woorden
- Meerdere imposters
- Account systeem / authenticatie
