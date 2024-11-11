class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        // Load any assets needed for the start screen here
    }

    create() {
        // Create temporary text to get dimensions
        const tempText = this.add.text(400, 300, 'Start Game', { 
            fontSize: '32px',
            fill: '#fff'
        });
        const textWidth = tempText.width;
        const textHeight = tempText.height;
        tempText.destroy();
        
        // Create black background rectangle
        const background = this.add.rectangle(
            400,
            300,
            textWidth + 2,
            textHeight + 2,
            0x000000
        );
        background.setOrigin(0.5, 0.5);

        // Create white border rectangle
        const border = this.add.rectangle(
            400,
            300,
            textWidth + 2,
            textHeight + 2,
            0xffffff
        );
        border.setOrigin(0.5, 0.5);
        border.setFillStyle(0x000000);
        border.setStrokeStyle(1, 0xffffff);

        // Create text last so it's on top
        const startText = this.add.text(400, 300, 'Start Game', { 
            fontSize: '32px',
            fill: '#fff'
        });
        startText.setOrigin(0.5, 0.5);
        startText.setInteractive({ cursor: 'pointer' });

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
        this.load.image('projectile', 'assets/img/player/weapons/laser_mini.png');
        this.load.image('enemy', 'assets/img/enemies/1.png');
        
        // Load explosion spritesheet
        this.load.spritesheet('explosion', 'assets/img/space/explosion.png', {
            frameWidth: 192,
            frameHeight: 192
        });
        
        // Load the weapons system
        this.load.script('weapons', 'weapons.js');
    }

    create() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        // Create explosion animation
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 19 }),
            frameRate: 32,
            hideOnComplete: true
        });
        
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

        // Initialize player weapon with circular collision
        this.playerWeapon = new Weapon(this, {
            imageKey: 'projectile',
            damage: 1,
            fireDelay: 200,
            projectileSpeed: -400,
            collisionType: 'circle',
            collisionRadius: 10  // Adjust this value based on your projectile size
        });

        // Create enemies group
        this.enemies = this.physics.add.group();
        
        // Add 5 enemies at the top
        const enemySize = 48;
        const spacing = 100;
        const startX = (gameWidth - (spacing * 4)) / 2; // Center the row of enemies
        
        for (let i = 0; i < 5; i++) {
            const enemy = this.enemies.create(startX + (i * spacing), enemySize, 'enemy')
                .setDisplaySize(enemySize, enemySize);
        }

        // Add collision detection between weapon projectiles and enemies
        this.physics.add.overlap(this.playerWeapon.getProjectileGroup(), this.enemies, (projectile, enemy) => {
            const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
            explosion.play('explode');
            explosion.once('animationcomplete', () => {
                explosion.destroy();
            });
            
            projectile.destroy();
            enemy.destroy();
        }, null, this);

        // Add spacebar for firing
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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

        // Handle weapon firing
        if (this.spaceKey.isDown) {
            this.playerWeapon.fire(this.player.x, this.player.y);
        }

        // Clean up projectiles that are off screen
        this.playerWeapon.cleanup();

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
