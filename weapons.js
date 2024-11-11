class Weapon {
    constructor(scene, config) {
        this.scene = scene;
        this.imageKey = config.imageKey;
        this.damage = config.damage || 1;
        this.fireDelay = config.fireDelay || 200;
        this.projectileSpeed = config.projectileSpeed || -400;
        this.lastFired = 0;
        
        // Create projectile group with circular hit detection
        this.projectiles = scene.physics.add.group({
            createCallback: (projectile) => {
                projectile.body.setCircle(10);
                projectile.body.setOffset((projectile.width - 20) / 2, (projectile.height - 20) / 2);
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
            }
        });
    }

    getProjectileGroup() {
        return this.projectiles;
    }
}
