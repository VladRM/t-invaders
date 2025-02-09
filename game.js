import { SceneMenu } from './sceneMenu.js';
import { LevelScene } from './LevelScene.js';
import { levelsConfig } from './levelsConfig.js';

console.log('Starting game initialization');

const levelScenes = Object.entries(levelsConfig).map(([key, config]) => {
    console.log('Creating level scene with config:', config.key);
    return new LevelScene({...config, key: config.key});
});

console.log('Level scenes created:', levelScenes.length);

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

console.log('Initializing game with config:', config);
const game = new Phaser.Game(config);
console.log('Phaser.Game instance created');
