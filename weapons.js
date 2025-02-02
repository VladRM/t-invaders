import { COLLISION } from './config.js';

export class Weapon {
        constructor(scene, config) {
            this.scene = scene;
            this.imageKey = config.imageKey;
            this.damage = config.damage || 1;
            this.fireDelay = config.fireDelay || 200;
            this.projectileSpeed = config.projectileSpeed || -400;
            this.canFire = true;
            
            if (config.isEnemy) {
                this.isEnemy = true;
                this.minFireDelay = config.minFireDelay;
                this.maxFireDelay = config.maxFireDelay;
            } else {
                this.isEnemy = false;
            }

            // Store collision config
            this.collisionType = config.collisionType || 'circle';
            this.collisionWidth = config.collisionWidth;
            this.collisionHeight = config.collisionHeight;
            this.collisionRadius = config.collisionRadius;

            // Create or use existing projectile group
            if (config.isEnemy && scene.enemyBullets) {
                this.projectiles = scene.enemyBullets;
            } else {
                this.projectiles = scene.physics.add.group({
                    classType: Phaser.Physics.Arcade.Sprite,
                    runChildUpdate: true,
                    createCallback: (projectile) => {
                        projectile.setActive(true);
                        projectile.setVisible(true);
                        if (this.collisionType === 'circle') {
                            const radius = this.collisionRadius || COLLISION.PROJECTILE_RADIUS;
                            projectile.body.setCircle(radius);
                            projectile.body.setOffset(
                                (projectile.width - radius * 2) / 2,
                                (projectile.height - radius * 2) / 2
                            );
                        } else if (this.collisionType === 'rectangle') {
                            const width = this.collisionWidth || projectile.width;
                            const height = this.collisionHeight || projectile.height;
                            projectile.body.setSize(width, height);
                            projectile.body.setOffset(
                                (projectile.width - width) / 2,
                                (projectile.height - height) / 2
                            );
                        }
                    }
                });
            }
        }

        fire(x, y) {
            if (this.canFire) {
                let projectile = this.projectiles.getFirstDead();
                if (projectile) {
                    projectile.setPosition(x, y);
                    projectile.setActive(true);
                    projectile.setVisible(true);
                    projectile.body.enable = true;
                } else {
                    projectile = this.projectiles.create(x, y, this.imageKey);
                }
                
                projectile.setVelocityY(this.projectileSpeed);
                this.canFire = false;
                
                if (!this.isEnemy) {
                    // For player, use the fixed delay to allow next shot
                    this.scene.time.delayedCall(this.fireDelay, () => { 
                        this.canFire = true; 
                    });
                }
                
                return true;
            }
            return false;
        }

        startAutoFire() {
            const autoFire = () => {
                if (this.owner && this.owner.active && this.scene) {
                    if (this.fire(this.owner.x, this.owner.y)) {
                        // For enemy weapons, immediately allow the next fire
                        this.canFire = true;
                        // Schedule next shot with a random delay
                        const delay = Phaser.Math.Between(this.minFireDelay, this.maxFireDelay);
                        this.scene.time.delayedCall(delay, autoFire, [], this);
                    } else {
                        // If unable to fire, try again very shortly
                        this.scene.time.delayedCall(100, autoFire, [], this);
                    }
                }
            };
            autoFire();
        }

        cleanup() {
            const gameHeight = this.scene.sys.game.config.height;
            const gameWidth = this.scene.sys.game.config.width;

            this.projectiles.children.each((projectile) => {
                if (projectile.active) {
                    if (projectile.y < -projectile.height || // Top
                        projectile.y > gameHeight + projectile.height || // Bottom
                        projectile.x < -projectile.width || // Left
                        projectile.x > gameWidth + projectile.width) { // Right
                        
                        // Instead of destroying, recycle the projectile
                        this.destroyProjectile(projectile);
                    }
                }
            });
        }

        destroyProjectile(projectile) {
            // Instead of fully destroying, reset the projectile for reuse
            projectile.setActive(false);
            projectile.setVisible(false);
            projectile.body.stop();
            projectile.body.enable = false;
            // Reset position out of view
            projectile.setPosition(-100, -100);
        }

        getProjectileGroup() {
            return this.projectiles;
        }
    }
