class Enemy {
    constructor(scene, config) {
        this.scene = scene;
        this.imageKey = config.imageKey;
        this.x = config.x;
        this.y = config.y;
        this.size = config.size || 48;
        this.weapon = config.weapon;
        this.lastFired = 0;
        this.fireDelay = config.fireDelay || 2000; // Default 2 second cooldown
        
        this.sprite = scene.physics.add.sprite(this.x, this.y, this.imageKey)
            .setDisplaySize(this.size, this.size);
    }

    update() {
        // Handle weapon firing
        if (this.weapon && this.scene.time.now > this.lastFired + this.fireDelay) {
            this.weapon.fire(this.sprite.x, this.sprite.y);
            this.lastFired = this.scene.time.now;
        }
    }

    destroy() {
        this.sprite.destroy();
    }

    getSprite() {
        return this.sprite;
    }
}

class EnemyGroup {
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
