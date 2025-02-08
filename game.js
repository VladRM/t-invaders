import { SceneMenu } from './sceneMenu.js';
import { LevelScene } from './LevelScene.js';
import { levelsConfig } from './levelsConfig.js';

const levelScenes = Object.values(levelsConfig).map(config => 
    new LevelScene(config)
);

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000',
    scene: [SceneMenu, ...levelScenes],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
