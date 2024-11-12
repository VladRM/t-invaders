class Weapon {
    constructor(scene, config) {
        this.scene = scene;
        this.imageKey = config.imageKey;
        this.damage = config.damage || 1;
        this.fireDelay = config.fireDelay || 200;
        this.projectileSpeed = config.projectileSpeed || -400;
        this.lastFired = 0;
        
        // Store collision config
        this.collisionType = config.collisionType || 'circle';
        this.collisionWidth = config.collisionWidth;
        this.collisionHeight = config.collisionHeight;
        this.collisionRadius = config.collisionRadius;
        
        // Create projectile group with configured hit detection
        this.projectiles = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            createCallback: (projectile) => {
                projectile.setActive(true);
                projectile.setVisible(true);
                if (this.collisionType === 'circle') {
                    const radius = this.collisionRadius || projectile.width / 2;
                    projectile.body.setCircle(radius);
                    // Center the circle collision body
                    projectile.body.setOffset(
                        (projectile.width - radius * 2) / 2,
                        (projectile.height - radius * 2) / 2
                    );
                } else if (this.collisionType === 'rectangle') {
                    const width = this.collisionWidth || projectile.width;
                    const height = this.collisionHeight || projectile.height;
                    projectile.body.setSize(width, height);
                    // Center the rectangle collision body
                    projectile.body.setOffset(
                        (projectile.width - width) / 2,
                        (projectile.height - height) / 2
                    );
                }
            }
        });
    }

    fire(x, y) {
        if (this.scene.time.now > this.lastFired + this.fireDelay) {
            const projectile = this.projectiles.create(x, y, this.imageKey);
            projectile.setVelocityY(this.projectileSpeed);
            this.lastFired = this.scene.time.now;
            return true;
        }
        return false;
    }

    cleanup() {
        this.projectiles.children.each((projectile) => {
            if (projectile.y < -projectile.height) {
                projectile.destroy();
                this.projectiles.remove(projectile, true, true);
            }
        });
    }

    destroyProjectile(projectile) {
        projectile.destroy();
        this.projectiles.remove(projectile, true, true);
    }

    getProjectileGroup() {
        return this.projectiles;
    }
}
