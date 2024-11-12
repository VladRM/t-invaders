import { Weapon } from './weapons.js';

export class Player {
        constructor(scene, config) {
            this.scene = scene;
            const gameWidth = scene.sys.game.config.width;
            const gameHeight = scene.sys.game.config.height;

            this.playerSize = config.size || 64;
            this.lives = config.lives || 3;
            this.active = true;

            // Create player sprite
            this.sprite = scene.physics.add.sprite(
                gameWidth / 2,
                gameHeight - this.playerSize,
                'player'
            ).setDisplaySize(this.playerSize, this.playerSize);

            // Set collision bounds
            this.sprite.setCollideWorldBounds(true);

            // Initialize weapon
            this.weapon = new Weapon(scene, {
                imageKey: 'projectile',
                damage: 1,
                fireDelay: 200,
                projectileSpeed: -400,
                collisionType: 'circle',
                collisionRadius: 10
            });

            // Create lives display
            this.livesDisplay = [];
            this.createLivesDisplay();
        }

        createLivesDisplay() {
            const gameWidth = this.scene.sys.game.config.width;
            const gameHeight = this.scene.sys.game.config.height;
            const iconSize = 24;
            const padding = 8;

            // Clear existing display
            this.livesDisplay.forEach(icon => icon.destroy());
            this.livesDisplay = [];

            // Create new icons
            for (let i = 0; i < this.lives; i++) {
                const lifeIcon = this.scene.add.image(
                    gameWidth - (iconSize / 2 + padding) - (i * (iconSize + padding)),
                    gameHeight - (iconSize / 2 + padding),
                    'player'
                ).setDisplaySize(iconSize, iconSize);
                this.livesDisplay.push(lifeIcon);
            }
        }

        damage() {
            this.lives--;
            if (this.livesDisplay.length > 0) {
                const iconToRemove = this.livesDisplay.pop();
                iconToRemove.destroy();
            }

            if (this.lives <= 0) {
                this.active = false;
                this.sprite.setActive(false);
            }

            return this.lives <= 0;
        }

        update(cursors, fireKey) {
            // Handle movement
            if (cursors.left.isDown) {
                this.sprite.setVelocityX(-160);
            } else if (cursors.right.isDown) {
                this.sprite.setVelocityX(160);
            } else {
                this.sprite.setVelocityX(0);
            }

            // Handle weapon firing
            if (fireKey.isDown) {
                this.weapon.fire(this.sprite.x, this.sprite.y);
            }

            // Clean up projectiles
            this.weapon.cleanup();
        }

        getSprite() {
            return this.sprite;
        }

        getWeapon() {
            return this.weapon;
        }
    }
