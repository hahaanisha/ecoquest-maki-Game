// TitleScene.js — EcoQuest: Waste Warrior — Title screen
import Phaser from "phaser";
import { GameState } from "./GameState.js";

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    const W = this.scale.width,
      H = this.scale.height;
    GameState.reset();

    this.cameras.main.fadeIn(600, 0, 0, 0);

    // ── Background gradient ──
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1a0a, 0x0a1a0a, 0x081408, 0x081408, 1);
    bg.fillRect(0, 0, W, H);

    // ── Animated particle grid ──
    const dots = this.add.graphics();
    for (let xx = 0; xx < W; xx += 32) {
      for (let yy = 0; yy < H; yy += 32) {
        dots.fillStyle(0x00ff88, 0.06 + Math.random() * 0.06);
        dots.fillCircle(xx + Math.random() * 10, yy + Math.random() * 10, 1.5);
      }
    }

    // ── Floating emoji items (decoration) ──
    const decorEmojis = ["♻️", "🌿", "🔋", "📱", "🍌", "📦", "🥤", "🍵"];
    decorEmojis.forEach((em, i) => {
      const ex = 40 + Math.random() * (W - 80);
      const ey = 80 + Math.random() * (H - 160);
      const t = this.add
        .text(ex, ey, em, { fontSize: "28px" })
        .setAlpha(0.12)
        .setDepth(1);
      this.tweens.add({
        targets: t,
        y: ey - 18,
        alpha: 0.18,
        duration: 2000 + Math.random() * 1500,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000,
        ease: "Sine.easeInOut",
      });
    });

    // ── Logo panel ──
    const logoBg = this.add.graphics().setDepth(2);
    logoBg
      .fillStyle(0x000000, 0.72)
      .fillRoundedRect(W / 2 - 330, H * 0.08, 660, 160, 16);
    logoBg
      .lineStyle(2, 0x00ff88, 0.55)
      .strokeRoundedRect(W / 2 - 330, H * 0.08, 660, 160, 16);

    // Corner accents
    const corners = this.add.graphics().setDepth(3);
    corners.lineStyle(2, 0x00ff88, 0.5);
    corners.lineBetween(W / 2 - 330, H * 0.08 + 16, W / 2 - 330, H * 0.08);
    corners.lineBetween(W / 2 - 330, H * 0.08, W / 2 - 314, H * 0.08);
    corners.lineBetween(W / 2 + 330, H * 0.08 + 16, W / 2 + 330, H * 0.08);
    corners.lineBetween(W / 2 + 330, H * 0.08, W / 2 + 314, H * 0.08);

    this.add
      .text(W / 2, H * 0.08 + 28, "♻️", { fontSize: "44px" })
      .setOrigin(0.5)
      .setDepth(3);

    this.add
      .text(W / 2, H * 0.08 + 80, "ECOQUEST", {
        fontFamily: "monospace",
        fontSize: "52px",
        color: "#00ff88",
        stroke: "#003322",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.add
      .text(W / 2, H * 0.08 + 134, "WASTE  WARRIOR", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#88ffcc",
        stroke: "#003322",
        strokeThickness: 3,
        letterSpacing: 6,
      })
      .setOrigin(0.5)
      .setDepth(3);

    // ── Instructions panel ──
    const panelY = H * 0.34;
    const infoBg = this.add.graphics().setDepth(2);
    infoBg
      .fillStyle(0x000000, 0.65)
      .fillRoundedRect(W / 2 - 280, panelY, 560, 170, 10);
    infoBg
      .lineStyle(1.5, 0x44aa66, 0.4)
      .strokeRoundedRect(W / 2 - 280, panelY, 560, 170, 10);

    const rows = [
      ["♻️  DRY", "#4da6ff", "Plastic, paper, glass, cans, cardboard"],
      ["🌿  WET", "#4ade80", "Food waste, peels, coffee, egg shells"],
      ["☢️  HAZARD", "#f87171", "Batteries, medicine, paint, lighters"],
      ["🔌  E-WASTE", "#c084fc", "Phones, computers, chargers, remotes"],
    ];
    rows.forEach(([label, color, desc], i) => {
      const ry = panelY + 18 + i * 36;
      this.add
        .text(W / 2 - 260, ry, label, {
          fontFamily: "monospace",
          fontSize: "14px",
          color,
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setDepth(3);
      this.add
        .text(W / 2 - 80, ry, desc, {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#aaaaaa",
        })
        .setDepth(3);
    });

    // ── Controls ──
    const ctrlY = H * 0.7;
    this.add
      .text(
        W / 2,
        ctrlY,
        "🕹️  WASD / Arrow Keys to move   •   Auto-pickup on proximity",
        {
          fontFamily: "monospace",
          fontSize: "13px",
          color: "#668866",
        },
      )
      .setOrigin(0.5)
      .setDepth(3);

    // ── Start button ──
    const btnY = H * 0.8;
    const btnBg = this.add.graphics().setDepth(3);
    btnBg
      .fillStyle(0x00ff88, 1)
      .fillRoundedRect(W / 2 - 140, btnY - 22, 280, 50, 10);
    btnBg
      .lineStyle(3, 0xffffff, 0.3)
      .strokeRoundedRect(W / 2 - 140, btnY - 22, 280, 50, 10);

    const btnText = this.add
      .text(W / 2, btnY + 3, "▶   START GAME", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#001a00",
        stroke: "#003300",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(4);

    this.tweens.add({
      targets: [btnBg, btnText],
      alpha: 0.78,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ── DEBUG: Level select buttons ──
    const debugY = H * 0.91;
    this.add
      .text(W / 2, debugY - 14, "🧪 TEST: Jump to level", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#446644",
      })
      .setOrigin(0.5, 1)
      .setDepth(3);

    const levelBtns = [
      { label: "LVL 1\nCity Park", scene: "Level1Scene", level: 1 },
      { label: "LVL 2\nEcoSchool", scene: "Level2Scene", level: 2 },
      { label: "LVL 3\nEco Factory", scene: "Level3Scene", level: 3 },
    ];
    const btnW = 100,
      btnH = 38,
      gap = 14;
    const totalW = levelBtns.length * btnW + (levelBtns.length - 1) * gap;
    const startX = W / 2 - totalW / 2;

    levelBtns.forEach((b, i) => {
      const bx = startX + i * (btnW + gap);
      const dbBg = this.add.graphics().setDepth(3);
      dbBg.fillStyle(0x1a2a1a, 0.95).fillRoundedRect(bx, debugY, btnW, btnH, 6);
      dbBg
        .lineStyle(1.5, 0x44aa66, 0.6)
        .strokeRoundedRect(bx, debugY, btnW, btnH, 6);

      const dbText = this.add
        .text(bx + btnW / 2, debugY + btnH / 2, b.label, {
          fontFamily: "monospace",
          fontSize: "10px",
          color: "#88ffaa",
          align: "center",
        })
        .setOrigin(0.5, 0.5)
        .setDepth(4);

      const hitZone = this.add
        .zone(bx + btnW / 2, debugY + btnH / 2, btnW, btnH)
        .setDepth(5)
        .setInteractive({ useHandCursor: true });

      hitZone.on("pointerover", () => {
        dbBg.clear();
        dbBg.fillStyle(0x224422, 1).fillRoundedRect(bx, debugY, btnW, btnH, 6);
        dbBg
          .lineStyle(1.5, 0x00ff88, 0.9)
          .strokeRoundedRect(bx, debugY, btnW, btnH, 6);
        dbText.setColor("#ffffff");
      });
      hitZone.on("pointerout", () => {
        dbBg.clear();
        dbBg
          .fillStyle(0x1a2a1a, 0.95)
          .fillRoundedRect(bx, debugY, btnW, btnH, 6);
        dbBg
          .lineStyle(1.5, 0x44aa66, 0.6)
          .strokeRoundedRect(bx, debugY, btnW, btnH, 6);
        dbText.setColor("#88ffaa");
      });
      hitZone.on("pointerdown", () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          GameState.currentLevel = b.level;
          GameState.hearts = 3;
          GameState.levelScore = 0;
          this.scene.start(b.scene);
        });
      });
    });

    // ── Keyboard / click start ──
    const doStart = () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("Level1Scene");
      });
    };

    const hitZone = this.add
      .zone(W / 2, btnY + 3, 280, 50)
      .setDepth(5)
      .setInteractive({ useHandCursor: true });
    hitZone.on("pointerdown", doStart);
    hitZone.on("pointerover", () => {
      this.tweens.killTweensOf([btnBg, btnText]);
      btnBg.setAlpha(1);
      btnText.setAlpha(1);
    });
    hitZone.on("pointerout", () => {
      this.tweens.add({
        targets: [btnBg, btnText],
        alpha: 0.78,
        scaleX: 1.02,
        scaleY: 1.02,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    });
    this.input.keyboard.once("keydown-SPACE", doStart);
    this.input.keyboard.once("keydown-ENTER", doStart);

    // ── Footer ──
    this.add
      .text(W / 2, H - 8, "Maki Hackathon 2026  •  SPACE or ENTER to start", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#334433",
      })
      .setOrigin(0.5, 1)
      .setDepth(3);
  }
}
