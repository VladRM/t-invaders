import { Weapon } from './weapons.js';
import { SceneManager } from './sceneManager.js';
import { COLLISION } from './config.js';

export class Player {
        constructor(scene, config) {
            this.scene = scene;
            const gameWidth = scene.sys.game.config.width;
            const gameHeight = scene.sys.game.config.height;

            this.gameState = scene.gameState;
            this.playerSize = config.size || 64;
            this.lives = this.gameState.lives;
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
                collisionRadius: COLLISION.PROJECTILE_RADIUS
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
            this.gameState.lives = this.lives; // Update gameState lives
            if (this.livesDisplay.length > 0) {
                const iconToRemove = this.livesDisplay.pop();
                iconToRemove.destroy();
            }

            if (this.lives <= 0) {
                // Create a big explosion at the player's current location  
                const explosion = this.scene.add.sprite(this.sprite.x, this.sprite.y, 'explosion');
                explosion.setScale(2); // Adjust scale as needed for a big explosion  
                explosion.play('explode');  
                
                // Remove the player ship from the scene  
                this.sprite.destroy();  
                
                this.active = false;
            }

            return this.lives <= 0;
        }

        update(cursors, fireKey) {
            if (!this.active || !this.sprite || !this.sprite.body) return;
            
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
