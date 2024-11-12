import { SceneStart } from './sceneStart.js';
import { Level1 } from './level_1.js';
import { Level2 } from './level_2.js';
import { SceneWin } from './sceneWin.js';
import { SceneGameOver } from './sceneGameOver.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000',
    scene: [SceneStart, Level1, Level2, SceneWin, SceneGameOver],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
