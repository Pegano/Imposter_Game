# Speluitleg & Multi-device Mode

## Wat is Imposter Game?

Een sociaal deductie-spel voor groepen. Iedereen krijgt hetzelfde woord te zien — behalve de imposter. Die krijgt een vage hint. Aan het einde van de discussieronde probeer je te achterhalen wie de imposter is.

---

## Twee speelmodi

### 📱 1 Telefoon (single-device)

Alle spelers spelen op één gedeeld apparaat. Iedereen geeft de telefoon door om zijn kaart te bekijken.

**Geschikt voor:** kleine groepen op één locatie zonder eigen telefoon bij de hand.

### 📡 Eigen Telefoon (multi-device)

Elke speler gebruikt zijn eigen telefoon. De host maakt een spel aan en deelt de game code. Elke speler ziet alleen zijn eigen kaart.

**Geschikt voor:** grotere groepen of wanneer je niemand je scherm wilt laten zien.

---

## Multi-device: stap voor stap

### Als host

1. Open de app → tik **"Nieuw Spel"**
2. Tik op de tab **"📡 Eigen Telefoon"**
3. Voer je naam in en kies een avatar
4. Tik **"Maak Spel →"**
5. De game code verschijnt op je scherm (bijv. `BLAUW-4392`)
6. Deel de code met de andere spelers — ze gaan naar `/join` en voeren de code in
7. Zodra er 3+ spelers zijn, tik je **"Start Spel →"**

### Als speler (deelnemer)

1. Open de app → tik **"Deelnemen"** (of ga naar `/join`)
2. Voer de game code in die de host heeft gedeeld
3. Kies je naam en avatar → tik **"Deelnemen →"**
4. Wacht in het lobby-scherm tot de host start

---

## Het spel: ronde voor ronde

### 1. Kaarten bekijken (Viewing)

- **Multi-device:** elk apparaat toont jouw persoonlijke kaart. Tik erop om je woord of hint te zien. Tik daarna ergens om te bevestigen dat je hebt gekeken.
- **Single-device:** geef de telefoon door aan elke speler. Tik op de kaart om te kijken, tik ergens om terug te gaan.

De imposter ziet een **hint** (vaag, afhankelijk van de moeilijkheidsgraad) in plaats van het woord.

### 2. Discussie

- Iedereen beschrijft het woord om beurten **zonder het te noemen**.
- De imposter probeert mee te doen zonder zijn onwetendheid te verraden.
- Er loopt een timer (standaard 2 minuten).

**Multi-device controls (alleen host):**
- ⏸️ Pauze / ▶️ Verder — timer pauzeren
- 🎭 Onthul Imposter — ronde beëindigen

**Single-device:** iedereen kan de timer pauzeren en de reveal starten.

### 3. Onthulling (Reveal)

- Het woord wordt getoond
- De imposter wordt onthuld met zijn/haar hint

### 4. Volgende ronde / Stoppen

- **Volgende Ronde:** nieuwe ronde met dezelfde spelers, nieuw woord
- **Stoppen:** terug naar het startscherm

---

## Instellingen

| Instelling | Uitleg |
|-----------|--------|
| **Categorie** | Filter woorden op thema (bijv. Dieren, Sport) |
| **Moeilijkheid** | Bepaalt hoe vaag de hint voor de imposter is |
| **Timer** | Discussietimer aan/uit + duur (1–5 min) |

**Moeilijkheidsgraden:**
- 😊 Makkelijk — hint is redelijk specifiek
- 😐 Gemiddeld — hint is algemener
- 😈 Moeilijk — hint is erg vaag, imposter heeft het zwaar

---

## Tips

- De imposter wint als hij niet ontdekt wordt, of als hij het woord correct raadt als hij wordt aangewezen
- Beschrijf het woord niet te specifiek — dan valt de imposter meteen door de mand
- Let op wie aarzelt of te vage beschrijvingen geeft
- In multi-device mode kan niemand andermans scherm zien — ideaal voor grotere groepen

---

## URL overzicht

| URL | Functie |
|-----|---------|
| `/` | Startscherm |
| `/lobby` | Nieuw spel aanmaken (1-telefoon of multi-device host) |
| `/join` | Deelnemen via game code |
| `/join/:code` | Direct deelnemen met bekende code |
| `/game` | Actief spel |
| `/settings` | App-instellingen |
| `/words` | Woordenlijst beheren |
