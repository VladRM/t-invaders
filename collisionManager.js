import { COLLISION, EXPLOSION } from './config.js';
import { createExplosion } from './explosion.js';
import { SceneManager } from './sceneManager.js';

export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    checkCollision(obj1, obj2, radius1, radius2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy) < (radius1 + radius2);
    }

    handlePlayerProjectileCollisions(player, enemyGroups) {
        if (!player.getWeapon()) return;

        const projectiles = player.getWeapon().getProjectileGroup().getChildren();
        projectiles.forEach(projectile => {
            if (!projectile.active) return;
            
            enemyGroups.forEach(group => {
                group.getSprites().forEach(enemySprite => {
                    if (!enemySprite.active) return;
                    
                    const enemyRadius = enemySprite.texture.key === 'boss'
                        ? COLLISION.ENEMY_RADIUS
                        : COLLISION.ENEMY_RADIUS * 0.6;

                    if (this.checkCollision(projectile, enemySprite, COLLISION.PROJECTILE_RADIUS, enemyRadius)) {
                        createExplosion(this.scene, projectile.x, projectile.y, EXPLOSION.SMALL.size);
                        player.getWeapon().destroyProjectile(projectile);
                        
                        const enemy = group.enemies.find(e => e.sprite === enemySprite);
                        if (enemy) {
                            enemy.hitPoints--;
                            if (enemy.hitPoints <= 0) {
                                enemySprite.active = false;
                                if (enemySprite.body) {
                                    enemySprite.body.enable = false;
                                }
                                    
                                const explosionSize = enemy.sprite.texture.key === 'boss' ? 
                                    EXPLOSION.BIG.size : EXPLOSION.SMALL.size;
                                createExplosion(this.scene, enemySprite.x, enemySprite.y, explosionSize);
                                
                                this.scene.tweens.add({
                                    targets: enemySprite,
                                    alpha: 0,
                                    duration: 250,
                                    ease: 'Power1',
                                    onComplete: () => {
                                        group.removeEnemy(enemySprite);
                                        this.scene.handleEnemyDefeated();
                                    }
                                });
                            }
                        }
                    }
                });
            });
        });
    }

    handleEnemyProjectileCollisions(player, enemyGroups, gameState) {
        if (!enemyGroups || !player) return;
        
        enemyGroups.forEach(group => {
            group.enemies.forEach(enemy => {
                enemy.weapon.getProjectileGroup().getChildren().forEach(projectile => {
                    if (!projectile.active || !player.getSprite().active) return;
                    
                    if (this.checkCollision(
                        projectile, 
                        player.getSprite(), 
                        COLLISION.ENEMY_PROJECTILE_RADIUS, 
                        COLLISION.PLAYER_RADIUS
                    )) {
                        createExplosion(this.scene, projectile.x, projectile.y, EXPLOSION.SMALL.size);
                        enemy.weapon.destroyProjectile(projectile);
                        
                        const isGameOver = player.damage();
                        if (isGameOver && !this.scene.isTransitioning) {
                            this.scene.isTransitioning = true;
                            gameState.won = false;
                            SceneManager.getInstance().goToNextScene(this.scene);
                        }
                    }
                });
            });
        });
    }
}
