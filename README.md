# 🌿 EcoQuest: Waste Warrior

> **Maki Hackathon 2026 Entry**
> "Sort waste. Save Earth. Level up." 🌍

A 2D pixel-art RPG built with the [Maki framework](https://www.npmjs.com/package/@tialops/maki) where you play as **Lia**, a waste-sorting hero on a mission to clean up 3 increasingly challenging levels and save the planet.

---

## 🎮 What Is This Game?

EcoQuest is an **eco-awareness top-down RPG**. Each level drops you into a tiled map — a City Park, an EcoSchool, and an Eco Factory — scattered with waste items. Your job: walk over waste to auto-pick it up, then carry it to the correct sorting bin before time runs out.

Sort correctly → earn XP and extend your combo multiplier.
Sort incorrectly → lose a heart ❤️
Lose all 3 hearts or run out of time → Game Over.

### Core Mechanics

| Mechanic | Description |
|---|---|
| **Auto-pickup** | Walk over any waste item to pick it up automatically |
| **Auto-drop** | Walk into a bin while holding waste to sort it |
| **Combo system** | Consecutive correct sorts unlock x2 → x3 → x4 XP multipliers |
| **Hearts** | 3 lives; one lost per wrong sort |
| **Grade system** | Earn S / A / B / C / D based on accuracy after each level |
| **XP & Player Level** | Earn XP for correct sorts plus time-remaining bonuses |

### Controls

| Key | Action |
|---|---|
| Arrow Keys / WASD | Move player |
| SPACE / E | Force drop item into nearest bin |

---

## 📦 Levels

| # | Setting | Bins | Time Limit | Target Score |
|---|---|---|---|---|
| 1 | 🌳 City Park | DRY ♻️, WET 🌿 | 60s | 10 pts |
| 2 | 🏫 EcoSchool | DRY ♻️, WET 🌿, HAZARD ☢️ | 55s | 15 pts |
| 3 | 🏭 Eco Factory | DRY ♻️, WET 🌿, HAZARD ☢️, E-WASTE 🔌 | 50s | 20 pts |

### Waste Item Types

| Category | Items |
|---|---|
| **Dry Recyclables** | Plastic bottle, Newspaper, Soda can, Cardboard, Glass jar, Milk carton … |
| **Wet / Organic** | Banana peel, Apple core, Food scraps, Tea bag, Egg shell … |
| **Hazardous** | Battery, Paint can, Medicine, Lighter, Aerosol, Motor oil … |
| **E-Waste** | Old phone, Keyboard, Circuit board, Headphones, Hard drive … |

---

## 🏗️ Project Structure

```
ecoquest/
├── index.html               # Minimal shell — loads game.js as ES module
├── game.js                  # Phaser.Game bootstrap; registers all scenes
├── maki.config.js           # Maki framework config (dev mode, debug flag)
├── package.json             # Dependencies: @tialops/maki + phaser
├── assets/
│   ├── maps/                # Tiled JSON map files (default, level1–3)
│   ├── sprites/             # Character sprites (lia.png, ash.png)
│   ├── rooms/               # Room background images
│   ├── bedroom/             # Bedroom furniture sprites
│   ├── kitchen/             # Food/kitchen sprites
│   └── random/              # Misc props (plants, instruments, flower)
└── scenes/
    ├── BaseGameScene.js     # Shared game logic for all 3 levels
    ├── GameState.js         # Global singleton for score, hearts, combos
    ├── Level1Scene.js       # City Park (extends BaseGameScene)
    ├── Level2Scene.js       # EcoSchool (extends BaseGameScene)
    ├── Level3Scene.js       # Eco Factory (extends BaseGameScene)
    ├── TitleScene.js        # Title / start screen
    ├── LevelCompleteScene.js# Grade + score summary between levels
    ├── GameOverScene.js     # Game over screen
    └── VictoryScene.js      # End-game celebration screen
```

---

## 🔧 How the Maki Framework Is Used

[Maki](https://www.npmjs.com/package/@tialops/maki) (`@tialops/maki ^1.1.0`) is a 2D RPG framework built on top of Phaser 3. It abstracts away the boilerplate of Tiled map loading, player sprites, and collision walls so you can focus on game logic.

### 1. Project Bootstrap — `maki.config.js`

```js
// maki.config.js
export default {
  dev: true,
  debug: false
}
```

Maki reads this config at startup to enable its dev server and toggle debug overlays. The `dev` script in `package.json` runs `maki dev` (not `vite` directly), so Maki wraps the Vite dev server with its own middleware.

### 2. Importing Maki in `game.js`

```js
import '@tialops/maki'   // initialises the Maki runtime
import Phaser from 'phaser'
```

The bare side-effect import registers Maki's internals before the Phaser game is instantiated.

### 3. `Scene` — Maki's Extended Scene Class

Every game scene that needs RPG functionality extends Maki's `Scene` instead of Phaser's:

```js
// BaseGameScene.js
import { Scene, manager } from '@tialops/maki'

export default class BaseGameScene extends Scene {
  constructor(key) {
    super(key)   // Maki Scene, not Phaser.Scene
  }
  ...
}
```

`Scene` injects `this.maki` onto the scene — a per-scene API object giving access to player instances, map data, and the asset pipeline.

### 4. Player Registration — `this.maki.player()`

In `preload()`, the active player character is registered with Maki using its asset name:

```js
preload() {
  super.preload()                        // Maki's own preload runs first
  this.lia = this.maki.player('lia')    // links to assets/sprites/lia.png
  manager.preload(this)                  // Maki loads the map + tilesets
}
```

`this.lia` becomes a Maki player object exposing `this.lia.sprite` (the Phaser arcade physics sprite) and `this.lia.speed` for movement velocity — no manual sprite creation needed.

### 5. Map Management — `manager`

The `manager` singleton handles Tiled map lifecycles. In each level's constructor, the map is declared:

```js
// Level1Scene.js
import { manager } from '@tialops/maki'

constructor() {
  super('Level1Scene')
  manager.map(this, 'level1_map')   // registers assets/maps/level1_map.json
}
```

Then in the scene lifecycle:

```js
preload() {
  manager.preload(this)   // loads tiles, tilesets, and map JSON
}

create() {
  manager.create(this)    // instantiates the tilemap into the Phaser scene
}
```

### 6. Collision Walls — `manager.getWallGroup()`

Maki automatically reads the wall/collision layer from the Tiled map and returns a Phaser `StaticGroup`:

```js
const walls = manager.getWallGroup(this, cfg.mapKey)
if (walls) this.physics.add.collider(this.lia.sprite, walls)
```

This is one of Maki's biggest time-savers: collision geometry is defined in the Tiled editor and handed back as a ready-to-use physics group — no manual tile-iteration required.

### 7. Camera & Physics Setup

Because Maki's `Scene` extends Phaser, all standard Phaser APIs still work directly alongside Maki's helpers:

```js
// Phaser camera follows the Maki player sprite
this.cameras.main.startFollow(this.lia.sprite, true, 0.1, 0.1)
this.cameras.main.setBounds(0, 0, this._mapW, this._mapH)

// Standard Phaser arcade physics on the Maki sprite
this.lia.sprite.setCollideWorldBounds(false)
this.lia.speed = 200
```

### Summary — Maki API Surface Used

| API | Where | What it does |
|---|---|---|
| `import '@tialops/maki'` | `game.js` | Initialises the Maki runtime |
| `Scene` (class) | `BaseGameScene.js` | Extended Phaser scene with `this.maki` injected |
| `this.maki.player(name)` | `BaseGameScene.preload()` | Loads + registers the player sprite |
| `manager.map(scene, key)` | `Level*Scene` constructors | Declares which Tiled map a scene uses |
| `manager.preload(scene)` | `BaseGameScene.preload()` | Loads map JSON, tilesets, and sprite sheets |
| `manager.create(scene)` | `BaseGameScene.create()` | Instantiates the tilemap into the scene |
| `manager.getWallGroup(scene, key)` | `BaseGameScene.create()` | Returns collision layer as a Phaser StaticGroup |

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Run dev server (via Maki CLI)
npm run dev
# or: npx maki dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Debug / Development Tips

- Set `DEBUG_LEVEL` in `BaseGameScene.js` to `1`, `2`, or `3` to skip straight to that level.
- During gameplay, press **1 / 2 / 3** to jump to any level instantly.
- Set `debug: true` in `maki.config.js` to enable Maki's debug overlays.
- Set `arcade: { debug: true }` in `game.js` to visualise Phaser physics bodies.

---

## 🛠️ Built With

| Technology | Role |
|---|---|
| [Maki Framework](https://www.npmjs.com/package/@tialops/maki) `^1.1.0` | RPG scene/player/map management on top of Phaser |
| [Phaser 4](https://phaser.io/) `^4.0.0` | HTML5 2D game engine (rendering, physics, input) |
| [Vite](https://vitejs.dev/) | Dev server & bundler (invoked via `maki dev`) |
| JavaScript ES Modules | Game logic; no TypeScript |
| [Tiled Map Editor](https://www.mapeditor.org/) | Map design (JSON exported, consumed by Maki) |

---

## 👤 About

Made for the **Maki Hackathon 2026** — a beginner-friendly RPG game jam promoting eco-awareness through gameplay.

The architecture uses a single `BaseGameScene` that holds all shared game logic (waste spawning, bin collision, HUD, combo system, hearts) and thin `Level*Scene` subclasses that only declare the map key and level config, keeping each level file under ~60 lines.
