import { GameState } from './gameState.js';
import { Player } from './player.js';
import { EnemyGroup } from './enemies.js';
import { SceneManager } from './sceneManager.js';
import { COLLISION, EXPLOSION } from './config.js';
import { createExplosion } from './explosion.js';

export class BaseLevelScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.gameState = GameState.getInstance();
        this.isTransitioning = false;
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

    init(data) {
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


    // Helper: Check circular collision between two objects
    checkCollision(obj1, obj2, radius1, radius2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy) < (radius1 + radius2);
    }

    handlePlayerProjectileCollisions() {
        if (this.player.getWeapon()) {
            const projectiles = this.player.getWeapon().getProjectileGroup().getChildren();
            projectiles.forEach(projectile => {
                if (!projectile.active) return;
                
                this.enemyGroups.forEach(group => {
                    group.getSprites().forEach(enemySprite => {
                    if (!enemySprite.active) return;
                    
                    // Use different collision radius based on enemy type
                    const enemyRadius = enemySprite.texture.key === 'boss' ? 
                        COLLISION.ENEMY_RADIUS : COLLISION.ENEMY_RADIUS * 0.6;
                    if (this.checkCollision(projectile, enemySprite, COLLISION.PROJECTILE_RADIUS, enemyRadius)) {
                        // Create a small explosion for the projectile impact
                        createExplosion(this, projectile.x, projectile.y, EXPLOSION.SMALL.size);
                            
                        // Destroy the projectile using the weapon method
                        this.player.getWeapon().destroyProjectile(projectile);
                        
                        // Find enemy object via the current group
                        const enemy = group.enemies.find(e => e.sprite === enemySprite);
                        if (enemy) {
                            enemy.hitPoints--;
                            if (enemy.hitPoints <= 0) {
                                // Immediately disable enemy collisions
                                enemySprite.active = false;
                                if (enemySprite.body) {
                                    enemySprite.body.enable = false;
                                }
                                    
                                // Create appropriately sized explosion based on enemy type
                                const explosionSize = enemy.sprite.texture.key === 'boss' ? 
                                    EXPLOSION.BIG.size : EXPLOSION.SMALL.size;
                                createExplosion(this, enemySprite.x, enemySprite.y, explosionSize);
                                
                                // Fade out and remove enemy sprite
                                this.tweens.add({
                                    targets: enemySprite,
                                    alpha: 0,
                                    duration: 250,
                                    ease: 'Power1',
                                    onComplete: () => {
                                        group.removeEnemy(enemySprite);
                                        this.handleEnemyDefeated();
                                    }
                                });
                            }
                        }
                    }
                });
            });
        });
    }

    handleEnemyProjectileCollisions() {
        this.enemyGroups.forEach(group => {
            group.enemies.forEach(enemy => {
                enemy.weapon.getProjectileGroup().getChildren().forEach(projectile => {
                    if (!projectile.active || !this.player.getSprite().active) return;
                    
                    if (this.checkCollision(projectile, this.player.getSprite(), COLLISION.ENEMY_PROJECTILE_RADIUS, COLLISION.PLAYER_RADIUS)) {
                        // Create a small explosion at impact
                        createExplosion(this, projectile.x, projectile.y, EXPLOSION.SMALL.size);
                        
                        enemy.weapon.destroyProjectile(projectile);
                        
                        const isGameOver = this.player.damage();
                        if (isGameOver && !this.isTransitioning) {
                            this.isTransitioning = true;
                            this.gameState.won = false;
                            SceneManager.getInstance().goToNextScene(this);
                        }
                    }
                });
            });
        });
    }

    updateBackground() {
        for (let bg of this.bgTiles) {
            bg.y += this.scrollSpeed;
            
            const bgHeight = this.textures.get('background').getSourceImage().height;
            if (bg.y >= this.sys.game.config.height) {
                bg.y = -bgHeight;
            }
        }
    }

    handleEnemyDefeated() {
        // Override in child classes
    }

    update() {
        this.handlePlayerProjectileCollisions();
        this.updateBackground();
        this.player.update(this.cursors, this.spaceKey);
        this.handleEnemyProjectileCollisions();
        this.enemyGroups.forEach(group => group.update());
    }
}
