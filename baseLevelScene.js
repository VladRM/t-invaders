import { GameState } from './gameState.js';
import { Player } from './player.js';
import { EnemyGroup } from './enemies.js';
import { CollisionManager } from './collisionManager.js';

export class BaseLevelScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.gameState = GameState.getInstance();
        this.isTransitioning = false;
        this.collisionManager = new CollisionManager(this);
    }

    preload() {
        this.load.image('player', 'assets/img/player/ship.png');
        this.load.image('background', 'assets/img/space/bg.jpg');
        this.load.image('projectile', 'assets/img/player/weapons/laser_mini_yellow.png');
        this.load.image('enemy_projectile', 'assets/img/enemies/weapons/red_dot.png');
        this.load.image('enemy', 'assets/img/enemies/ships/1.png');
        this.load.image('boss', 'assets/img/enemies/ships/boss_1.png');
        
        this.load.spritesheet('explosion', 'assets/img/space/explosion.png', {
            frameWidth: 192,
            frameHeight: 192
        });
    }

    init(_data) {
        this.isTransitioning = false;
    }

    createCommonElements() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        // Enable debug graphics if debug flag is set
        if (window.ENABLE_DEBUG) {
            this.physics.world.createDebugGraphic();
            const debugGraphics = this.add.graphics().setAlpha(0.75);
            this.physics.world.debugGraphic = debugGraphics;
        }

        // Create explosion animation if it doesn't exist
        if (!this.anims.exists('explode')) {
            this.anims.create({
                key: 'explode',
                frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 16 }),
                frameRate: 30,
                repeat: 0,
                hideOnComplete: true
            });
        }
        
        // Background setup
        const bgTexture = this.textures.get('background');
        const bgWidth = bgTexture.getSourceImage().width;
        const bgHeight = bgTexture.getSourceImage().height;

        const tilesX = Math.ceil(gameWidth / bgWidth) + 1;
        const tilesY = Math.ceil(gameHeight / bgHeight) + 1;

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
            lives: this.gameState.lives
        });
        
        this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.scrollSpeed = 1;

        // Initialize enemy groups array
        this.enemyGroups = [];
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }



    /**
     * Updates the scrolling background position
     * Resets background tiles when they move off screen
     */
    updateBackground() {
        if (!this.bgTiles || !this.textures) {
            return;
        }
        
        for (const bg of this.bgTiles) {
            bg.y += this.scrollSpeed;
            
            const bgHeight = this.textures.get('background').getSourceImage().height;
            if (bg.y >= this.sys.game.config.height) {
                bg.y = -bgHeight;
            }
        }
    }

    /**
     * Called when an enemy is defeated
     * Meant to be overridden by child classes to add custom behavior
     */
    handleEnemyDefeated() {
        if (!this.gameState) {
            console.warn('GameState not initialized in handleEnemyDefeated');
            return;
        }
        // Override in child classes
    }

    /**
     * Main update loop called by Phaser each frame
     * Handles all collision checks, player updates, and enemy movement
     */
    update() {
        if (!this.player || !this.cursors || !this.spaceKey) {
            return;
        }
        this.collisionManager.handlePlayerProjectileCollisions(this.player, this.enemyGroups);
        this.updateBackground();
        this.player.update(this.cursors, this.spaceKey);
        this.collisionManager.handleEnemyProjectileCollisions(this.player, this.enemyGroups, this.gameState);
        this.enemyGroups.forEach(group => group.update());
    }
}
