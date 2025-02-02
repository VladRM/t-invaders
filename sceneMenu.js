import { UI } from './ui.js';
import { SceneManager } from './sceneManager.js';
import { GameState } from './gameState.js';

export class SceneMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMenu' });
    }

    preload() {
        this.load.image('background', 'assets/img/space/bg.jpg');
    }

    init(data = {}) {
        this.sceneState = data.state || 'start'; // 'start', 'gameover', or 'win'
        
        // If we have gameState values from the previous scene, restore them
        if (data.gameStateValues) {
            const gameState = GameState.getInstance();
            gameState.currentLevel = data.gameStateValues.currentLevel;
            gameState.lives = data.gameStateValues.lives;
            gameState.won = data.gameStateValues.won;
        }
        
        console.log('[SceneMenu] Initialized with state:', this.sceneState, 'data:', data, 'gameState:', {
            currentLevel: GameState.getInstance().currentLevel,
            lives: GameState.getInstance().lives,
            won: GameState.getInstance().won
        });
    }

    create() {
        // Ensure GameState is initialized
        GameState.getInstance();
        this.cameras.main.fadeIn(1000);
        // Add background
        this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const gameTitle = this.add.text(
            this.cameras.main.centerX,
            80,
            "Tudor's\nSpace Adventure",
            {
                fontSize: '48px',
                fill: '#fff',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        gameTitle.setOrigin(0.5);

        // Add state-specific text
        if (this.sceneState === 'gameover' || this.sceneState === 'win') {
            const messageText = this.add.text(
                this.cameras.main.centerX,
                gameTitle.y + 100,
                this.sceneState === 'gameover' ? "Game Over!" : "You Won!",
                {
                    fontSize: '64px',
                    fill: this.sceneState === 'gameover' ? '#ff0000' : '#00ff00',
                    fontStyle: 'bold',
                    align: 'center'
                }
            );
            messageText.setOrigin(0.5);
        }

        // Create appropriate menu button
        const menuConfig = {
            start: {
                text: 'Start Game',
                onClick: () => {
                    console.log('[SceneMenu] Starting new game from START state');
                    GameState.getInstance().reset();
                    this.scene.start('Level1');
                }
            },
            gameover: {
                text: 'Try Again',
                onClick: () => {
                    console.log('[SceneMenu] Starting new game from GAMEOVER state');
                    GameState.getInstance().reset();
                    this.scene.start('Level1');
                }
            },
            win: {
                text: 'Play Again',
                onClick: () => {
                    console.log('[SceneMenu] Starting new game from WIN state');
                    GameState.getInstance().reset();
                    this.scene.start('Level1');
                }
            }
        };

        UI.createMenu(this, [menuConfig[this.sceneState]]);
    }
}
