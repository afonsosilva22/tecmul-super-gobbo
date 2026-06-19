import { MainMenu } from './scenes/MainMenu.js';
import { OptionsScene } from './scenes/OptionsScene.js';
import { HowToPlayScene } from './scenes/HowToPlayScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { ScoreScene } from './scenes/ScoreScene.js';
import { PauseScene } from './scenes/PauseScene.js';

const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    width: 640,
    height: 360,
    backgroundColor: 'b9eaff',

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false,
        }
    },
    scene: [MainMenu, OptionsScene, HowToPlayScene, GameScene, GameOverScene, ScoreScene, PauseScene]
}

const game = new Phaser.Game(config)
