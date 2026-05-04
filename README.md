# 🌿 EcoQuest: Waste Warrior

**Maki Hackathon 2026 Entry**

A 2D pixel RPG built with the [Maki framework](https://github.com/tialops/maki) where you play as a waste-sorting hero who must clean up 3 increasingly challenging levels to save the planet!

---

## 🎮 Gameplay

Walk around each level map, **pick up waste items** by touching them, and **sort them into the correct bins**. Sort correctly to earn **XP and score**. Sort incorrectly and lose a **heart** ❤️. 

### Mechanics
- **Auto-pickup** — walk over any waste item to pick it up
- **Auto-drop** — walk into a bin while holding waste to sort it
- **Combo system** — sort multiple items correctly in a row for XP multipliers (x2, x3, x4)
- **Hearts (3)** — lose one per wrong sort; run out and it's game over
- **XP & Player Level** — earn XP for correct sorts + time bonuses
- **Grade system** — earn S/A/B/C/D based on accuracy after each level

### Controls
| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move player |
| SPACE / E | Force drop item into nearest bin |

---

## 📦 Levels

| # | Name | Bins | Time | Target |
|---|------|------|------|--------|
| 1 | 🌳 City Park | DRY ♻️, WET 🌿 | 60s | 10 pts |
| 2 | 🏫 EcoSchool | DRY ♻️, WET 🌿, HAZARD ☢️ | 55s | 15 pts |
| 3 | 🏭 Eco Factory | DRY ♻️, WET 🌿, HAZARD ☢️, E-WASTE 🔌 | 50s | 20 pts |

### Waste Items
| Item | Type |
|------|------|
| Bottle, Paper, Can | Dry Recyclables |
| Banana Peel, Apple Core, Food Scraps | Wet / Organic |
| Battery, Chemical, Light Bulb | Hazardous |
| Old Phone, Keyboard, Circuit Board | E-Waste |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npx vite
```

Open http://localhost:5173 in your browser.

---

## 🛠️ Built With

- [Maki Framework](https://www.npmjs.com/package/@tialops/maki) — 2D RPG game framework on top of Phaser
- [Phaser 3](https://phaser.io/) — HTML5 game framework
- JavaScript (ES Modules)

---

## 👤 About

Made for the **Maki Hackathon 2026** — a beginner-friendly RPG game jam promoting eco-awareness through gameplay.

> "Sort waste. Save Earth. Level up." 🌍
