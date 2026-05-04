// GameState.js — Shared singleton state across all scenes

export const GameState = {
  // Player stats
  hearts: 3,
  maxHearts: 3,
  xp: 0,
  xpToNext: 100,
  playerLevel: 1,

  // Level progress
  currentLevel: 1,
  totalLevels: 3,
  levelScore: 0,
  totalScore: 0,

  // Combo system
  combo: 0,
  maxCombo: 0,

  // Per-level timer
  timeLeft: 0,

  // Stats per run
  correct: 0,
  wrong: 0,
  itemsSorted: 0,

  reset() {
    this.hearts = 3;
    this.maxHearts = 3;
    this.xp = 0;
    this.xpToNext = 100;
    this.playerLevel = 1;
    this.currentLevel = 1;
    this.levelScore = 0;
    this.totalScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correct = 0;
    this.wrong = 0;
    this.itemsSorted = 0;
  },

  addXP(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.playerLevel++;
      this.xpToNext = Math.floor(this.xpToNext * 1.4);
      return true;
    }
    return false;
  },

  addScore(points) {
    this.levelScore += points;
    this.totalScore += points;
  },

  loseHeart() {
    this.hearts = Math.max(0, this.hearts - 1);
    this.combo = 0;
    return this.hearts <= 0;
  },

  incrementCombo() {
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
  },

  getComboMultiplier() {
    if (this.combo >= 8) return 4;
    if (this.combo >= 5) return 3;
    if (this.combo >= 3) return 2;
    return 1;
  },

  getLevelConfig(level) {
    const configs = {
      1: {
        name: "City Park",
        subtitle: "Learn the Basics — Dry vs Wet",
        mapKey: "level1_map",
        timeLimit: 70,
        targetScore: 12,
        bins: [
          { type: "dry", label: "DRY ♻️", color: 0x3498db, x: 0.25 },
          { type: "wet", label: "WET 🌿", color: 0x2ecc71, x: 0.75 },
        ],
        // Mix of obvious items + tricky lookalikes (e.g. tissue vs paper, teabag vs plastic bag)
        items: [
          "plastic_bottle",
          "newspaper",
          "soda_can",
          "cardboard",
          "plastic_bag",
          "glass_jar",
          "milk_carton",
          "banana_peel",
          "apple_core",
          "food_scraps",
          "tea_bag",
          "orange_peel",
          "egg_shell",
          "coffee_grounds",
          "lettuce",
        ],
        spawnRate: 0.5,
        maxItems: 6,
        bgColor: "#1a3a2a",
      },
      2: {
        name: "EcoSchool",
        subtitle: "Handle Hazardous Waste",
        mapKey: "level2_map",
        timeLimit: 60,
        targetScore: 18,
        bins: [
          { type: "dry", label: "DRY ♻️", color: 0x3498db, x: 0.15 },
          { type: "wet", label: "WET 🌿", color: 0x2ecc71, x: 0.5 },
          { type: "hazard", label: "HAZARD ☢️", color: 0xe74c3c, x: 0.85 },
        ],
        items: [
          "plastic_bottle",
          "newspaper",
          "soda_can",
          "cardboard",
          "glass_jar",
          "styrofoam",
          "metal_scrap",
          "plastic_straw",
          "banana_peel",
          "apple_core",
          "food_scraps",
          "tea_bag",
          "egg_shell",
          "coffee_grounds",
          "battery",
          "paint_can",
          "medicine",
          "lighter",
          "aerosol",
          "motor_oil",
        ],
        spawnRate: 0.55,
        maxItems: 7,
        bgColor: "#1a2a3a",
      },
      3: {
        name: "Eco Factory",
        subtitle: "Master All 4 Categories!",
        mapKey: "level3_map",
        timeLimit: 55,
        targetScore: 25,
        bins: [
          { type: "dry", label: "DRY ♻️", color: 0x3498db, x: 0.12 },
          { type: "wet", label: "WET 🌿", color: 0x2ecc71, x: 0.37 },
          { type: "hazard", label: "HAZARD ☢️", color: 0xe74c3c, x: 0.62 },
          { type: "ewaste", label: "E-WASTE 🔌", color: 0x9b59b6, x: 0.87 },
        ],
        items: [
          "plastic_bottle",
          "newspaper",
          "soda_can",
          "cardboard",
          "glass_jar",
          "styrofoam",
          "metal_scrap",
          "plastic_straw",
          "milk_carton",
          "plastic_bag",
          "banana_peel",
          "apple_core",
          "food_scraps",
          "tea_bag",
          "egg_shell",
          "coffee_grounds",
          "orange_peel",
          "lettuce",
          "battery",
          "paint_can",
          "medicine",
          "lighter",
          "aerosol",
          "motor_oil",
          "phone",
          "keyboard",
          "circuit",
          "headphones",
          "remote",
          "charger",
          "hard_drive",
          "camera",
        ],
        spawnRate: 0.65,
        maxItems: 8,
        bgColor: "#2a1a1a",
      },
    };
    return configs[level] || configs[1];
  },

  // ─── Expanded item database ───────────────────────────────────────────────
  // Each item has: emoji, label, type, hint, color (used for canvas graphics),
  // shape hint for the renderer: 'bottle'|'can'|'box'|'bag'|'blob'|'chip'|'bar'
  getItemData(name) {
    const items = {
      // ── DRY recyclables ───────────────────────────────────────────────────
      plastic_bottle: {
        emoji: "🍶",
        label: "Plastic Bottle",
        type: "dry",
        hint: "Plastic → DRY bin",
        color: 0x88ccff,
        shape: "bottle",
        bodyColor: 0xaaddff,
        capColor: 0xff5555,
      },
      newspaper: {
        emoji: "📰",
        label: "Newspaper",
        type: "dry",
        hint: "Paper/card → DRY bin",
        color: 0xddddaa,
        shape: "paper",
        bodyColor: 0xeeeecc,
        lineColor: 0x888866,
      },
      soda_can: {
        emoji: "🥤",
        label: "Soda Can",
        type: "dry",
        hint: "Metal cans → DRY bin",
        color: 0xff4444,
        shape: "can",
        bodyColor: 0xff6655,
        rimColor: 0xcccccc,
      },
      cardboard: {
        emoji: "📦",
        label: "Cardboard",
        type: "dry",
        hint: "Cardboard → DRY bin",
        color: 0xcc9944,
        shape: "box",
        bodyColor: 0xddaa55,
        lineColor: 0xaa7733,
      },
      glass_jar: {
        emoji: "🫙",
        label: "Glass Jar",
        type: "dry",
        hint: "Glass → DRY bin",
        color: 0x99ddbb,
        shape: "jar",
        bodyColor: 0xaaeebb,
        capColor: 0xcc8833,
      },
      milk_carton: {
        emoji: "🥛",
        label: "Milk Carton",
        type: "dry",
        hint: "Cartons → DRY bin",
        color: 0xffffff,
        shape: "carton",
        bodyColor: 0xeef8ff,
        accentColor: 0x3399cc,
      },
      plastic_bag: {
        emoji: "🛍️",
        label: "Plastic Bag",
        type: "dry",
        hint: "Plastic bags → DRY bin",
        color: 0xbbddff,
        shape: "bag",
        bodyColor: 0xcceeff,
        handleColor: 0x88aacc,
      },
      styrofoam: {
        emoji: "🧊",
        label: "Styrofoam Cup",
        type: "dry",
        hint: "Foam cups → DRY bin",
        color: 0xeeeeee,
        shape: "cup",
        bodyColor: 0xf5f5f5,
        rimColor: 0xdddddd,
      },
      metal_scrap: {
        emoji: "🔩",
        label: "Metal Scrap",
        type: "dry",
        hint: "Metal → DRY bin",
        color: 0xaaaaaa,
        shape: "chip",
        bodyColor: 0xbbbbbb,
        accentColor: 0x888888,
      },
      plastic_straw: {
        emoji: "🥤",
        label: "Plastic Straw",
        type: "dry",
        hint: "Plastic → DRY bin",
        color: 0xff99bb,
        shape: "straw",
        bodyColor: 0xffaabb,
        stripeColor: 0xff6699,
      },

      // ── WET / compost ────────────────────────────────────────────────────
      banana_peel: {
        emoji: "🍌",
        label: "Banana Peel",
        type: "wet",
        hint: "Fruit peel → WET bin",
        color: 0xffdd44,
        shape: "blob",
        bodyColor: 0xffee55,
        spotColor: 0xcc9900,
      },
      apple_core: {
        emoji: "🍎",
        label: "Apple Core",
        type: "wet",
        hint: "Food scraps → WET bin",
        color: 0xff6644,
        shape: "blob",
        bodyColor: 0xff7755,
        spotColor: 0xaa3322,
      },
      food_scraps: {
        emoji: "🥗",
        label: "Food Scraps",
        type: "wet",
        hint: "Leftovers → WET bin",
        color: 0x66aa44,
        shape: "blob",
        bodyColor: 0x77bb55,
        spotColor: 0x449922,
      },
      tea_bag: {
        emoji: "🍵",
        label: "Tea Bag",
        type: "wet",
        hint: "Tea bags → WET bin",
        color: 0xaa8855,
        shape: "bag_small",
        bodyColor: 0xbb9966,
        stringColor: 0xffffff,
      },
      orange_peel: {
        emoji: "🍊",
        label: "Orange Peel",
        type: "wet",
        hint: "Citrus peel → WET bin",
        color: 0xff8833,
        shape: "blob",
        bodyColor: 0xff9944,
        spotColor: 0xdd6611,
      },
      egg_shell: {
        emoji: "🥚",
        label: "Egg Shell",
        type: "wet",
        hint: "Eggshells → WET bin",
        color: 0xeeddcc,
        shape: "egg",
        bodyColor: 0xf0e8d8,
        crackColor: 0xbbaa99,
      },
      coffee_grounds: {
        emoji: "☕",
        label: "Coffee Grounds",
        type: "wet",
        hint: "Coffee → WET bin",
        color: 0x553322,
        shape: "blob",
        bodyColor: 0x664433,
        spotColor: 0x331100,
      },
      lettuce: {
        emoji: "🥬",
        label: "Wilted Lettuce",
        type: "wet",
        hint: "Vegetable scraps → WET bin",
        color: 0x44aa44,
        shape: "leaf",
        bodyColor: 0x55bb55,
        veinColor: 0x228822,
      },

      // ── HAZARDOUS ────────────────────────────────────────────────────────
      battery: {
        emoji: "🔋",
        label: "Battery",
        type: "hazard",
        hint: "Batteries → HAZARD bin!",
        color: 0x44aa44,
        shape: "battery",
        bodyColor: 0x55bb55,
        capColor: 0x33aa33,
      },
      paint_can: {
        emoji: "🪣",
        label: "Paint Can",
        type: "hazard",
        hint: "Paint → HAZARD bin!",
        color: 0xff6600,
        shape: "can",
        bodyColor: 0xff7711,
        rimColor: 0xcccccc,
      },
      medicine: {
        emoji: "💊",
        label: "Old Medicine",
        type: "hazard",
        hint: "Medicine → HAZARD bin!",
        color: 0xff4488,
        shape: "pill",
        bodyColor: 0xff5599,
        capColor: 0xffffff,
      },
      lighter: {
        emoji: "🔥",
        label: "Lighter",
        type: "hazard",
        hint: "Lighters → HAZARD bin!",
        color: 0xffaa00,
        shape: "lighter",
        bodyColor: 0xffbb11,
        capColor: 0xcccccc,
      },
      aerosol: {
        emoji: "🫧",
        label: "Aerosol Can",
        type: "hazard",
        hint: "Aerosols → HAZARD bin!",
        color: 0x6644cc,
        shape: "bottle",
        bodyColor: 0x7755dd,
        capColor: 0x888888,
      },
      motor_oil: {
        emoji: "🛢️",
        label: "Motor Oil",
        type: "hazard",
        hint: "Oil → HAZARD bin!",
        color: 0x222222,
        shape: "can",
        bodyColor: 0x333333,
        rimColor: 0xffaa00,
      },

      // ── E-WASTE ───────────────────────────────────────────────────────────
      phone: {
        emoji: "📱",
        label: "Old Phone",
        type: "ewaste",
        hint: "Electronics → E-WASTE",
        color: 0x222244,
        shape: "phone",
        bodyColor: 0x333366,
        screenColor: 0x6699ff,
      },
      keyboard: {
        emoji: "⌨️",
        label: "Keyboard",
        type: "ewaste",
        hint: "Electronics → E-WASTE",
        color: 0x333344,
        shape: "box",
        bodyColor: 0x444455,
        accentColor: 0x888899,
      },
      circuit: {
        emoji: "🔌",
        label: "Circuit Board",
        type: "ewaste",
        hint: "Electronics → E-WASTE",
        color: 0x224422,
        shape: "chip",
        bodyColor: 0x336633,
        accentColor: 0xffcc00,
      },
      headphones: {
        emoji: "🎧",
        label: "Headphones",
        type: "ewaste",
        hint: "Electronics → E-WASTE",
        color: 0x111111,
        shape: "blob",
        bodyColor: 0x222222,
        accentColor: 0xff3333,
      },
      remote: {
        emoji: "📺",
        label: "TV Remote",
        type: "ewaste",
        hint: "Electronics → E-WASTE",
        color: 0x333333,
        shape: "bar",
        bodyColor: 0x444444,
        accentColor: 0xff4444,
      },
      charger: {
        emoji: "🔌",
        label: "Old Charger",
        type: "ewaste",
        hint: "Electronics → E-WASTE",
        color: 0x222222,
        shape: "chip",
        bodyColor: 0x333333,
        accentColor: 0xffffff,
      },
      hard_drive: {
        emoji: "💾",
        label: "Hard Drive",
        type: "ewaste",
        hint: "Electronics → E-WASTE",
        color: 0x445566,
        shape: "box",
        bodyColor: 0x556677,
        accentColor: 0xaabbcc,
      },
      camera: {
        emoji: "📷",
        label: "Old Camera",
        type: "ewaste",
        hint: "Electronics → E-WASTE",
        color: 0x222222,
        shape: "box",
        bodyColor: 0x333333,
        accentColor: 0x888888,
      },
    };
    return (
      items[name] || {
        emoji: "❓",
        label: name,
        type: "dry",
        hint: "Dry recyclables",
        color: 0x888888,
        shape: "blob",
        bodyColor: 0x999999,
      }
    );
  },
};
