import { Weapon } from './weapons.js';

export class Enemy {
        constructor(scene, config) {
            this.scene = scene;
            this.imageKey = config.imageKey;
            this.x = config.x;
            this.y = config.y;
            this.size = config.size || 48;
            this.lastFired = 0;
            this.minFireDelay = config.minFireDelay || 4000;
            this.maxFireDelay = config.maxFireDelay || 8000;
            this.nextFireDelay = this.getRandomFireDelay();

            // Create a new weapon instance for this enemy
            this.weapon = new Weapon(scene, {
                imageKey: 'enemy_projectile',
                damage: 1,
                fireDelay: this.nextFireDelay,
                projectileSpeed: 300,
                collisionType: 'circle',
                collisionRadius: 5
            });

            this.sprite = scene.physics.add.sprite(this.x, this.y, this.imageKey)
                .setDisplaySize(this.size, this.size);
        }

        getRandomFireDelay() {
            return Phaser.Math.Between(this.minFireDelay, this.maxFireDelay);
        }

        update() {
            // Handle weapon firing
            if (this.weapon && this.scene.time.now > this.lastFired + this.nextFireDelay) {
                this.weapon.fire(this.sprite.x, this.sprite.y);
                this.lastFired = this.scene.time.now;
                // Set new random delay for next shot
                this.nextFireDelay = this.getRandomFireDelay();
            }
        }

        destroy() {
            this.sprite.destroy();
        }

        getSprite() {
            return this.sprite;
        }
    }

export class EnemyGroup {
        constructor(scene) {
            this.scene = scene;
            this.enemies = [];
        }

        createEnemyRow(config) {
            const { count, spacing, startX, y, enemyConfig } = config;

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
            this.enemies.forEach(enemy => enemy.update());
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
    }
