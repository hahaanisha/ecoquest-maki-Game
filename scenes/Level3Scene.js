// Level3Scene.js — Eco Factory: All 4 categories (final level)
import { manager } from '@tialops/maki'
import BaseGameScene from './BaseGameScene.js'
import { GameState } from './GameState.js'

export default class Level3Scene extends BaseGameScene {
  constructor() {
    super('Level3Scene')
    GameState.currentLevel = 3
    this._levelConfig = GameState.getLevelConfig(3)
    this._nextScene = 'VictoryScene'
    manager.map(this, 'level3_map')
  }

  preload() {
    super.preload()
  }

  create() {
    super.create()
    const W = this.scale.width

    // Warning about E-waste
    const warn = this.add.text(W / 2, this.scale.height - 68,
      '🔌 FINAL LEVEL! E-WASTE added — 4 bins to manage. Stay sharp!', {
      fontFamily: 'monospace', fontSize: '13px', color: '#dd88ff',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(51)

    this.time.delayedCall(5000, () => {
      this.tweens.add({ targets: warn, alpha: 0, duration: 1000, onComplete: () => warn.destroy() })
    })

    // Faster movement on final level
    if (this.lia.sprite) this.lia.sprite.setMaxVelocity(210, 210)
    this.lia.speed = 210
  }

  update() {
    super.update()
  }
}
