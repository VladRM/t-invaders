import { GameState } from './gameState.js';
import { Player } from './player.js';
import { EnemyGroup } from './enemies.js';
import { SceneManager } from './sceneManager.js';

export class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2' });
        this.gameState = GameState.getInstance();
        this.isTransitioning = false;
    }

    init(data) {
        // Reset the local transition flag at every start of this scene
        this.isTransitioning = false;
        console.log('[Level2] init: isTransitioning reset to', this.isTransitioning);
    }

    preload() {
        this.load.image('player', 'assets/img/player/ship.png');
        this.load.image('background', 'assets/img/space/bg.jpg');
        this.load.image('projectile', 'assets/img/player/weapons/laser_mini_yellow.png');
        this.load.image('enemy_projectile', 'assets/img/enemies/weapons/red_dot.png');
        this.load.image('boss', 'assets/img/enemies/ships/boss_1.png');
        
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
        
        // Initialize player with current lives from game state
        this.player = new Player(this, {
            size: 64,
            lives: this.gameState.lives
        });
        
        this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.scrollSpeed = 1;

        // Create enemy group
        this.enemyGroup = new EnemyGroup(this);
        
        // Add two boss enemies
        const bossSize = 96;
        const spacing = gameWidth / 3;
        
        this.enemyGroup.createEnemyRow({
            count: 2,
            spacing: spacing,
            startX: spacing,
            y: bossSize,
            enemyConfig: {
                imageKey: 'boss',
                size: bossSize,
                hitPoints: 10,
                minFireDelay: 1000,  // 1 second minimum delay
                maxFireDelay: 2000   // 2 second maximum delay
            }
        });

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        console.log('[Level2] update: enemy count =', this.enemyGroup.enemies.length, 'isTransitioning =', this.isTransitioning);
        // Circle-based collision detection for player projectiles and enemies
        if (this.player.getWeapon()) {
            this.player.getWeapon().getProjectileGroup().getChildren().forEach(projectile => {
                if (!projectile.active) return;
                
                this.enemyGroup.getSprites().forEach(enemySprite => {
                    if (!enemySprite.active) return;
                    
                    const dx = projectile.x - enemySprite.x;
                    const dy = projectile.y - enemySprite.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const projectileRadius = 10;
                    const enemyRadius = 48;  // Larger collision radius for boss
                    
                    if (distance < projectileRadius + enemyRadius) {
                        // Create small explosion at impact point
                        const explosion = this.add.sprite(projectile.x, projectile.y, 'explosion');
                        explosion.setDisplaySize(64, 64);
                        explosion.on('animationcomplete', function(animation, frame) {
                            this.destroy();
                        }, explosion);
                        explosion.play('explode');

                        this.player.getWeapon().destroyProjectile(projectile);
                        
                        // Find the enemy and reduce its hit points
                        const enemy = this.enemyGroup.enemies.find(e => e.sprite === enemySprite);
                        if (enemy) {
                            // Prevent duplicate handling if enemy is already deactivated
                            if (!enemySprite.active) return;
                            
                            enemy.hitPoints--;
                            if (enemy.hitPoints <= 0) {
                                // Mark enemy as inactive to avoid duplicate processing
                                enemySprite.active = false;
                                
                                // Create centered explosion
                                const bigExplosion = this.add.sprite(enemySprite.x, enemySprite.y, 'explosion');
                                bigExplosion.setDisplaySize(192, 192);
                                bigExplosion.on('animationcomplete', function(animation, frame) {
                                    this.destroy();
                                }, bigExplosion);
                                bigExplosion.play('explode');
                            
                                // Fade out enemy sprite
                                this.tweens.add({
                                    targets: enemySprite,
                                    alpha: 0,
                                    duration: 250,
                                    ease: 'Power1',
                                    onComplete: () => {
                                        console.log('[Level2] Tween complete – processing enemy removal.');
                                        this.enemyGroup.removeEnemy(enemySprite);
                                        console.log('[Level2] Enemy count after removal:', this.enemyGroup.enemies.length);
                                        if (this.enemyGroup.enemies.length === 0 && !this.isTransitioning) {
                                            console.log('[Level2] All enemies removed, triggering win transition.');
                                            this.isTransitioning = true;
                                            this.gameState.won = true;
                                            SceneManager.getInstance().goToNextScene(this);
                                        }
                                    }
                                });
                            }
                        }
                        
                        return false;
                    }
                });
            });
        }

        // Scroll background
        for (let bg of this.bgTiles) {
            bg.y += this.scrollSpeed;
            
            const bgHeight = this.textures.get('background').getSourceImage().height;
            if (bg.y >= this.sys.game.config.height) {
                bg.y = -bgHeight;
            }
        }

        this.player.update(this.cursors, this.spaceKey);
        
        // Check for enemy projectile collisions with player
        this.enemyGroup.enemies.forEach(enemy => {
            enemy.weapon.getProjectileGroup().getChildren().forEach(projectile => {
                if (!projectile.active || !this.player.getSprite().active) return;
                
                const playerSprite = this.player.getSprite();
                const dx = projectile.x - playerSprite.x;
                const dy = projectile.y - playerSprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const projectileRadius = 5;
                const playerRadius = 32;
                
                if (distance < projectileRadius + playerRadius) {
                    const explosion = this.add.sprite(projectile.x, projectile.y, 'explosion');
                    explosion.setDisplaySize(64, 64);
                    explosion.on('animationcomplete', function(animation, frame) {
                        this.destroy();
                    }, explosion);
                    explosion.play('explode');

                    enemy.weapon.destroyProjectile(projectile);
                    
                    const isGameOver = this.player.damage(false);
                    if (isGameOver && !this.isTransitioning) {
                        this.isTransitioning = true;
                        this.gameState.won = false;
                        SceneManager.getInstance().goToNextScene(this);
                    }
                }
            });
        });

        this.enemyGroup.update();
    }
}
