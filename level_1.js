import { GameState } from './gameState.js';
import { Player } from './player.js';
import { EnemyGroup } from './enemies.js';
import { SceneManager } from './sceneManager.js';
import { COLLISION, EXPLOSION } from './config.js';
import { createExplosion } from './explosion.js';
import { createBackground, updateBackground } from './background.js';

export class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1' });
        this.gameState = GameState.getInstance();
        this.isTransitioning = false;
    }


    create() {
        this.isTransitioning = false;
        if (this.enemyGroup) {
            this.enemyGroup.destroy();
        }
        
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

        // Create single row of 4 enemies
        const spacing = 100;
        const startX = (gameWidth - (spacing * 3)) / 2; // 3 spaces between 4 enemies
        this.enemyGroup.createEnemyRow({
            count: 4,
            spacing: spacing,
            startX: startX,
            y: 100,
            enemyConfig: {
                imageKey: 'enemy',
                size: 48,
                hitPoints: 1,
                isEnemy: true
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
                        createExplosion(this, projectile.x, projectile.y, EXPLOSION.SMALL.size);
                        this.player.getWeapon().destroyProjectile(projectile);
                        
                        enemySprite.active = false;
                        if (enemySprite.body) {
                            enemySprite.body.enable = false;
                        }
                        
                        createExplosion(this, enemySprite.x, enemySprite.y, 128);
                        
                        this.tweens.add({
                            targets: enemySprite,
                            alpha: 0,
                            duration: 250,
                            ease: 'Power1',
                            onComplete: () => {
                                this.enemyGroup.removeEnemy(enemySprite);
                            }
                        });
                        
                        return false;
                    }
                });
            });
        }

        updateBackground(this, this.background.bgTiles, this.background.scrollSpeed);
        this.player.update(this.cursors, this.spaceKey);
        
        this.enemyBullets.getChildren().forEach(projectile => {
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
                explosion.on('animationcomplete', function() {
                    this.destroy();
                }, explosion);
                explosion.play('explode');
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

        this.enemyGroup.update();

        if (this.enemyGroup.enemies.length === 0) {
            this.triggerTransition();
        }
    }

    triggerTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.gameState.won = true;
        this.gameState.currentLevel = 1;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Level1');
        });
    }
}
