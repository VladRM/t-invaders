import { GameState } from './gameState.js';
import { Player } from './player.js';
import { EnemyGroup } from './enemies.js';

import { UI } from './ui.js';

class StartScene extends Phaser.Scene {
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
            'SPACE SHOOTER',
            {
                fontSize: '64px',
                fill: '#fff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Create menu items
        UI.createMenu(this, [
            {
                text: 'Start Game',
                onClick: () => this.scene.start('GameScene')
            },
            {
                text: 'High Score: ' + GameState.getInstance().highScore,
                onClick: () => {} // Read-only text
            }
        ]);
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameState = GameState.getInstance();
    }

    preload() {
        // Load image assets
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
        // Reset game state when scene starts
        this.gameState.reset();
        
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
        
        // Initialize player
        this.player = new Player(this, {
            size: 64,
            lives: 3
        });
        // Set bounds to full game width
        this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Set scroll speed (positive for downward scroll)
        this.scrollSpeed = 1;


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
                minFireDelay: 4000,  // 4 seconds minimum
                maxFireDelay: 8000   // 8 seconds maximum
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
                minFireDelay: 4000,  // 4 seconds minimum
                maxFireDelay: 8000   // 8 seconds maximum
            }
        });


        // Add spacebar for firing
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        // Circle-based collision detection for player projectiles and enemies
        this.player.getWeapon().getProjectileGroup().getChildren().forEach(projectile => {
            if (!projectile.active) return;
            
            this.enemyGroup.getSprites().forEach(enemySprite => {
                if (!enemySprite.active) return;
                
                // Check for intersection using circle collision
                const dx = projectile.x - enemySprite.x;
                const dy = projectile.y - enemySprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const projectileRadius = 10;  // Projectile collision radius
                const enemyRadius = 24;       // Enemy collision radius
                
                if (distance < projectileRadius + enemyRadius) {
                    // Store explosion position
                    const explosionX = enemySprite.x;
                    const explosionY = enemySprite.y;
                    
                    // Destroy projectile
                    this.player.getWeapon().destroyProjectile(projectile);
                    
                    // Handle enemy and explosion
                    this.enemyGroup.removeEnemy(enemySprite);
                    
                    // Create explosion effect
                    const explosion = this.add.sprite(explosionX, explosionY, 'explosion');
                    explosion.setDisplaySize(128, 128);
                    explosion.on('animationcomplete', function(animation, frame) {
                        this.destroy();
                    }, explosion);
                    explosion.play('explode');
                    
                    return false; // Break the inner loop since we've handled this projectile
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

        // Update player
        this.player.update(this.cursors, this.spaceKey);
        
        // Check for enemy projectile collisions with player
        this.enemyGroup.enemies.forEach(enemy => {
            enemy.weapon.getProjectileGroup().getChildren().forEach(projectile => {
                if (!projectile.active || !this.player.getSprite().active) return;
                
                const playerSprite = this.player.getSprite();
                const dx = projectile.x - playerSprite.x;
                const dy = projectile.y - playerSprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const projectileRadius = 5;  // Enemy projectile collision radius
                const playerRadius = 32;     // Player collision radius
                
                if (distance < projectileRadius + playerRadius) {
                    // Destroy the projectile
                    enemy.weapon.destroyProjectile(projectile);
                    
                    // Handle player damage and check for game over
                    const isGameOver = this.player.damage();
                    if (isGameOver) {
                        this.scene.start('StartScene');
                    }
                }
            });
        });

        // Update enemies
        this.enemyGroup.update();

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
