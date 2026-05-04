// game.js — EcoQuest: Waste Warrior
// Hackathon entry: Maki Hackathon 2026
import '@tialops/maki'
import Phaser from 'phaser'
import TitleScene         from './scenes/TitleScene.js'
import Level1Scene        from './scenes/Level1Scene.js'
import Level2Scene        from './scenes/Level2Scene.js'
import Level3Scene        from './scenes/Level3Scene.js'
import LevelCompleteScene from './scenes/LevelCompleteScene.js'
import GameOverScene      from './scenes/GameOverScene.js'
import VictoryScene       from './scenes/VictoryScene.js'

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 608,
  backgroundColor: '#0d1a0d',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [
    TitleScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    LevelCompleteScene,
    GameOverScene,
    VictoryScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
    antialias: false,
  }
})
