import { GameState } from './gameState.js';
import { Player } from './player.js';
import { EnemyGroup } from './enemies.js';
import { SceneManager } from './sceneManager.js';

export class BaseLevelScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.gameState = GameState.getInstance();
        this.isTransitioning = false;
    }

    init(data) {
        this.isTransitioning = false;
    }

    createCommonElements() {
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
        
        // Initialize player
        this.player = new Player(this, {
            size: 64,
            lives: this.gameState.lives
        });
        
        this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.scrollSpeed = 1;

        // Create enemy group
        this.enemyGroup = new EnemyGroup(this);
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    handlePlayerProjectileCollisions() {
        if (this.player.getWeapon()) {
            this.player.getWeapon().getProjectileGroup().getChildren().forEach(projectile => {
                if (!projectile.active) return;
                
                this.enemyGroup.getSprites().forEach(enemySprite => {
                    if (!enemySprite.active) return;
                    
                    const dx = projectile.x - enemySprite.x;
                    const dy = projectile.y - enemySprite.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const projectileRadius = 10;
                    const enemyRadius = 48;
                    
                    if (distance < projectileRadius + enemyRadius) {
                        // Create impact explosion
                        const explosion = this.add.sprite(projectile.x, projectile.y, 'explosion');
                        explosion.setDisplaySize(64, 64);
                        explosion.on('animationcomplete', function(animation, frame) {
                            this.destroy();
                        }, explosion);
                        explosion.play('explode');

                        this.player.getWeapon().destroyProjectile(projectile);
                        
                        const enemy = this.enemyGroup.enemies.find(e => e.sprite === enemySprite);
                        if (enemy) {
                            if (!enemySprite.active) return;
                            
                            enemy.hitPoints--;
                            if (enemy.hitPoints <= 0) {
                                enemySprite.active = false;
                                
                                const bigExplosion = this.add.sprite(enemySprite.x, enemySprite.y, 'explosion');
                                bigExplosion.setDisplaySize(192, 192);
                                bigExplosion.on('animationcomplete', function(animation, frame) {
                                    this.destroy();
                                }, bigExplosion);
                                bigExplosion.play('explode');
                            
                                this.tweens.add({
                                    targets: enemySprite,
                                    alpha: 0,
                                    duration: 250,
                                    ease: 'Power1',
                                    onComplete: () => {
                                        this.enemyGroup.removeEnemy(enemySprite);
                                        this.handleEnemyDefeated();
                                    }
                                });
                            }
                        }
                        return false;
                    }
                });
            });
        }
    }

    handleEnemyProjectileCollisions() {
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
        this.enemyGroup.update();
    }
}
