# UX Flow

## Scherm-voor-scherm Walkthrough

---

## Scherm 1: Home / Lobby

```
┌─────────────────────────────────────────┐
│                                         │
│            🎭 IMPOSTER                  │
│                                         │
│     Het party spel voor families        │
│                                         │
│                                         │
│       ┌───────────────────────┐         │
│       │    NIEUW SPEL         │         │
│       └───────────────────────┘         │
│                                         │
│       ┌───────────────────────┐         │
│       │    DEELNEMEN          │         │
│       └───────────────────────┘         │
│                                         │
│                                         │
│   ┌─────────┐          ┌─────────┐     │
│   │ ⚙️      │          │ 📚      │     │
│   │Instell. │          │Woorden  │     │
│   └─────────┘          └─────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

| Knop | Actie |
|------|-------|
| Nieuw spel | → Scherm 2 (Host flow) |
| Deelnemen | → Scherm 6 (Join flow) |
| Instellingen | → Categorieën, groepen beheren |
| Woorden | → Woorden/hints beheren |

---

## Scherm 2: Spelers Toevoegen (Host)

```
┌─────────────────────────────────────────┐
│  ← Terug              SPELERS           │
├─────────────────────────────────────────┤
│                                         │
│   Game code:  🔤 BLAUW-7392   [📋]     │
│                                         │
│   Deel deze code met andere spelers     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 📂 Groep laden...               │   │
│   └─────────────────────────────────┘   │
│                                         │
│   OF voeg spelers handmatig toe:        │
│                                         │
│   ┌────────────────────┐ ┌────────┐    │
│   │ Naam...            │ │   +    │    │
│   └────────────────────┘ └────────┘    │
│                                         │
│   👀🦊 Jan (host)                       │
│   👀🐼 Mieke                            │
│   👀🦁 Piet                             │
│                                         │
│   Minimaal 3 spelers nodig (nu: 3 ✓)   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 💾 Opslaan als groep            │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │         START SPEL →            │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Interacties**:
- Naam typen + "+" → speler toegevoegd met random avatar
- Tik op avatar → kies andere avatar
- Swipe links op speler → verwijderen
- "Groep laden" → modal met opgeslagen groepen
- "Opslaan als groep" → naam invoeren → groep bewaard

---

## Scherm 3: Groep Laden Modal

```
┌─────────────────────────────────────────┐
│           GROEP LADEN                   │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 👨‍👩‍👧‍👦 Familie                      │   │
│   │ Jan, Mieke, Piet, Sara          │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 🍻 Vriendengroep                │   │
│   │ Tom, Lisa, Bob, Emma, Chris     │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 🏢 Collega's                    │   │
│   │ Anna, Mark, Sophie              │   │
│   └─────────────────────────────────┘   │
│                                         │
│           [ ANNULEREN ]                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## Scherm 4: Game Instellingen (Host)

```
┌─────────────────────────────────────────┐
│  ← Terug           INSTELLINGEN         │
├─────────────────────────────────────────┤
│                                         │
│   CATEGORIE                             │
│   ┌─────────────────────────────────┐   │
│   │ 🎲 Alle categorieën        ▼   │   │
│   └─────────────────────────────────┘   │
│   ┌─────────────────────────────────┐   │
│   │   🐾 Dieren                     │   │
│   │   🍕 Eten & Drinken             │   │
│   │   🎬 Films                      │   │
│   │   🌍 Landen                     │   │
│   │   ⚽ Sport                      │   │
│   └─────────────────────────────────┘   │
│                                         │
│   MOEILIJKHEID                          │
│   ┌─────┐ ┌─────┐ ┌─────┐              │
│   │MAKK.│ │GEMID│ │MOEIL│              │
│   │ 😊  │ │ 😐  │ │ 😈  │              │
│   │  ✓  │ │     │ │     │              │
│   └─────┘ └─────┘ └─────┘              │
│                                         │
│   TIMER                                 │
│   ┌──────────────────────┐  ┌─────┐    │
│   │ ●───────○            │  │ AAN │    │
│   │     2:00 min         │  └─────┘    │
│   └──────────────────────┘             │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │         START RONDE →           │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Scherm 5: Bekijk Fase (Single-Device)

### 5a: Overzicht - wachten op je beurt

```
┌─────────────────────────────────────────┐
│              BEKIJK JE KAART            │
├─────────────────────────────────────────┤
│                                         │
│   Geef de telefoon aan de speler        │
│   wiens kaart nog dicht is              │
│                                         │
│   ┌───────┐ ┌───────┐ ┌───────┐        │
│   │  👀   │ │  👀   │ │  😴   │        │
│   │  🦊   │ │  🐼   │ │  🦁   │        │
│   │  Jan  │ │ Mieke │ │ Piet  │        │
│   │BEKEKEN│ │BEKEKEN│ │ [TAP] │        │
│   └───────┘ └───────┘ └───────┘        │
│                                         │
│             ┌───────┐                   │
│             │  😴   │                   │
│             │  🐱   │                   │
│             │ Sara  │                   │
│             │ wacht │                   │
│             └───────┘                   │
│                                         │
│   3 van 4 spelers hebben gekeken        │
│                                         │
└─────────────────────────────────────────┘
```

