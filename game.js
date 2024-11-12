class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    createButton(x, y, text, onClick) {
        // Create temporary text to get dimensions
        const tempText = this.add.text(0, 0, text, { 
            fontSize: '32px',
            fill: '#fff'
        });
        const textWidth = tempText.width;
        const textHeight = tempText.height;
        const padding = 4; // 2px padding on each side
        tempText.destroy();
        
        // Create black background rectangle
        const background = this.add.rectangle(
            x,
            y,
            textWidth + padding * 2,
            textHeight + padding * 2,
            0x000000
        );
        background.setOrigin(0.5, 0.5);

        // Create white border rectangle
        const border = this.add.rectangle(
            x,
            y,
            textWidth + padding * 2,
            textHeight + padding * 2,
            0xffffff
        );
        border.setOrigin(0.5, 0.5);
        border.setFillStyle(0x000000);
        border.setStrokeStyle(1, 0xffffff);

        // Create text last so it's on top
        const buttonText = this.add.text(x, y, text, { 
            fontSize: '32px',
            fill: '#fff'
        });
        buttonText.setOrigin(0.5, 0.5);
        buttonText.setInteractive({ cursor: 'pointer' });

        buttonText.on('pointerdown', onClick);

        return { background, border, text: buttonText };
    }

    preload() {
        // Load any assets needed for the start screen here
    }

    create() {
        this.createButton(400, 300, 'Start Game', () => {
            this.scene.start('GameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load script files first
        this.load.script('weapons', 'weapons.js');
        this.load.script('enemies', 'enemies.js');

        // Then load image assets
        this.load.image('player', 'assets/img/player/ship.png');
        this.load.image('background', 'assets/img/space/bg.jpg');
        this.load.image('projectile', 'assets/img/player/weapons/laser_mini_yellow.png');
        this.load.image('enemy_projectile', 'assets/img/enemies/weapons/red_dot.png');
        this.load.image('enemy', 'assets/img/enemies/ships/1.png');
        
        // Load explosion spritesheet
        this.load.spritesheet('explosion', 'assets/img/space/explosion.png', {
            frameWidth: 192,
            frameHeight: 192
        });
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
        this.player.lives = 3;

        // Create lives display with ship icons
        this.livesDisplay = [];
        const iconSize = 24;
        const padding = 8;
        for (let i = 0; i < this.player.lives; i++) {
            const lifeIcon = this.add.image(
                gameWidth - (iconSize/2 + padding) - (i * (iconSize + padding)),
                gameHeight - (iconSize/2 + padding),
                'player'
            ).setDisplaySize(iconSize, iconSize);
            this.livesDisplay.push(lifeIcon);
        }
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

        // Create enemy group
        this.enemyGroup = new EnemyGroup(this);
        
        // Add row of enemies
        const enemySize = 48;
        const spacing = 100;
        const startX = (gameWidth - (spacing * 4)) / 2;
        
        // Create first row of enemies
        this.enemyGroup.createEnemyRow({
            count: 5,
            spacing: spacing,
            startX: startX,
            y: enemySize,
            enemyConfig: {
                imageKey: 'enemy',
                size: enemySize,
                fireDelay: 2000
            }
        });

        // Create second row of enemies
        this.enemyGroup.createEnemyRow({
            count: 5,
            spacing: spacing,
            startX: startX,
            y: enemySize * 2.5, // Position slightly below first row
            enemyConfig: {
                imageKey: 'enemy',
                size: enemySize,
                fireDelay: 2500 // Slightly different firing pattern for variety
            }
        });


        // Add spacebar for firing
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        // Custom collision detection
        this.playerWeapon.getProjectileGroup().getChildren().forEach(projectile => {
            if (!projectile.active) return;
            
            this.enemyGroup.getSprites().forEach(enemySprite => {
                if (!enemySprite.active) return;
                
                // Check for intersection using circle collision
                const dx = projectile.x - enemySprite.x;
                const dy = projectile.y - enemySprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Adjust these values based on your sprite sizes
                const projectileRadius = 10;  // Projectile collision radius
                const enemyRadius = 24;       // Enemy collision radius
                
                if (distance < projectileRadius + enemyRadius) {
                    // Store explosion position
                    const explosionX = enemySprite.x;
                    const explosionY = enemySprite.y;
                    
                    // Immediately disable physics and mark inactive
                    projectile.body.enable = false;
                    projectile.setActive(false);
                    this.physics.world.remove(projectile.body);
                    
                    // Destroy projectile first
                    this.playerWeapon.destroyProjectile(projectile);
                    
                    // Then handle enemy and explosion
                    this.enemyGroup.removeEnemy(enemySprite);
                    
                    // Create explosion effect
                    const explosion = this.add.sprite(explosionX, explosionY, 'explosion');
                    explosion.setDisplaySize(128, 128);
                    explosion.on('animationcomplete', function(animation, frame) {
                        this.destroy();
                    }, explosion);
                    explosion.play('explode');
                    
                    // Break the inner loop since we've handled this projectile
                    return false;
                }
            });
        });

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
        
        // Check for enemy projectile collisions with player
        this.enemyGroup.enemies.forEach(enemy => {
            enemy.weapon.getProjectileGroup().getChildren().forEach(projectile => {
                if (!projectile.active || !this.player.active) return;
                
                const dx = projectile.x - this.player.x;
                const dy = projectile.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const projectileRadius = 5;  // Enemy projectile collision radius
                const playerRadius = 32;     // Player collision radius
                
                if (distance < projectileRadius + playerRadius) {
                    // Destroy the projectile
                    enemy.weapon.destroyProjectile(projectile);
                    
                    // Reduce player lives and update display
                    this.player.lives--;
                    if (this.livesDisplay.length > 0) {
                        const iconToRemove = this.livesDisplay.pop();
                        iconToRemove.destroy();
                    }
                    
                    // Create explosion effect at player position
                    const explosion = this.add.sprite(this.player.x, this.player.y, 'explosion');
                    explosion.setDisplaySize(128, 128);
                    explosion.on('animationcomplete', function(animation, frame) {
                        this.destroy();
                    }, explosion);
                    explosion.play('explode');
                    
                    // Check for game over
                    if (this.player.lives <= 0) {
                        this.scene.start('StartScene');
                    }
                }
            });
        });

        // Update enemies
        this.enemyGroup.update();

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
            debug: true
        }
    }
};

const game = new Phaser.Game(config);
