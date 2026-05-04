// BaseGameScene.js — EcoQuest Core (Hackathon 2026 — polished RPG edition)
import Phaser from "phaser";
import { Scene, manager } from "@tialops/maki";
import { GameState } from "./GameState.js";

// ─── TESTING: Set this to jump straight to a level (1, 2, or 3). null = normal flow ───
export const DEBUG_LEVEL = null; // e.g. 2  or  3  to skip to that level

// ─── Emoji → Canvas Texture ────────────────────────────────────────────────
function makeEmojiTexture(scene, key, emoji, size = 64) {
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);
  ctx.font = `${Math.floor(size * 0.72)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2 + 2);
  scene.textures.addCanvas(key, canvas);
}

function preloadItemTextures(scene) {
  const items = [
    ["tex_plastic_bottle", "🍶"],
    ["tex_newspaper", "📰"],
    ["tex_soda_can", "🥤"],
    ["tex_cardboard", "📦"],
    ["tex_glass_jar", "🫙"],
    ["tex_milk_carton", "🥛"],
    ["tex_plastic_bag", "🛍️"],
    ["tex_styrofoam", "☕"],
    ["tex_metal_scrap", "🔩"],
    ["tex_plastic_straw", "🥤"],
    ["tex_banana_peel", "🍌"],
    ["tex_apple_core", "🍎"],
    ["tex_food_scraps", "🥗"],
    ["tex_tea_bag", "🍵"],
    ["tex_orange_peel", "🍊"],
    ["tex_egg_shell", "🥚"],
    ["tex_coffee_grounds", "☕"],
    ["tex_lettuce", "🥬"],
    ["tex_battery", "🔋"],
    ["tex_paint_can", "🪣"],
    ["tex_medicine", "💊"],
    ["tex_lighter", "🔥"],
    ["tex_aerosol", "🫧"],
    ["tex_motor_oil", "🛢️"],
    ["tex_phone", "📱"],
    ["tex_keyboard", "⌨️"],
    ["tex_circuit", "🖥️"],
    ["tex_headphones", "🎧"],
    ["tex_remote", "📺"],
    ["tex_charger", "🔌"],
    ["tex_hard_drive", "💾"],
    ["tex_camera", "📷"],
    ["tex_bin_dry", "♻️"],
    ["tex_bin_wet", "🌿"],
    ["tex_bin_hazard", "☢️"],
    ["tex_bin_ewaste", "🔌"],
    ["tex_heart_full", "❤️"],
    ["tex_heart_empty", "🖤"],
    ["tex_star", "⭐"],
  ];
  items.forEach(([key, emoji]) => makeEmojiTexture(scene, key, emoji, 64));
}

const TYPE_COLORS = {
  dry: { ring: 0x4da6ff, bg: 0x1a3d6e, label: "#7dd3fc" },
  wet: { ring: 0x4ade80, bg: 0x1a3d2a, label: "#86efac" },
  hazard: { ring: 0xf87171, bg: 0x4d1a1a, label: "#fca5a5" },
  ewaste: { ring: 0xc084fc, bg: 0x2d1a4d, label: "#d8b4fe" },
};

// HUD layout constants — all in one place to avoid overlapping
const HUD = {
  TOP_H: 64, // height of top bar
  BTM_H: 72, // height of bottom bar
  HEART_SIZE: 24,
  HEART_PADDING: 6,
  HEART_START_X: 14,
  HEART_Y: 32,
};

export default class BaseGameScene extends Scene {
  constructor(key) {
    super(key);
    this._sceneKey = key;
  }

  preload() {
    this._makiPlayers = [];
    super.preload();
    this.lia = this.maki.player("lia");
    manager.preload(this);
    preloadItemTextures(this);
  }

  create() {
    super.create();
    manager.create(this);

    const cfg = this._levelConfig;
    const TS = 16;
    this._mapW = 50 * TS;
    this._mapH = 38 * TS;

    this._holdingItem = null;
    this._wasteObjects = [];
    this._binObjects = [];
    this._gameRunning = true;
    this._timeLeft = cfg.timeLimit;
    this._levelScore = 0;
    GameState.levelScore = 0;
    GameState.combo = 0;
    GameState.timeLeft = cfg.timeLimit;

    this.lia.sprite.setPosition(this._mapW / 2, this._mapH / 2);
    this.lia.sprite.setCollideWorldBounds(false);
    this.lia.speed = 200;

    const kb = this.input.keyboard;
    this._kUp = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this._kDown = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this._kLeft = kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this._kRight = kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this._kW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this._kA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this._kS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this._kD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this._kSpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this._kE = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // ── Testing: level skip hotkeys (1/2/3) ──
    this._k1 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this._k2 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this._k3 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    const walls = manager.getWallGroup(this, cfg.mapKey);
    if (walls) this.physics.add.collider(this.lia.sprite, walls);

    this.cameras.main.startFollow(this.lia.sprite, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this._mapW, this._mapH);
    this.cameras.main.setBackgroundColor(cfg.bgColor || "#1a2a1a");

    this._createBins(cfg);
    this._createHUD(cfg);
    this._createPickupIndicator();

    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 500, () => this._spawnWaste());
    }

    this._timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: this._onTick,
      callbackScope: this,
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
    this._showLevelBanner(cfg);
  }

  _createPickupIndicator() {
    this._pickupRing = this.add.graphics().setDepth(10);
    this._pickupLabel = this.add
      .text(0, 0, "Auto-pickup nearby", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        backgroundColor: "#00000099",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setDepth(10);
  }

  _showLevelBanner(cfg) {
    const W = this.scale.width,
      H = this.scale.height;
    const overlay = this.add
      .graphics()
      .fillStyle(0x000000, 0.88)
      .fillRect(0, H / 2 - 72, W, 144)
      .setScrollFactor(0)
      .setDepth(200);
    const deco = this.add
      .graphics()
      .lineStyle(2, 0x00ff88, 0.6)
      .lineBetween(0, H / 2 - 72, W, H / 2 - 72)
      .lineBetween(0, H / 2 + 72, W, H / 2 + 72)
      .setScrollFactor(0)
      .setDepth(201);
    const t1 = this.add
      .text(
        W / 2,
        H / 2 - 28,
        `LEVEL ${GameState.currentLevel}: ${cfg.name.toUpperCase()}`,
        {
          fontFamily: "monospace",
          fontSize: "38px",
          color: "#ffdd00",
          stroke: "#664400",
          strokeThickness: 5,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201)
      .setAlpha(0);
    const t2 = this.add
      .text(W / 2, H / 2 + 20, cfg.subtitle, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#aaffcc",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201)
      .setAlpha(0);
    this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 300 });
    this.time.delayedCall(2400, () => {
      this.tweens.add({
        targets: [overlay, deco, t1, t2],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          overlay.destroy();
          deco.destroy();
          t1.destroy();
          t2.destroy();
        },
      });
    });
  }

  _createBins(cfg) {
    const H = this._mapH,
      W = this._mapW;
    cfg.bins.forEach((binCfg) => {
      const bx = W * binCfg.x;
      const by = H - 44;
      const tc = TYPE_COLORS[binCfg.type] || TYPE_COLORS.dry;

      // Shadow
      const shadow = this.add.graphics().setDepth(1);
      shadow.fillStyle(0x000000, 0.28);
      shadow.fillEllipse(bx, by + 8, 88, 18);

      // Bin body
      const binGfx = this.add.graphics().setDepth(2);
      binGfx.fillStyle(binCfg.color, 1);
      binGfx.fillRoundedRect(bx - 40, by - 62, 80, 64, 8);
      // Inner sheen
      binGfx.fillStyle(0xffffff, 0.08);
      binGfx.fillRoundedRect(bx - 34, by - 58, 26, 52, 5);
      // Lid
      const lidC = Phaser.Display.Color.IntegerToColor(binCfg.color).lighten(
        22,
      ).color;
      binGfx.fillStyle(lidC, 1);
      binGfx.fillRoundedRect(bx - 44, by - 70, 88, 16, 6);
      // Lid handle
      binGfx.fillStyle(0xffffff, 0.45);
      binGfx.fillRoundedRect(bx - 11, by - 76, 22, 8, 3);
      // Glow border
      binGfx.lineStyle(2.5, tc.ring, 0.75);
      binGfx.strokeRoundedRect(bx - 40, by - 62, 80, 64, 8);

      // Emoji icon on bin
      const iconKey = `tex_bin_${binCfg.type}`;
      const icon = this.add
        .image(bx, by - 34, iconKey)
        .setDisplaySize(34, 34)
        .setDepth(3)
        .setAlpha(0.9);

      // Label pill
      const labelBg = this.add.graphics().setDepth(3);
      labelBg.fillStyle(binCfg.color, 0.95);
      labelBg.fillRoundedRect(bx - 44, by + 6, 88, 22, 6);
      labelBg.lineStyle(1.5, tc.ring, 0.8);
      labelBg.strokeRoundedRect(bx - 44, by + 6, 88, 22, 6);

      this.add
        .text(bx, by + 17, binCfg.label, {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#ffffff",
          stroke: "#00000099",
          strokeThickness: 2,
        })
        .setOrigin(0.5, 0.5)
        .setDepth(4);

      // Physics zone — generous radius
      const zone = this.add.zone(bx, by - 24, 110, 110);
      this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
      zone.setDepth(2);

      // Idle breathe
      this.tweens.add({
        targets: [binGfx, icon],
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 1200 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this._binObjects.push({
        zone,
        type: binCfg.type,
        label: binCfg.label,
        gfx: binGfx,
        icon,
        x: bx,
        y: by,
      });
    });
  }

  // ─── HUD Layout (top bar + bottom bar, zero overlap) ──────────────────────
  //
  //  TOP BAR (y=0 to HUD.TOP_H=64):
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │ ❤️❤️❤️   [XP bar]  LVL N  │  SCORE: NNN  │  LVL N: Name  ⏱ NNs   │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  //  BOTTOM BAR (y=H-72 to H):
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  [BIN A]   Holding: Item Name → hint text    [Target: N pts ████░░]  │
  //  │  DRY ♻    Walk near waste to pick it up     GET ♻  [████░░░░░░░]  │
  //  └──────────────────────────────────────────────────────────────────────┘

  _createHUD(cfg) {
    const W = this.scale.width,
      H = this.scale.height;
    const TH = HUD.TOP_H;
    const BH = HUD.BTM_H;

    // ── TOP BAR BACKGROUND ──
    const topBar = this.add.graphics().setScrollFactor(0).setDepth(50);
    topBar.fillStyle(0x000000, 0.88);
    topBar.fillRect(0, 0, W, TH);
    topBar.lineStyle(1.5, 0x00ff88, 0.28);
    topBar.lineBetween(0, TH, W, TH);

    // Subtle top-bar scan line divider
    topBar.lineStyle(1, 0x00ff88, 0.08);
    topBar.lineBetween(0, TH / 2, W, TH / 2);

    // ── HEARTS (left section, top bar) ──
    this._heartImages = [];
    for (let i = 0; i < GameState.maxHearts; i++) {
      const hx = HUD.HEART_START_X + i * (HUD.HEART_SIZE + HUD.HEART_PADDING);
      const img = this.add
        .image(hx + HUD.HEART_SIZE / 2, HUD.HEART_Y, "tex_heart_full")
        .setDisplaySize(HUD.HEART_SIZE, HUD.HEART_SIZE)
        .setScrollFactor(0)
        .setDepth(51);
      this._heartImages.push(img);
    }

    // ── XP BAR + label (left-center, below hearts) ──
    // Hearts span: 14 to ~14 + 3*(24+6) = 14+90 = 104
    const xpBarX = 14;
    const xpBarY = HUD.TOP_H - 18;
    const xpBarW = 160;
    const xpBarH = 10;

    const xpBg = this.add.graphics().setScrollFactor(0).setDepth(51);
    xpBg
      .fillStyle(0x0d1a0d, 1)
      .fillRoundedRect(xpBarX, xpBarY, xpBarW, xpBarH, 5);
    xpBg
      .lineStyle(1, 0x00ff88, 0.35)
      .strokeRoundedRect(xpBarX, xpBarY, xpBarW, xpBarH, 5);

    this._xpBarFill = this.add.graphics().setScrollFactor(0).setDepth(52);

    // XP label floats just above bar
    this._xpLabel = this.add
      .text(xpBarX, xpBarY - 12, "XP 0 / 100", {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#44cc77",
      })
      .setScrollFactor(0)
      .setDepth(52);
    this._xpBarX = xpBarX;
    this._xpBarY = xpBarY;
    this._xpBarW = xpBarW;
    this._xpBarH = xpBarH;

    // ── PLAYER LEVEL BADGE (right of XP bar) ──
    const badgeX = xpBarX + xpBarW + 8;
    const badgeW = 54;
    const badgeH = 20;
    const badgeY = xpBarY - 2;

    const lvlBadge = this.add.graphics().setScrollFactor(0).setDepth(51);
    lvlBadge
      .fillStyle(0xffdd00, 1)
      .fillRoundedRect(badgeX, badgeY, badgeW, badgeH, 4);
    this._playerLevelText = this.add
      .text(
        badgeX + badgeW / 2,
        badgeY + badgeH / 2,
        `LVL ${GameState.playerLevel}`,
        {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#1a1000",
        },
      )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(52);

    // ── SCORE (top bar, center) ──
    this._scoreText = this.add
      .text(W / 2, TH / 2, "SCORE: 0", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(51);

    // ── COMBO (just below score inside top bar) ──
    this._comboText = this.add
      .text(W / 2, TH - 10, "", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#ffaa00",
        stroke: "#442200",
        strokeThickness: 2,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(51);

    // ── TIMER (top bar, right section) ──
    this._timerText = this.add
      .text(W - 14, TH / 2 - 8, `${cfg.timeLimit}s`, {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#ffff88",
        stroke: "#333300",
        strokeThickness: 3,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(51);

    // Level name (below timer in top bar)
    this._levelNameText = this.add
      .text(W - 14, TH - 10, `LVL ${GameState.currentLevel}: ${cfg.name}`, {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#6688bb",
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(51);

    // Thin vertical dividers in top bar
    const divGfx = this.add.graphics().setScrollFactor(0).setDepth(50);
    divGfx.lineStyle(1, 0x00ff88, 0.12);
    // Left divider (after hearts+xp region)
    divGfx.lineBetween(badgeX + badgeW + 8, 6, badgeX + badgeW + 8, TH - 6);
    // Right divider (before timer)
    divGfx.lineBetween(W - 120, 6, W - 120, TH - 6);

    // ── DEBUG TESTING LABEL ──
    this._debugLabel = this.add
      .text(W / 2, TH + 6, "🧪 [1] Lvl1  [2] Lvl2  [3] Lvl3", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#aa6600",
        backgroundColor: "#1a0d00cc",
        padding: { x: 8, y: 3 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(51);

    // ── BOTTOM BAR BACKGROUND ──
    const botBarY = H - BH;
    const botBar = this.add.graphics().setScrollFactor(0).setDepth(50);
    botBar.fillStyle(0x000000, 0.88);
    botBar.fillRect(0, botBarY, W, BH);
    botBar.lineStyle(1.5, 0x00ff88, 0.28);
    botBar.lineBetween(0, botBarY, W, botBarY);

    // Subtle inner divider line in bottom bar
    botBar.lineStyle(1, 0x00ff88, 0.08);
    botBar.lineBetween(0, botBarY + BH / 2, W, botBarY + BH / 2);

    // ── HOLDING SECTION (center, bottom bar) ──
    const holdCenterY = botBarY + BH / 2;

    this._heldIcon = this.add
      .image(W / 2 - 130, holdCenterY, "tex_heart_empty")
      .setDisplaySize(28, 28)
      .setScrollFactor(0)
      .setDepth(51)
      .setAlpha(0);

    this._holdingText = this.add
      .text(W / 2 - 108, holdCenterY - 10, "", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#ffee88",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(52);

    this._holdingHint = this.add
      .text(W / 2 - 108, holdCenterY + 12, "", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#88aacc",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(51);

    // Idle hint (when not holding)
    this._idleHint = this.add
      .text(
        W / 2,
        holdCenterY,
        "👟  Walk near waste to pick it up  •  Walk to a bin to sort",
        {
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#446644",
        },
      )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(51);

    // ── TARGET + PROGRESS (right side, bottom bar) ──
    const progW = 150;
    const progH = 10;
    const progX = W - progW - 14;
    const progLabelY = botBarY + 14;
    const progBarY = botBarY + 32;

    this._targetLabel = this.add
      .text(
        progX + progW / 2,
        progLabelY,
        `🎯 Target: ${cfg.targetScore} pts`,
        {
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#8899aa",
        },
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(51);

    const pbBg = this.add.graphics().setScrollFactor(0).setDepth(51);
    pbBg
      .fillStyle(0x0d1a2e, 1)
      .fillRoundedRect(progX, progBarY, progW, progH, 5);
    pbBg
      .lineStyle(1, 0x4488ff, 0.4)
      .strokeRoundedRect(progX, progBarY, progW, progH, 5);

    this._progressFill = this.add.graphics().setScrollFactor(0).setDepth(52);
    this._progressTarget = cfg.targetScore;
    this._progX = progX;
    this._progW = progW;
    this._progBarY = progBarY;
    this._progH = progH;

    // Score/target fraction below bar
    this._progressFraction = this.add
      .text(progX + progW / 2, progBarY + progH + 5, "0 / " + cfg.targetScore, {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#4466aa",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(51);

    // ── BIN LABELS (left + right extremes, bottom bar) ──
    // These show the bin types at bottom corners, useful reminders
    this._binReminderText = this.add
      .text(14, holdCenterY, "", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#556655",
        lineSpacing: 4,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(51);

    // Build bin reminder from config
    const binSummary = cfg.bins.map((b) => b.label).join("  ");
    this._binReminderText.setText(binSummary);
  }

  _updateHUD() {
    const W = this.scale.width,
      H = this.scale.height;

    // Hearts
    this._heartImages.forEach((img, i) => {
      img.setTexture(
        i < GameState.hearts ? "tex_heart_full" : "tex_heart_empty",
      );
      img.setAlpha(i < GameState.hearts ? 1 : 0.3);
    });

    // XP bar
    const xpPct = Math.min(1, GameState.xp / GameState.xpToNext);
    this._xpBarFill.clear();
    const fillW = Math.max(4, Math.floor(this._xpBarW * xpPct));
    this._xpBarFill
      .fillStyle(0x00ff88, 1)
      .fillRoundedRect(this._xpBarX, this._xpBarY, fillW, this._xpBarH, 5);
    this._xpLabel.setText(`XP ${GameState.xp} / ${GameState.xpToNext}`);
    this._playerLevelText.setText(`LVL ${GameState.playerLevel}`);

    // Score
    this._scoreText.setText(`SCORE: ${this._levelScore}`);

    // Combo
    if (GameState.combo >= 2) {
      this._comboText.setText(
        `🔥 COMBO ×${GameState.combo}  (+${GameState.getComboMultiplier()}× XP)`,
      );
    } else {
      this._comboText.setText("");
    }

    // Timer — color shift when low
    const tc =
      this._timeLeft <= 5
        ? "#ff4444"
        : this._timeLeft <= 15
          ? "#ffaa00"
          : "#ffff88";
    const ts = this._timeLeft <= 5 ? "26px" : "24px";
    this._timerText.setColor(tc).setFontSize(ts);
    this._timerText.setText(`${this._timeLeft}s`);

    // Holding / idle states in bottom bar
    if (this._holdingItem) {
      const d = GameState.getItemData(this._holdingItem.name);
      const texKey = `tex_${this._holdingItem.name}`;
      this._heldIcon
        .setTexture(this.textures.exists(texKey) ? texKey : "tex_heart_full")
        .setAlpha(1);
      this._holdingText.setText(`Holding: ${d.label}`);
      this._holdingHint.setText(`→ ${d.hint}  |  Walk to bin!`);
      this._idleHint.setAlpha(0);
    } else {
      this._heldIcon.setAlpha(0);
      this._holdingText.setText("");
      this._holdingHint.setText("");
      this._idleHint.setAlpha(1);
    }

    // Progress bar
    const pct = Math.min(1, this._levelScore / this._progressTarget);
    this._progressFill.clear();
    if (pct > 0) {
      const barFillW = Math.floor(this._progW * pct);
      // Color shift: blue → green as you near target
      const fillColor = pct >= 1 ? 0x00ff88 : 0x4da6ff;
      this._progressFill
        .fillStyle(fillColor, 1)
        .fillRoundedRect(this._progX, this._progBarY, barFillW, this._progH, 5);
    }
    this._progressFraction.setText(
      `${this._levelScore} / ${this._progressTarget}`,
    );
  }

  _spawnWaste() {
    if (!this._gameRunning) return;
    const cfg = this._levelConfig;
    if (this._wasteObjects.length >= cfg.maxItems) return;

    const name = cfg.items[Math.floor(Math.random() * cfg.items.length)];
    const itemData = GameState.getItemData(name);
    const tc = TYPE_COLORS[itemData.type] || TYPE_COLORS.dry;
    const margin = 80;
    const binZoneY = this._mapH - 130;
    let x,
      y,
      tries = 0;

    do {
      x = margin + Math.random() * (this._mapW - margin * 2);
      y = margin + Math.random() * (binZoneY - margin * 2);
      tries++;
    } while (
      tries < 12 &&
      this._wasteObjects.some(
        (w) => Math.hypot(w.startX - x, w.startY - y) < 80,
      )
    );

    // Glow rings
    const ring = this.add.graphics().setDepth(2);
    ring.lineStyle(3, tc.ring, 0.55);
    ring.strokeCircle(x, y, 34);
    ring.lineStyle(1.5, tc.ring, 0.2);
    ring.strokeCircle(x, y, 44);

    // Platform base
    const platform = this.add.graphics().setDepth(2);
    platform.fillStyle(tc.ring, 0.18);
    platform.fillRoundedRect(x - 36, y + 16, 72, 16, 5);
    platform.lineStyle(1.5, tc.ring, 0.45);
    platform.strokeRoundedRect(x - 36, y + 16, 72, 16, 5);

    // Emoji sprite
    const texKey = `tex_${name}`;
    const sprite = this.add
      .image(x, y, this.textures.exists(texKey) ? texKey : "tex_heart_full")
      .setDisplaySize(50, 50)
      .setDepth(3);

    // Drop-in animation
    sprite.setAlpha(0).setScale(0.4);
    this.tweens.add({
      targets: sprite,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.easeOut",
    });

    // Label
    const labelText = this.add
      .text(x, y + 24, itemData.label, {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        backgroundColor: `${tc.label}33`,
        padding: { x: 4, y: 1 },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);

    // Physics body
    const body = this.add.zone(x, y, 68, 68);
    this.physics.world.enable(body, Phaser.Physics.Arcade.STATIC_BODY);
    body.setDepth(3);

    const startY = y;
    const t = Math.random() * Math.PI * 2;

    this._wasteObjects.push({
      startX: x,
      startY,
      t,
      x,
      y,
      name,
      type: itemData.type,
      sprite,
      ring,
      platform,
      labelText,
      body,
    });
  }

  _updatePickupIndicator() {
    if (!this._gameRunning || this._holdingItem) {
      this._pickupRing.clear();
      this._pickupLabel.setAlpha(0);
      return;
    }
    const px = this.lia.sprite.x,
      py = this.lia.sprite.y;
    let nearest = null,
      nearestDist = Infinity;
    for (const w of this._wasteObjects) {
      const d = Math.hypot(w.x - px, w.y - py);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = w;
      }
    }
    this._pickupRing.clear();
    if (nearest && nearestDist < 80) {
      const tc = TYPE_COLORS[nearest.type] || TYPE_COLORS.dry;
      this._pickupRing.lineStyle(3, tc.ring, 0.95);
      this._pickupRing.strokeCircle(nearest.x, nearest.y, 40);
      this._pickupRing.lineStyle(1.5, tc.ring, 0.35);
      this._pickupRing.strokeCircle(nearest.x, nearest.y, 52);
      this._pickupLabel.setPosition(nearest.x, nearest.y - 54).setAlpha(1);
    } else {
      this._pickupLabel.setAlpha(0);
    }
  }

  _tryPickup() {
    if (this._holdingItem) return;
    const px = this.lia.sprite.x,
      py = this.lia.sprite.y;
    let closest = null,
      closestDist = 75;
    for (const w of this._wasteObjects) {
      const d = Math.hypot(w.x - px, w.y - py);
      if (d < closestDist) {
        closestDist = d;
        closest = w;
      }
    }
    if (!closest) return;

    this._holdingItem = closest;
    closest.ring.setAlpha(0);
    closest.platform.setAlpha(0);
    closest.labelText.setAlpha(0);
    closest.body.setActive(false);

    this.tweens.add({
      targets: closest.sprite,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 160,
      yoyo: true,
      ease: "Back.easeOut",
    });
    this._showPickupEffect(px, py, GameState.getItemData(closest.name).emoji);
  }

  _tryDrop() {
    if (!this._holdingItem) return;
    const px = this.lia.sprite.x,
      py = this.lia.sprite.y;
    for (const bin of this._binObjects) {
      if (Math.hypot(bin.x - px, bin.y - py) < 95) {
        this._sortItem(bin);
        return;
      }
    }
  }

  _sortItem(bin) {
    const item = this._holdingItem;
    if (!item) return;
    const itemData = GameState.getItemData(item.name);
    const isCorrect = itemData.type === bin.type;

    item.sprite.destroy();
    item.ring.destroy();
    item.platform.destroy();
    item.labelText.destroy();
    item.body.destroy();
    this._wasteObjects = this._wasteObjects.filter((w) => w !== item);
    this._holdingItem = null;

    if (isCorrect) {
      GameState.incrementCombo();
      const mult = GameState.getComboMultiplier();
      const xpGain = 10 * mult;
      const lvlUp = GameState.addXP(xpGain);
      GameState.addScore(1);
      this._levelScore++;
      GameState.correct++;
      GameState.itemsSorted++;

      this._showFeedback(
        bin.x,
        bin.y - 80,
        mult > 1 ? `🔥 COMBO! +1 pt  +${xpGain} XP` : `✅ +1 pt  +${xpGain} XP`,
        true,
        mult > 1,
      );

      this.tweens.add({
        targets: [bin.gfx, bin.icon],
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 150,
        yoyo: true,
        ease: "Back.easeOut",
      });
      if (lvlUp) this._showLevelUpNotice();
      if (this._levelScore >= this._levelConfig.targetScore) {
        this._gameRunning = false;
        this.time.delayedCall(700, () => this._winLevel());
        return;
      }
    } else {
      const isDead = GameState.loseHeart();
      GameState.wrong++;
      this._showFeedback(
        bin.x,
        bin.y - 80,
        `❌ WRONG!  ${itemData.hint}`,
        false,
        false,
      );
      this.cameras.main.shake(300, 0.012);
      this.tweens.add({
        targets: bin.gfx,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
        repeat: 4,
      });
      if (isDead) {
        this._gameRunning = false;
        this.time.delayedCall(700, () => this._gameOver("No hearts left!"));
        return;
      }
    }

    this.time.delayedCall(1100, () => this._spawnWaste());
    this._updateHUD();
  }

  _showPickupEffect(x, y, emoji) {
    const t = this.add
      .text(x, y - 36, `${emoji} Picked up!`, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#aaffcc",
        stroke: "#003300",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(60);
    this.tweens.add({
      targets: t,
      y: y - 90,
      alpha: 0,
      duration: 900,
      onComplete: () => t.destroy(),
    });
  }

  _showFeedback(x, y, msg, correct, isCombo) {
    const t = this.add
      .text(x, y, msg, {
        fontFamily: "monospace",
        fontSize: isCombo ? "22px" : "17px",
        color: correct ? "#00ff88" : "#ff4444",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(60);
    this.tweens.add({
      targets: t,
      y: y - 72,
      alpha: 0,
      duration: 1300,
      ease: "Power2",
      onComplete: () => t.destroy(),
    });
  }

  _showLevelUpNotice() {
    const W = this.scale.width,
      H = this.scale.height;
    const bg = this.add
      .graphics()
      .fillStyle(0x000000, 0.82)
      .fillRoundedRect(W / 2 - 220, H / 2 - 44, 440, 88, 14)
      .lineStyle(2, 0xffdd00, 0.8)
      .strokeRoundedRect(W / 2 - 220, H / 2 - 44, 440, 88, 14)
      .setScrollFactor(0)
      .setDepth(90);
    const t = this.add
      .text(
        W / 2,
        H / 2,
        `⭐  PLAYER LEVEL UP!  LVL ${GameState.playerLevel}  ⭐`,
        {
          fontFamily: "monospace",
          fontSize: "22px",
          color: "#ffdd00",
          stroke: "#664400",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(91);
    this.tweens.add({
      targets: t,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 300,
      yoyo: true,
      repeat: 1,
    });
    this.time.delayedCall(1800, () => {
      bg.destroy();
      t.destroy();
    });
  }

  _onTick() {
    if (!this._gameRunning) return;
    this._timeLeft--;
    GameState.timeLeft = this._timeLeft;
    if (
      this._wasteObjects.length < this._levelConfig.maxItems &&
      Math.random() < this._levelConfig.spawnRate
    ) {
      this._spawnWaste();
    }
    if (this._timeLeft <= 0) {
      this._gameRunning = false;
      if (this._levelScore < this._levelConfig.targetScore) {
        this._gameOver(
          `Time's up! Needed ${this._levelConfig.targetScore} pts`,
        );
      } else {
        this._winLevel();
      }
    }
    this._updateHUD();
  }

  _winLevel() {
    this._timerEvent.remove();
    const timeBonus = this._timeLeft * 2;
    GameState.addXP(timeBonus);
    GameState.addScore(Math.floor(this._timeLeft / 5));
    this.cameras.main.fadeOut(600, 0, 40, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("LevelCompleteScene", {
        level: GameState.currentLevel,
        score: this._levelScore,
        timeBonus,
        nextScene: this._nextScene,
      });
    });
  }

  _gameOver(reason) {
    this._timerEvent.remove();
    this.cameras.main.fadeOut(600, 40, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("GameOverScene", { reason });
    });
  }

  _jumpToLevel(n) {
    if (!this._gameRunning) return;
    this._gameRunning = false;
    this._timerEvent?.remove();
    this.cameras.main.fadeOut(300);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      GameState.currentLevel = n;
      GameState.hearts = 3;
      GameState.levelScore = 0;
      this.scene.start(`Level${n}Scene`);
    });
  }

  update() {
    if (!this._gameRunning) return;

    const sprite = this.lia.sprite;
    const speed = this.lia.speed || 200;
    const goLeft = this._kLeft.isDown || this._kA.isDown;
    const goRight = this._kRight.isDown || this._kD.isDown;
    const goUp = this._kUp.isDown || this._kW.isDown;
    const goDown = this._kDown.isDown || this._kS.isDown;
    const diag = (goLeft || goRight) && (goUp || goDown);
    const s = diag ? speed / Math.SQRT2 : speed;

    sprite.setVelocity(0, 0);
    if (goLeft) sprite.setVelocityX(-s);
    if (goRight) sprite.setVelocityX(s);
    if (goUp) sprite.setVelocityY(-s);
    if (goDown) sprite.setVelocityY(s);

    const n = this.lia.name || "lia";
    if (goLeft) sprite.anims.play(`${n}-left`, true);
    else if (goRight) sprite.anims.play(`${n}-right`, true);
    else if (goUp) sprite.anims.play(`${n}-up`, true);
    else if (goDown) sprite.anims.play(`${n}-down`, true);
    else sprite.anims.stop();

    sprite.x = Phaser.Math.Clamp(sprite.x, 24, this._mapW - 24);
    sprite.y = Phaser.Math.Clamp(sprite.y, 24, this._mapH - 80);

    const dt = this.game.loop.delta / 1000;

    // Float items + sync physics body position
    this._wasteObjects.forEach((w) => {
      if (w === this._holdingItem) return;
      w.t += dt * 2.2;
      const dy = Math.sin(w.t) * 5;
      const ny = w.startY + dy;
      w.sprite.y = ny;
      w.labelText.y = ny + 24;
      w.body.y = ny;
      w.y = ny;
      w.ring.y = ny - w.startY;
      w.platform.y = ny - w.startY;
    });

    // Held item
    if (this._holdingItem) {
      const hi = this._holdingItem;
      hi.sprite.x = sprite.x;
      hi.sprite.y = sprite.y - 52;
      hi.x = sprite.x;
      hi.y = sprite.y - 52;
    }

    // Auto-pickup on proximity
    this._tryPickup();
    if (this._holdingItem) this._tryDrop();

    if (
      Phaser.Input.Keyboard.JustDown(this._kSpace) ||
      Phaser.Input.Keyboard.JustDown(this._kE)
    ) {
      if (this._holdingItem) this._tryDrop();
    }

    // ── Testing: level skip ──
    if (Phaser.Input.Keyboard.JustDown(this._k1)) this._jumpToLevel(1);
    if (Phaser.Input.Keyboard.JustDown(this._k2)) this._jumpToLevel(2);
    if (Phaser.Input.Keyboard.JustDown(this._k3)) this._jumpToLevel(3);

    this._updatePickupIndicator();
  }
}
