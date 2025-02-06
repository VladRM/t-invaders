import { GameState } from './gameState.js';
import { Player } from './player.js';
import { EnemyGroup } from './enemies.js';
import { SceneManager } from './sceneManager.js';
import { COLLISION, EXPLOSION } from './config.js';
import { createExplosion } from './explosion.js';
import { createBackground, updateBackground } from './background.js';

export class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2' });
        this.gameState = GameState.getInstance();
        this.isTransitioning = false;
    }

    init(data) {
        // Reset the local transition flag at every start of this scene
        this.isTransitioning = false;
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
        
        // Create background
        this.background = createBackground(this);
        
        // Initialize player with current lives from game state
        this.player = new Player(this, {
            size: 64,
            lives: this.gameState.lives
        });
        
        this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
        
        // Initialize global enemy bullets group
        this.enemyBullets = this.physics.add.group();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.scrollSpeed = 1;

        // Create enemy group
        this.enemyGroup = new EnemyGroup(this);
        
        // Add two boss enemies
        const bossSize = 96;
        const spacing = gameWidth / 4;
        
        this.enemyGroup.createEnemyRow({
            count: 3,
            spacing: spacing,
            startX: spacing,
            y: bossSize,
            enemyConfig: {
                imageKey: 'boss',
                size: bossSize,
                hitPoints: 10,
                minFireDelay: 1000,  // 1 second minimum delay
                maxFireDelay: 2000,   // 2 second maximum delay
                isEnemy: true,
                weaponConfig: {
                    multiShotCount: 3,
                    shotAngle: 30,
                    shotXOffset: 20,
                    projectileSpeed: 300
                }
            }
        });

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        // Circle-based collision detection for player projectiles and enemies
        if (this.player.getWeapon()) {
            this.player.getWeapon().getProjectileGroup().getChildren().forEach(projectile => {
                if (!projectile.active) return;
                
                this.enemyGroup.getSprites().forEach(enemySprite => {
                    if (!enemySprite.active) return;
                    
                    const dx = projectile.x - enemySprite.x;
                    const dy = projectile.y - enemySprite.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const projectileRadius = COLLISION.PROJECTILE_RADIUS;
                    const enemyRadius = COLLISION.ENEMY_RADIUS;
                    
                    if (distance < projectileRadius + enemyRadius) {
                        // Create small explosion at impact point
                        createExplosion(this, projectile.x, projectile.y, EXPLOSION.SMALL.size);

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
                                if (enemySprite.body) {
                                    enemySprite.body.enable = false;
                                }
                                
                                // Create centered explosion
                                createExplosion(this, enemySprite.x, enemySprite.y, EXPLOSION.BIG.size);
                            
                                // Fade out enemy sprite
                                this.tweens.add({
                                    targets: enemySprite,
                                    alpha: 0,
                                    duration: 250,
                                    ease: 'Power1',
                                    onComplete: () => {
                                        this.enemyGroup.removeEnemy(enemySprite);
                                        if (this.enemyGroup.enemies.length === 0) {
                                            this.triggerTransition(true);
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

        // Update background
        updateBackground(this, this.background.bgTiles, this.background.scrollSpeed);

        this.player.update(this.cursors, this.spaceKey);
        
        // Check for enemy projectile collisions with player
        this.enemyBullets.getChildren().forEach(projectile => {
            if (!projectile.active || !this.player.getSprite().active) return;
            const playerSprite = this.player.getSprite();
            const dx = projectile.x - playerSprite.x;
            const dy = projectile.y - playerSprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const projectileRadius = COLLISION.ENEMY_PROJECTILE_RADIUS;
            const playerRadius = COLLISION.PLAYER_RADIUS;
            if (distance < projectileRadius + playerRadius) {
                const explosion = this.add.sprite(projectile.x, projectile.y, 'explosion');
                explosion.setDisplaySize(64, 64);
                explosion.on('animationcomplete', function() {
                    this.destroy();
                }, explosion);
                explosion.play('explode');
                // Disable and destroy the projectile
                projectile.setActive(false);
                projectile.setVisible(false);
                projectile.destroy();
                const isGameOver = this.player.damage(false);
                if (isGameOver) {
                    this.triggerTransition(false);
                }
            }
        });

        this.enemyGroup.update();
    }

    triggerTransition(win) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.gameState.won = win;
        if (win) {
            SceneManager.getInstance().goToNextScene(this);
        } else {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                SceneManager.getInstance().goToNextScene(this);
            });
        }
    }
}
