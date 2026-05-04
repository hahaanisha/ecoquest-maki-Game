// LevelCompleteScene.js — Level cleared!
import Phaser from 'phaser'
import { GameState } from './GameState.js'

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() { super('LevelCompleteScene') }

  init(data) {
    this._level     = data?.level     || 1
    this._score     = data?.score     || 0
    this._timeBonus = data?.timeBonus || 0
    this._nextScene = data?.nextScene || null
  }

  create() {
    const W = this.scale.width, H = this.scale.height
    this.cameras.main.fadeIn(500, 0, 40, 0)

    const bg = this.add.graphics()
    bg.fillGradientStyle(0x001a00, 0x001a00, 0x000d00, 0x000d00, 1)
    bg.fillRect(0, 0, W, H)

    // Confetti
    const emojis = ['✨','⭐','🌟','♻️','🎉','💚']
    for (let i = 0; i < 22; i++) {
      const em = emojis[Math.floor(Math.random() * emojis.length)]
      const cx = Math.random() * W
      const cy = -20 - Math.random() * 60
      const t  = this.add.text(cx, cy, em, { fontSize: '22px' }).setAlpha(0.85)
      this.tweens.add({
        targets: t, y: H + 40, x: cx + (Math.random() - 0.5) * 120, alpha: 0,
        duration: 2200 + Math.random() * 1800, delay: Math.random() * 1200,
        ease: 'Quad.easeIn', onComplete: () => t.destroy(),
      })
    }

    this.add.text(W / 2, H * 0.10, '✅  LEVEL COMPLETE!', {
      fontFamily: 'monospace', fontSize: '44px',
      color: '#00ff88', stroke: '#003322', strokeThickness: 7,
    }).setOrigin(0.5)

    const cfg = GameState.getLevelConfig(this._level)
    this.add.text(W / 2, H * 0.21, `${cfg.name} — cleared!`, {
      fontFamily: 'monospace', fontSize: '20px', color: '#88ffcc',
    }).setOrigin(0.5)

    const stars = this._score >= cfg.targetScore * 1.5 ? 3
                : this._score >= cfg.targetScore        ? 2 : 1
    this.add.text(W / 2, H * 0.31, '⭐'.repeat(stars) + '☆'.repeat(3 - stars), {
      fontSize: '40px'
    }).setOrigin(0.5)

    const panelX = W / 2 - 240, panelY = H * 0.40
    const panel  = this.add.graphics()
    panel.fillStyle(0x000000, 0.75).fillRoundedRect(panelX, panelY, 480, 160, 12)
    panel.lineStyle(2, 0x00ff88, 0.5).strokeRoundedRect(panelX, panelY, 480, 160, 12)

    const stats = [
      ['Level Score',    `${this._score} pts`],
      ['Time Bonus XP',  `+${this._timeBonus} XP`],
      ['Total Score',    `${GameState.totalScore} pts`],
      ['Player Level',   `LVL ${GameState.playerLevel}`],
    ]
    stats.forEach(([label, val], i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const x   = panelX + 24 + col * 240
      const y   = panelY + 18 + row * 64
      this.add.text(x, y, label + ':', { fontFamily: 'monospace', fontSize: '13px', color: '#557755' })
      this.add.text(x, y + 24, val, {
        fontFamily: 'monospace', fontSize: '22px',
        color: '#aaffcc', stroke: '#002200', strokeThickness: 2,
      })
    })

    const cont = this.add.text(W / 2 - 130, H * 0.82,
      this._nextScene ? '▶  NEXT LEVEL' : '🏆  VICTORY!', {
      fontFamily: 'monospace', fontSize: '22px', color: '#001a00',
      backgroundColor: '#00ff88', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const retry = this.add.text(W / 2 + 140, H * 0.82, '↩  RETRY', {
      fontFamily: 'monospace', fontSize: '18px', color: '#88ffaa',
      backgroundColor: '#001a00', padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.tweens.add({ targets: cont, scaleX: 1.04, scaleY: 1.04, duration: 700, yoyo: true, repeat: -1 })

    const goContinue = () => {
      GameState.currentLevel++
      this.cameras.main.fadeOut(500, 0, 40, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(this._nextScene || 'VictoryScene')
      })
    }
    const goRetry = () => {
      this.cameras.main.fadeOut(400)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        GameState.hearts = 3; GameState.levelScore = 0
        this.scene.start(`Level${this._level}Scene`)
      })
    }

    cont.on('pointerdown',  goContinue)
    retry.on('pointerdown', goRetry)
    this.input.keyboard.once('keydown-SPACE', goContinue)
    this.input.keyboard.once('keydown-ENTER', goContinue)
    this.input.keyboard.once('keydown-R',     goRetry)

    this.add.text(W / 2, H - 16, 'SPACE/ENTER to continue  •  R to retry', {
      fontFamily: 'monospace', fontSize: '12px', color: '#334433',
    }).setOrigin(0.5, 1)
  }
}
