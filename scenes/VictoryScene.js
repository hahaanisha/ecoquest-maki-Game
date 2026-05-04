// VictoryScene.js — You beat all 3 levels!
import Phaser from 'phaser'
import { GameState } from './GameState.js'

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene') }

  create() {
    const W = this.scale.width, H = this.scale.height
    this.cameras.main.fadeIn(700, 0, 40, 0)

    // ── Gold gradient background ──
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x1a1000, 0x1a1000, 0x0a0800, 0x0a0800, 1)
    bg.fillRect(0, 0, W, H)

    // ── Victory rain ──
    const emojis = ['🌟','⭐','✨','🎉','🏆','♻️','💚','🌿']
    for (let i = 0; i < 30; i++) {
      const em = emojis[Math.floor(Math.random() * emojis.length)]
      const t  = this.add.text(Math.random() * W, -40, em, { fontSize: '24px' }).setAlpha(0.9)
      this.tweens.add({
        targets: t, y: H + 50, alpha: 0,
        duration: 2500 + Math.random() * 2000,
        delay: Math.random() * 3000,
        ease: 'Quad.easeIn', repeat: -1, repeatDelay: Math.random() * 4000,
        onRepeat: () => { t.x = Math.random() * W; t.y = -40; t.setAlpha(0.9) },
      })
    }

    // ── Trophy ──
    this.add.text(W / 2, H * 0.08, '🏆', { fontSize: '72px' }).setOrigin(0.5)

    this.add.text(W / 2, H * 0.24, 'YOU DID IT!', {
      fontFamily: 'monospace', fontSize: '54px',
      color: '#ffdd00', stroke: '#664400', strokeThickness: 9,
    }).setOrigin(0.5)

    this.add.text(W / 2, H * 0.36, 'EcoQuest Complete — The city is clean!', {
      fontFamily: 'monospace', fontSize: '18px', color: '#aaffcc',
    }).setOrigin(0.5)

    // ── Final stats ──
    const panelX = W / 2 - 260, panelY = H * 0.44
    const panel  = this.add.graphics()
    panel.fillStyle(0x000000, 0.8).fillRoundedRect(panelX, panelY, 520, 180, 14)
    panel.lineStyle(2.5, 0xffdd00, 0.7).strokeRoundedRect(panelX, panelY, 520, 180, 14)

    const stats = [
      ['Total Score',   `${GameState.totalScore} pts`],
      ['Items Sorted',  `${GameState.itemsSorted}`],
      ['Correct Sorts', `${GameState.correct}`],
      ['Wrong Sorts',   `${GameState.wrong}`],
      ['Best Combo',    `×${GameState.maxCombo}`],
      ['Player Level',  `LVL ${GameState.playerLevel}`],
    ]
    stats.forEach(([label, val], i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const x   = panelX + 24 + col * 260
      const y   = panelY + 18 + row * 54
      this.add.text(x, y, label + ':', {
        fontFamily: 'monospace', fontSize: '13px', color: '#886644',
      })
      this.add.text(x, y + 22, val, {
        fontFamily: 'monospace', fontSize: '22px',
        color: '#ffddaa', stroke: '#331100', strokeThickness: 2,
      })
    })

    // ── Play Again button ──
    const btn = this.add.text(W / 2, H * 0.86, '▶  PLAY AGAIN', {
      fontFamily: 'monospace', fontSize: '24px',
      color: '#001a00', backgroundColor: '#ffdd00',
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 800, yoyo: true, repeat: -1 })

    const restart = () => {
      GameState.reset()
      this.cameras.main.fadeOut(500)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'))
    }
    btn.on('pointerdown', restart)
    this.input.keyboard.once('keydown-SPACE', restart)
    this.input.keyboard.once('keydown-ENTER', restart)

    this.add.text(W / 2, H - 16, 'Thank you for playing EcoQuest! 🌍  •  SPACE to restart', {
      fontFamily: 'monospace', fontSize: '12px', color: '#443311',
    }).setOrigin(0.5, 1)
  }
}
