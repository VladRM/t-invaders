import { UI } from './ui.js';
import { SceneManager } from './sceneManager.js';

export class SceneMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMenu' });
    }

    preload() {
        this.load.image('background', 'assets/img/space/bg.jpg');
    }

    init(data = {}) {
        this.sceneState = data.state || 'start'; // 'start', 'gameover', or 'win'
        console.log('SceneMenu init with state:', this.sceneState); // Debug log
    }

    create() {
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
                onClick: () => this.scene.start('Level1')
            },
            gameover: {
                text: 'Try Again',
                onClick: () => SceneManager.getInstance().goToNextScene(this)
            },
            win: {
                text: 'Play Again',
                onClick: () => SceneManager.getInstance().goToNextScene(this)
            }
        };

        UI.createMenu(this, [menuConfig[this.sceneState]]);
    }
}
