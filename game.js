class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        // Load any assets needed for the start screen here
    }

    create() {
        const startText = this.add.text(400, 300, 'Start Game', { fontSize: '32px', fill: '#fff' });
        startText.setOrigin(0.5, 0.5);
        startText.setInteractive();

        startText.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('player', 'assets/img/player.png');
        this.load.image('background', 'assets/img/space/bg.jpg');
    }

    create() {
        // Create two background sprites for seamless scrolling
        this.bg1 = this.add.tileSprite(400, 300, 800, 600, 'background');
        this.bg2 = this.add.tileSprite(400, -300, 800, 600, 'background');
        
        this.player = this.physics.add.sprite(400, 552, 'player').setDisplaySize(48, 48);
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Set scroll speed
        this.scrollSpeed = 2;
    }

    update() {
        // Scroll both backgrounds downward
        this.bg1.tilePositionY += this.scrollSpeed;
        this.bg2.tilePositionY += this.scrollSpeed;

        // Handle player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000',
    scene: [StartScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
