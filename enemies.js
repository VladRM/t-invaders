import { Weapon } from './weapons.js';

export class Enemy {
        constructor(scene, config) {
            this.scene = scene;
            this.imageKey = config.imageKey;
            this.x = config.x;
            this.y = config.y;
            this.size = config.size || 48;
            this.hitPoints = config.hitPoints || 1;
            // Ensure we always use the provided delays or defaults
            this.minFireDelay = typeof config.minFireDelay === 'number' ? config.minFireDelay : 4000;
            this.maxFireDelay = typeof config.maxFireDelay === 'number' ? config.maxFireDelay : 8000;
            
            // Record spawn time and initialize firing state
            this.spawnTime = scene.time.now;
            this.firstShotDelay = Math.max(this.getRandomFireDelay() + 1000, 5000);
            this.hasFirstShot = false;
            console.log(`[Enemy] Created at ${scene.time.now}, firstShotDelay: ${this.firstShotDelay}`);
            
            // Create a new weapon instance for this enemy
            this.weapon = new Weapon(scene, {
                imageKey: 'enemy_projectile',
                damage: 1,
                fireDelay: 0, // We'll handle the delay in Enemy class
                projectileSpeed: 300,
                collisionType: 'circle',
                collisionRadius: 5
            });
            this.resetFiringState();
            
            this.sprite = scene.physics.add.sprite(this.x, this.y, this.imageKey)
                .setDisplaySize(this.size, this.size);
        }

        resetFiringState(baseTime) {
            // If baseTime provided (e.g. on scene restart), update spawn time
            if (baseTime !== undefined) {
                this.spawnTime = baseTime;
                this.hasFirstShot = false;
            }
            // Reset first shot delay
            this.firstShotDelay = Math.max(this.getRandomFireDelay() + 1000, 5000);
        }

        getRandomFireDelay() {
            return Phaser.Math.Between(this.minFireDelay, this.maxFireDelay);
        }

        update() {
            const timeSinceSpawn = this.scene.time.now - this.spawnTime;
            
            if (this.weapon) {
                if (!this.hasFirstShot) {
                    // Handle first shot after spawn
                    if (timeSinceSpawn >= this.firstShotDelay) {
                        console.log(`[Enemy] Attempting first shot at ${this.scene.time.now}, timeSinceSpawn: ${timeSinceSpawn}, delay: ${this.firstShotDelay}`);
                        if (this.weapon.fire(this.sprite.x, this.sprite.y)) {
                            console.log(`[Enemy] First shot successful`);
                            this.hasFirstShot = true;
                            this.lastFireTime = this.scene.time.now;
                            this.nextShotDelay = this.getRandomFireDelay();
                        }
                    }
                } else {
                    // Handle subsequent shots
                    const timeSinceLastShot = this.scene.time.now - this.lastFireTime;
                    if (timeSinceLastShot >= this.nextShotDelay) {
                        if (this.weapon.fire(this.sprite.x, this.sprite.y)) {
                            this.lastFireTime = this.scene.time.now;
                            this.nextShotDelay = this.getRandomFireDelay();
                        }
                    }
                }
            }
        }

        destroy() {
            if (this.weapon && this.weapon.getProjectileGroup()) {
                const projectiles = this.weapon.getProjectileGroup();
                projectiles.destroy(true);
            }
            if (this.sprite) {
                this.sprite.destroy();
            }
            this.weapon = null;
        }

        getSprite() {
            return this.sprite;
        }
    }

export class EnemyGroup {
        constructor(scene) {
            this.scene = scene;
            this.enemies = [];
            this.direction = 1; // 1 for right, -1 for left
            this.moveSpeed = 100; // pixels per second
            this.padding = 50; // padding from screen edges
        }

        createEnemyRow(config) {
            const { count, spacing, startX, y, enemyConfig } = config;
            
            // Store the initial x position for movement boundaries
            this.startX = startX;

            for (let i = 0; i < count; i++) {
                const enemy = new Enemy(this.scene, {
                    ...enemyConfig,
                    x: startX + (i * spacing),
                    y: y
                });
                this.enemies.push(enemy);
            }
        }

        update() {
            // Update individual enemies
            this.enemies.forEach(enemy => enemy.update());

            // Skip movement if no enemies
            if (this.enemies.length === 0) return;

            // Get the leftmost and rightmost enemies
            const positions = this.enemies.map(e => e.sprite.x);
            const leftmost = Math.min(...positions);
            const rightmost = Math.max(...positions);

            // Move the entire group
            const moveAmount = this.moveSpeed * this.direction * (this.scene.game.loop.delta / 1000);
            
            // Check boundaries and change direction if needed
            const gameWidth = this.scene.sys.game.config.width;
            if (this.direction > 0 && rightmost + moveAmount > gameWidth - this.padding) {
                this.direction = -1;
            } else if (this.direction < 0 && leftmost + moveAmount < this.padding) {
                this.direction = 1;
            }

            // Apply movement to all enemies
            this.enemies.forEach(enemy => {
                enemy.sprite.x += moveAmount;
            });
        }

        getSprites() {
            return this.enemies.map(enemy => enemy.getSprite());
        }

        removeEnemy(enemySprite) {
            // Find the enemy whose sprite matches the one that was hit
            const enemy = this.enemies.find(e => e.sprite === enemySprite);
            if (enemy) {
                enemy.destroy();
                this.enemies = this.enemies.filter(e => e !== enemy);
            }
        }

        destroy() {
            // Properly destroy all enemies and clear the array
            this.enemies.forEach(enemy => {
                enemy.destroy();
            });
            this.enemies = [];
        }

        resetEnemyFiringStates() {
            const baseTime = this.scene.time.now;
            this.enemies.forEach(enemy => enemy.resetFiringState(baseTime));
        }
    }
