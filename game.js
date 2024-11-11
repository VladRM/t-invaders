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
        this.load.image('player', 'assets/img/player/ship.png');
        this.load.image('background', 'assets/img/space/bg.jpg');
    }

    create() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;
        
        // Get the background texture
        const bgTexture = this.textures.get('background');
        const bgWidth = bgTexture.getSourceImage().width;
        const bgHeight = bgTexture.getSourceImage().height;

        // Calculate how many tiles we need to cover the screen width and height
        const tilesX = Math.ceil(gameWidth / bgWidth) + 1;
        const tilesY = Math.ceil(gameHeight / bgHeight) + 1; // +1 for seamless scrolling

        // Create tiled background using original resolution
        this.bgTiles = [];
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                const bg = this.add.image(x * bgWidth, y * bgHeight, 'background');
                bg.setOrigin(0, 0);
                bg.setAlpha(0.75);
                this.bgTiles.push(bg);
            }
        }
        
        const playerSize = 64;

        this.player = this.physics.add.sprite(gameWidth/2, gameHeight - playerSize, 'player').setDisplaySize(playerSize, playerSize);
        // Set collision bounds for the player
        this.player.setCollideWorldBounds(true);
        // Set bounds to full game width
        this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Set scroll speed (positive for downward scroll)
        this.scrollSpeed = 1;
    }

    update() {
        // Scroll background tiles
        for (let bg of this.bgTiles) {
            bg.y += this.scrollSpeed;
            
            // Reset position when tile goes off screen
            const bgHeight = this.textures.get('background').getSourceImage().height;
            if (bg.y >= this.sys.game.config.height) {
                // Move tile to top of the screen minus one tile height
                bg.y = -bgHeight;
            }
        }

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
