import { COLLISION } from './config.js';

export class Weapon {
        constructor(scene, config) {
            this.scene = scene;
            this.imageKey = config.imageKey;
            this.damage = config.damage || 1;
            this.fireDelay = config.fireDelay || 200;
            this.projectileSpeed = config.projectileSpeed || -400;
            this.multiShotCount = config.multiShotCount || 1;
            this.shotAngle = config.shotAngle || 0;
            this.shotXOffset = config.shotXOffset || 0;
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
                        
                        // Set hitbox size - 90% for enemy projectiles, 60% for player projectiles
                        const hitboxPercent = this.isEnemy ? 0.9 : 0.6;
                        const spriteSize = projectile.width;
                        const hitboxSize = spriteSize * hitboxPercent;
                        
                        projectile.body.setCircle(
                            hitboxSize / 2,
                            (spriteSize - hitboxSize) / 2,
                            (spriteSize - hitboxSize) / 2
                        );
                    }
                });
            }
        }

        fire(x, y) {
            if (this.canFire) {
                const count = this.multiShotCount;
                const shots = [];
                for (let i = 0; i < count; i++) {
                    let angleOffset = 0;
                    let xOffset = 0;
                    if (count > 1) {
                        if (count % 2 === 1) {
                            const centerIndex = Math.floor(count / 2);
                            angleOffset = (i - centerIndex) * this.shotAngle;
                            xOffset = (i - centerIndex) * this.shotXOffset;
                        } else {
                            angleOffset = (i - (count / 2 - 0.5)) * this.shotAngle;
                            xOffset = (i - (count / 2 - 0.5)) * this.shotXOffset;
                        }
                    }
                    console.log("Firing shot", i + 1, "of", count, "angleOffset:", angleOffset, "shotXOffset:", xOffset);
                    const shotX = x + xOffset;
                    let projectile = this.projectiles.getFirstDead();
                    if (projectile) {
                        projectile.setPosition(shotX, y);
                        projectile.setActive(true);
                        projectile.setVisible(true);
                        projectile.body.enable = true;
                    } else {
                        projectile = this.projectiles.create(shotX, y, this.imageKey);
                    }
                    const rad = Phaser.Math.DegToRad(angleOffset);
                    projectile.body.velocity.x = this.projectileSpeed * Math.sin(rad);
                    projectile.body.velocity.y = this.projectileSpeed * Math.cos(rad);
                    shots.push(projectile);
                }
                this.canFire = false;
                if (!this.isEnemy) {
                    // For player, use the fixed delay to allow next shot
                    this.scene.time.delayedCall(this.fireDelay, () => {
                        this.canFire = true;
                    });
                }
                return (count === 1) ? shots[0] : shots;
            }
            return false;
        }

        startAutoFire() {
            const autoFire = () => {
                if (this.owner && this.owner.active && this.scene) {
                    if (this.fire(this.owner.x, this.owner.y)) {
                        // For enemy weapons, immediately allow the next shot (reset canFire)
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
            // Instead of calling autoFire() immediately, schedule it with an initial delay:
            const initialDelay = Phaser.Math.Between(this.minFireDelay, this.maxFireDelay);
            this.scene.time.delayedCall(initialDelay, autoFire, [], this);
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