### 5b: Kaart flippen (tijdens tap)

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│          ╭─────────────────╮            │
│          │                 │            │
│          │                 │            │
│          │     PIZZA       │  ← woord   │
│          │                 │    OF      │
│          │                 │    hint    │
│          │                 │            │
│          ╰─────────────────╯            │
│                                         │
│                                         │
│        Tik om terug te draaien          │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### 5c: Alle spelers hebben gekeken

```
┌─────────────────────────────────────────┐
│          IEDEREEN HEEFT GEKEKEN         │
├─────────────────────────────────────────┤
│                                         │
│   ┌───────┐ ┌───────┐ ┌───────┐        │
│   │  👀   │ │  👀   │ │  👀   │        │
│   │  🦊   │ │  🐼   │ │  🦁   │        │
│   │  Jan  │ │ Mieke │ │ Piet  │        │
│   └───────┘ └───────┘ └───────┘        │
│                                         │
│             ┌───────┐                   │
│             │  👀   │                   │
│             │  🐱   │                   │
│             │ Sara  │                   │
│             └───────┘                   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      START DISCUSSIE →          │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Scherm 6: Deelnemen (Multi-device)

```
┌─────────────────────────────────────────┐
│  ← Terug            DEELNEMEN           │
├─────────────────────────────────────────┤
│                                         │
│   Voer de game code in:                 │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │         BLAUW-7392              │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │           ZOEKEN →              │   │
│   └─────────────────────────────────┘   │
│                                         │
│                                         │
│   ─────────── OF ───────────           │
│                                         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      📷 SCAN QR CODE            │   │
│   └─────────────────────────────────┘   │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Na joinen:

```
┌─────────────────────────────────────────┐
│            WELKOM IN HET SPEL           │
├─────────────────────────────────────────┤
│                                         │
│   Jouw naam:                            │
│   ┌─────────────────────────────────┐   │
│   │         Piet                    │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Kies je avatar:                       │
│                                         │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│   │ 🦊  │ │ 🐼  │ │ 🦁  │ │ 🐱  │     │
│   │     │ │     │ │  ✓  │ │     │     │
│   └─────┘ └─────┘ └─────┘ └─────┘     │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│   │ 🤖  │ │ 🧙  │ │ 👻  │ │ 📷  │     │
│   │     │ │     │ │     │ │eigen│     │
│   └─────┘ └─────┘ └─────┘ └─────┘     │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │          KLAAR →                │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Scherm 7: Discussie Fase

```
┌─────────────────────────────────────────┐
│              DISCUSSIE                  │
├─────────────────────────────────────────┤
│                                         │
│               ┌───────┐                 │
│               │ 01:47 │                 │
│               └───────┘                 │
│                                         │
│   Beschrijf om de beurt het woord       │
│   ZONDER het woord te noemen!           │
│                                         │
│   Na 2 rondes: wijs de imposter aan     │
│                                         │
│                                         │
│   ┌───────┐ ┌───────┐ ┌───────┐        │
│   │  🦊   │ │  🐼   │ │  🦁   │        │
│   │  Jan  │ │ Mieke │ │ Piet  │        │
│   └───────┘ └───────┘ └───────┘        │
│                                         │
│             ┌───────┐                   │
│             │  🐱   │                   │
│             │ Sara  │                   │
│             └───────┘                   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      🎭 ONTHUL IMPOSTER         │   │  ← alleen host
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Scherm 8: Reveal

```
┌─────────────────────────────────────────┐
│                                         │
│            HET WOORD WAS                │
│                                         │
│           ╭─────────────╮               │
│           │             │               │
│           │   🍕        │               │
│           │   PIZZA     │               │
│           │             │               │
│           ╰─────────────╯               │
│                                         │
│          DE IMPOSTER WAS                │
│                                         │
│             ┌───────┐                   │
│             │  🎭   │                   │
│             │  🐼   │                   │
│             │ Mieke │                   │
│             └───────┘                   │
│                                         │
│           Mieke's hint was:             │
│      "Italiaans rond gerecht"           │
│                                         │
│                                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │VOLGENDE RONDE│  │   STOPPEN    │    │
│  └──────────────┘  └──────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Privacy Bescherming Samenvatting

| Risico | Oplossing |
|--------|-----------|
| Imposter ziet woord van ander | Avatar 👀/😴 systeem toont wie al gekeken heeft |
| Iemand kijkt mee over schouder | Tap-to-reveal, snel weer dicht |
| Per ongeluk verkeerde kaart openen | Alleen eigen kaart is tapbaar |
| Imposter herkenbaar aan UI | Zelfde UI voor woord én hint (alleen tekst anders) |

---

## Navigatie Structuur

```
Home
├── Nieuw Spel
│   ├── Spelers Toevoegen
│   │   ├── Groep Laden (modal)
│   │   └── Groep Opslaan (modal)
│   ├── Game Instellingen
│   ├── Bekijk Fase
│   ├── Discussie Fase
│   └── Reveal
│
├── Deelnemen
│   ├── Code Invoeren
│   ├── Naam + Avatar Kiezen
│   ├── Wachten op Host
│   ├── Bekijk Fase
│   ├── Discussie Fase
│   └── Reveal
│
├── Instellingen
│   ├── Groepen Beheren
│   └── Categorieën Beheren
│
└── Woorden Beheren
    ├── Categorie Selecteren
    ├── Woorden Lijst
    └── Woord Toevoegen/Bewerken
```
