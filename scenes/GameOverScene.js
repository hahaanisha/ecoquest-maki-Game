// GameOverScene.js — Game over screen
import Phaser from 'phaser'
import { GameState } from './GameState.js'

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene')
  }

  init(data) {
    this._reason = data?.reason || 'You ran out of resources!'
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    this.cameras.main.fadeIn(400, 40, 0, 0)

    // Dark red background
    this.add.graphics()
      .fillGradientStyle(0x1a0000, 0x1a0000, 0x0a0000, 0x0a0000, 1)
      .fillRect(0, 0, W, H)

    // Animated hazard lines
    for (let i = 0; i < 8; i++) {
      const stripe = this.add.graphics()
      stripe.fillStyle(0x330000, 0.4)
      stripe.fillRect(0, i * (H / 8), W, (H / 8) * 0.5)
    }

    // Game over text
    this.add.text(W / 2, H * 0.18, '💀  GAME OVER  💀', {
      fontFamily: 'monospace', fontSize: '56px', color: '#ff4444',
      stroke: '#440000', strokeThickness: 8,
    }).setOrigin(0.5)

    this.add.text(W / 2, H * 0.30, this._reason, {
      fontFamily: 'monospace', fontSize: '22px', color: '#ff9988',
    }).setOrigin(0.5)

    // Stats panel
    const panelX = W / 2 - 280
    const panelY = H * 0.38

    this.add.graphics()
      .fillStyle(0x110000, 0.9)
      .fillRoundedRect(panelX, panelY, 560, 200, 12)
      .lineStyle(2, 0xff4444, 0.6)
      .strokeRoundedRect(panelX, panelY, 560, 200, 12)

    const stats = [
      ['Level Reached', `${GameState.currentLevel} / ${GameState.totalLevels}`],
      ['Total Score',   `${GameState.totalScore} pts`],
      ['Items Sorted',  `${GameState.itemsSorted}`],
      ['Correct Sorts', `${GameState.correct}`],
      ['Wrong Sorts',   `${GameState.wrong}`],
      ['Best Combo',    `x${GameState.maxCombo}`],
    ]

    stats.forEach(([label, val], i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = panelX + 20 + col * 280
      const y = panelY + 16 + row * 60

      this.add.text(x, y, label + ':', {
        fontFamily: 'monospace', fontSize: '13px', color: '#886666',
      })
      this.add.text(x, y + 22, val, {
        fontFamily: 'monospace', fontSize: '20px', color: '#ffcccc',
        stroke: '#330000', strokeThickness: 2,
      })
    })

    // Tips
    const tips = [
      '💡 Tip: Build combos to earn more XP per item!',
      '💡 Tip: Wrong sorts cost a heart — read the hints!',
      '💡 Tip: Items float near walls — explore the whole map!',
      '💡 Tip: Speed increases in later levels — stay focused!',
    ]
    const tip = tips[Math.floor(Math.random() * tips.length)]
    this.add.text(W / 2, H * 0.72, tip, {
      fontFamily: 'monospace', fontSize: '16px', color: '#666666',
    }).setOrigin(0.5)

    // Buttons
    const tryAgain = this.add.text(W / 2 - 160, H * 0.83, '↩  TRY AGAIN', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ff8888',
      stroke: '#330000', strokeThickness: 3,
      backgroundColor: '#1a0000',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const mainMenu = this.add.text(W / 2 + 160, H * 0.83, '🏠  MAIN MENU', {
      fontFamily: 'monospace', fontSize: '22px', color: '#aaaaaa',
      stroke: '#222222', strokeThickness: 3,
      backgroundColor: '#111111',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.tweens.add({ targets: tryAgain, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 })

    const retry = () => {
      this.cameras.main.fadeOut(400)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Restart from current level
        const sceneKey = `Level${GameState.currentLevel}Scene`
        GameState.hearts = 3
        GameState.levelScore = 0
        this.scene.start(sceneKey)
      })
    }

    const goTitle = () => {
      this.cameras.main.fadeOut(400)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('TitleScene')
      })
    }

    tryAgain.on('pointerdown', retry)
    mainMenu.on('pointerdown', goTitle)
    this.input.keyboard.once('keydown-SPACE', retry)
    this.input.keyboard.once('keydown-ESC', goTitle)

    this.add.text(W / 2, H * 0.93, 'SPACE to retry  •  ESC for menu', {
      fontFamily: 'monospace', fontSize: '14px', color: '#555555',
    }).setOrigin(0.5)
  }
}
