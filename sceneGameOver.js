import { UI } from './ui.js';
import { SceneManager } from './sceneManager.js';

export class SceneGameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneGameOver' });
    }

    create() {
        // Create title text
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

        // Create game over text
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            gameTitle.y + 100,
            "Game Over!",
            {
                fontSize: '64px',
                fill: '#ff0000',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        gameOverText.setOrigin(0.5);

        // Create menu with try again option in consistent style
        UI.createMenu(this, [
            {
                text: 'Try Again',
                onClick: () => SceneManager.getInstance().goToNextScene(this)
            }
        ]);
    }
}
