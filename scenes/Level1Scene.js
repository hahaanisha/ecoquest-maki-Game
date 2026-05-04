// Level1Scene.js — City Park: Dry vs Wet
import { manager } from "@tialops/maki";
import BaseGameScene from "./BaseGameScene.js";
import { GameState } from "./GameState.js";
import { DEBUG_LEVEL } from "./BaseGameScene.js";

export default class Level1Scene extends BaseGameScene {
  constructor() {
    super("Level1Scene");
    GameState.currentLevel = 1;
    this._levelConfig = GameState.getLevelConfig(1);
    this._nextScene = "Level2Scene";
    manager.map(this, "level1_map");
  }

  preload() {
    super.preload();
  }

  create() {
    // Testing: if DEBUG_LEVEL is set and we're at level 1, jump immediately
    if (DEBUG_LEVEL && DEBUG_LEVEL !== 1) {
      GameState.currentLevel = DEBUG_LEVEL;
      GameState.hearts = 3;
      GameState.levelScore = 0;
      this.scene.start(`Level${DEBUG_LEVEL}Scene`);
      return;
    }

    super.create();
    const W = this.scale.width;
    const hint = this.add
      .text(
        W / 2,
        this.scale.height - 80,
        "💡 Walk near waste to pick it up  •  Walk to the bin to sort it",
        {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#667766",
        },
      )
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(51);

    this.time.delayedCall(6000, () => {
      this.tweens.add({
        targets: hint,
        alpha: 0,
        duration: 1000,
        onComplete: () => hint.destroy(),
      });
    });
  }

  update() {
    super.update();
  }
}
