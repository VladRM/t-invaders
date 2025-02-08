import { Weapon } from './weapons.js';
import { COLLISION } from './config.js';

export class Enemy {
        constructor(scene, config) {
            this.scene = scene;
            this.imageKey = config.imageKey;
            this.x = config.x;
            this.y = config.y;
            this.size = config.size || 48;
            this.hitPoints = config.hitPoints || 1;
            // Create sprite first
            this.sprite = scene.physics.add.sprite(this.x, this.y, this.imageKey)
                .setDisplaySize(this.size, this.size);
            console.log("Created enemy: type " + this.imageKey + " at (" + this.x + ", " + this.y + ")");
            if (this.imageKey === 'boss') {
                this.sprite.setDepth(2); // Bosses get a higher depth so they are visible
            } else {
                this.sprite.setDepth(1);
            }
            
            // Add custom hitbox - different sizes for boss vs regular enemies
            const hitboxPercent = this.imageKey === 'boss' ? 0.8 : 0.6;
            const hitboxSize = this.size * hitboxPercent;
            this.sprite.body.setCircle(
                hitboxSize / 2,
                (this.size - hitboxSize) / 2,
                (this.size - hitboxSize) / 2
            );
            
            // Ensure firing delays are present
            this.minFireDelay = typeof config.minFireDelay === 'number' ? config.minFireDelay : 4000;
            this.maxFireDelay = typeof config.maxFireDelay === 'number' ? config.maxFireDelay : 8000;
            
            // Merge default weapon settings with any provided weaponConfig
            const weaponSettings = Object.assign(
                {
                    imageKey: 'enemy_projectile',
                    damage: 1,
                    projectileSpeed: 300,
                    collisionType: 'circle',
                    collisionRadius: COLLISION.ENEMY_PROJECTILE_RADIUS,
                    isEnemy: true,
                    minFireDelay: this.minFireDelay,
                    maxFireDelay: this.maxFireDelay,
                    multiShotCount: 1, // default is one shot
                    shotAngle: 0,
                    shotXOffset: 0
                },
                config.weaponConfig || {} // override defaults if provided
            );
            console.log("Enemy weapon config:", weaponSettings);
            this.weapon = new Weapon(scene, weaponSettings);
            this.weapon.owner = this.sprite;
            if (this.weapon.isEnemy) {
                this.weapon.startAutoFire();
            }
        }

        resetFiringState(baseTime) {
            // Reset next shot time based on provided time or current time
            const base = baseTime !== undefined ? baseTime : this.scene.time.now;
            this.nextShotTime = base + this.getRandomFireDelay();
        }

        getRandomFireDelay() {
            return Phaser.Math.Between(this.minFireDelay, this.maxFireDelay);
        }

        update() {
        }

        destroy() {
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
        constructor(scene, config = {}) {
            this.scene = scene;
            this.enemies = [];
            this.direction = 1; // 1 for right, -1 for left
            this.moveSpeed = config.moveSpeed || 100; // pixels per second
            this.padding = config.padding || 50; // padding from screen edges
            this.yOffset = config.yOffset || 0; // vertical offset for group movement
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

            // Calculate the next position before moving
            const moveAmount = this.moveSpeed * this.direction * (this.scene.game.loop.delta / 1000);
            const gameWidth = this.scene.sys.game.config.width;
            
            // Check if the next move would exceed boundaries
            if ((this.direction > 0 && (rightmost + moveAmount) >= gameWidth - this.padding) ||
                (this.direction < 0 && (leftmost + moveAmount) <= this.padding)) {
                // Change direction
                this.direction *= -1;
            }
            
            // Apply movement with the possibly updated direction
            const finalMoveAmount = this.moveSpeed * this.direction * (this.scene.game.loop.delta / 1000);
            this.enemies.forEach(enemy => {
                enemy.sprite.x += finalMoveAmount;
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
