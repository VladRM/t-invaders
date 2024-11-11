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
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;
        
        // Create two background sprites for seamless scrolling
        this.bg1 = this.add.tileSprite(gameWidth/2, gameHeight/2, gameWidth, gameHeight, 'background');
        this.bg2 = this.add.tileSprite(gameWidth/2, -gameHeight/2, gameWidth, gameHeight, 'background');
        
        // Set background opacity to 75%
        this.bg1.setAlpha(0.5);
        this.bg2.setAlpha(0.5);
        
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;
        const playerSize = 48;
        const halfPlayerSize = playerSize / 2;

        this.player = this.physics.add.sprite(gameWidth/2, gameHeight - playerSize, 'player').setDisplaySize(playerSize, playerSize);
        // Set collision bounds for the player
        this.player.setCollideWorldBounds(true);
        // Adjust bounds to account for player sprite size
        this.physics.world.setBounds(halfPlayerSize, 0, gameWidth - playerSize, gameHeight);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Set scroll speed
        this.scrollSpeed = -1;
    }

    update() {
        // Scroll both backgrounds upward
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
