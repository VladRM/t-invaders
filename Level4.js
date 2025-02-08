import { LevelScene } from './LevelScene.js';
import { EnemyGroup } from './enemies.js';

export class Level4 extends LevelScene {
    constructor() {
        super({
            key: 'Level4',
            nextLevel: null  // This is the final level
        });
    }

    create() {
        super.createCommonElements();
        
        const gameWidth = this.sys.game.config.width;
        
        // Create first boss group
        const bossGroup1 = new EnemyGroup(this, { moveSpeed: 75, yOffset: 100 });
        bossGroup1.createEnemyRow({
            count: 2,
            spacing: gameWidth / 2,
            startX: gameWidth / 4,
            y: 100,
            enemyConfig: {
                imageKey: 'boss',
                size: 128,
                hitPoints: 5,
                weaponConfig: {
                    multiShotCount: 3,
                    shotAngle: 15,
                    minFireDelay: 2000,
                    maxFireDelay: 4000
                }
            }
        });
        this.enemyGroups.push(bossGroup1);

        // Create small enemies group
        const smallGroup = new EnemyGroup(this, { moveSpeed: 150, yOffset: 250 });
        smallGroup.createEnemyRow({
            count: 7,
            spacing: 80,
            startX: (gameWidth - (80 * 6)) / 2,  // Center the row
            y: 250,
            enemyConfig: {
                imageKey: 'enemy',
                size: 48,
                hitPoints: 1,
                weaponConfig: {
                    multiShotCount: 1,
                    minFireDelay: 3000,
                    maxFireDelay: 6000
                }
            }
        });
        this.enemyGroups.push(smallGroup);
    }

    handleEnemyDefeated() {
        // Check if all groups are empty
        const allDefeated = this.enemyGroups.every(group => group.enemies.length === 0);
        if (allDefeated) {
            this.triggerTransition();
        }
    }
}
