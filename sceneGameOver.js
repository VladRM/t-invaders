import { UI } from './ui.js';
import { SceneManager } from './sceneManager.js';

export class SceneGameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneGameOver' });
    }

    create() {
        // Create game over text
        const title = this.add.text(
            this.cameras.main.centerX,
            100,
            "Game Over!",
            {
                fontSize: '64px',
                fill: '#ff0000',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        title.setOrigin(0.5);

        // Create menu with try again option
        UI.createMenu(this, [
            {
                text: 'Try Again',
                onClick: () => SceneManager.getInstance().goToNextScene(this)
            }
        ]);
    }
}
