// Level2Scene.js — EcoSchool: Dry + Wet + Hazardous
import { manager } from '@tialops/maki'
import BaseGameScene from './BaseGameScene.js'
import { GameState } from './GameState.js'

export default class Level2Scene extends BaseGameScene {
  constructor() {
    super('Level2Scene')
    GameState.currentLevel = 2
    this._levelConfig = GameState.getLevelConfig(2)
    this._nextScene = 'Level3Scene'
    manager.map(this, 'level2_map')
  }

  preload() {
    super.preload()
  }

  create() {
    super.create()
    const W = this.scale.width
    // Warn about hazardous waste
    const warn = this.add.text(W / 2, this.scale.height - 68,
      '☢️ HAZARDOUS waste introduced! Be careful — wrong bin costs a heart!', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ff8844',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(51)

    this.time.delayedCall(5000, () => {
      this.tweens.add({ targets: warn, alpha: 0, duration: 1000, onComplete: () => warn.destroy() })
    })
  }

  update() {
    super.update()
  }
}
