import { UI } from './ui.js';
import { SceneManager } from './sceneManager.js';

export class SceneWin extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneWin' });
    }

    create() {
        // Create congratulations text
        const title = this.add.text(
            this.cameras.main.centerX,
            100,
            "Congratulations!\nYou Won!",
            {
                fontSize: '48px',
                fill: '#fff',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        title.setOrigin(0.5);

        // Create menu with play again option
        UI.createMenu(this, [
            {
                text: 'Play Again',
                onClick: () => SceneManager.getInstance().goToNextScene(this)
            }
        ]);
    }
}
