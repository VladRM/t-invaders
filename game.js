import { SceneMenu } from './sceneMenu.js';
import { Level1 } from './level_1.js';
import { Level2 } from './level_2.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000',
    scene: [SceneMenu, Level1, Level2],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
