import { UI } from './ui.js';

export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        // Load any assets needed for the start screen here
    }

    create() {
        // Create title
        const title = this.add.text(
            this.cameras.main.centerX,
            100,
            "Tudor's\nSpace Adventure",
            {
                fontSize: '48px',
                fill: '#fff',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Create menu items
        UI.createMenu(this, [
            {
                text: 'Start Game',
                onClick: () => this.scene.start('GameScene')
            }
        ]);
    }
}
