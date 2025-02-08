import { GameState } from './gameState.js';
import { Player } from './player.js';
import { EnemyGroup } from './enemies.js';
import { SceneManager } from './sceneManager.js';
import { COLLISION, EXPLOSION } from './config.js';
import { createExplosion } from './explosion.js';
import { createBackground, updateBackground } from './background.js';
import { levelsConfig } from './levelsConfig.js';

export class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1' });
        this.gameState = GameState.getInstance();
        this.isTransitioning = false;
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
        this.isTransitioning = false;
        if (this.enemyGroup) {
            this.enemyGroup.destroy();
        }
        
        this.gameState.reset();
        
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 19 }),
            frameRate: 32,
            hideOnComplete: true
        });
        
        this.background = createBackground(this);
        
        this.player = new Player(this, {
            size: 64,
            lives: 3
        });
        
        this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
        this.enemyBullets = this.physics.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.scrollSpeed = 1;
        this.enemyGroup = new EnemyGroup(this);

        // Generate level from config
        const levelConfig = levelsConfig.level1;
        levelConfig.enemyRows.forEach(rowConfig => {
            const spacing = typeof rowConfig.spacing === 'string' ? 
                eval(rowConfig.spacing.replace('gameWidth', gameWidth)) : 
                rowConfig.spacing;
            const startX = (gameWidth - (spacing * (rowConfig.count - 1))) / 2;
            this.enemyGroup.createEnemyRow({
                ...rowConfig,
                startX: startX,
                enemyConfig: {
                    ...rowConfig.enemyConfig,
                    isEnemy: true
                }
            });
        });

        // Don't reset enemy firing states here - let each enemy maintain its own initial delay

        // Add spacebar for firing
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        // Circle-based collision detection for player projectiles and enemies
        if (this.player.getWeapon()) {
            this.player.getWeapon().getProjectileGroup().getChildren().forEach(projectile => {
                if (!projectile.active) return;
                
                this.enemyGroup.getSprites().forEach(enemySprite => {
                    if (!enemySprite.active) return;
                    
                    // Check for intersection using circle collision
                    const dx = projectile.x - enemySprite.x;
                    const dy = projectile.y - enemySprite.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const projectileRadius = COLLISION.PROJECTILE_RADIUS;
                    const enemyRadius = COLLISION.ENEMY_RADIUS;
                    
                    if (distance < projectileRadius + enemyRadius) {
                        // Create small explosion at impact for the projectile
                        createExplosion(this, projectile.x, projectile.y, EXPLOSION.SMALL.size);
                        
                        // Destroy projectile
                        this.player.getWeapon().destroyProjectile(projectile);
                        
                        // Immediately mark the enemy as inactive and disable its physics body
                        enemySprite.active = false;
                        if (enemySprite.body) {
                            enemySprite.body.enable = false;
                        }
                        
                        // Create explosion for enemy
                        createExplosion(this, enemySprite.x, enemySprite.y, 128);
                        
                        // Start tweening to fade out enemy sprite, then remove it
                        this.tweens.add({
                            targets: enemySprite,
                            alpha: 0,
                            duration: 250,
                            ease: 'Power1',
                            onComplete: () => {
                                this.enemyGroup.removeEnemy(enemySprite);
                            }
                        });
                        
                        return false; // Break the inner loop since we've handled this projectile
                    }
                });
            });
        }

        // Update background
        updateBackground(this, this.background.bgTiles, this.background.scrollSpeed);

        // Update player
        this.player.update(this.cursors, this.spaceKey);
        
        // Check for enemy projectile collisions with player
        this.enemyBullets.getChildren().forEach(projectile => {
            if (!projectile.active || !this.player.getSprite().active) return;
            const playerSprite = this.player.getSprite();
            const dx = projectile.x - playerSprite.x;
            const dy = projectile.y - playerSprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const projectileRadius = 5;  // Use same values as before
            const playerRadius = 32;
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
                    this.gameState.won = false;
                    SceneManager.getInstance().goToNextScene(this);
                }
            }
        });

        // Update enemies
        this.enemyGroup.update();

        // Check if all enemies are destroyed to advance to Level 2
        if (this.enemyGroup.enemies.length === 0) {
            this.triggerTransition();
        }
    }

    triggerTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.gameState.won = true;
        this.gameState.currentLevel = 2;  // Update current level
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Level2');
        });
    }
}
