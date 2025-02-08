import { BaseLevelScene } from './baseLevelScene.js';
import { SceneManager } from './sceneManager.js';

export class LevelScene extends BaseLevelScene {
    constructor(levelConfig) {
        super({ key: levelConfig.key });
        this.levelConfig = levelConfig;
    }

    create() {
        super.createCommonElements();
        
        const gameWidth = this.sys.game.config.width;
        
        // Create enemy rows from config
        this.levelConfig.enemyRows.forEach(rowConfig => {
            const spacing = typeof rowConfig.spacing === 'string' ? 
                eval(rowConfig.spacing.replace('gameWidth', gameWidth)) : 
                rowConfig.spacing;
            const startX = (gameWidth - (spacing * (rowConfig.count - 1))) / 2;
            
            this.enemyGroup.createEnemyRow({
                ...rowConfig,
                startX: startX,
                enemyConfig: {
                    ...rowConfig.enemyConfig,
                    isEnemy: true
                }
            });
        });
    }

    handleEnemyDefeated() {
        // Add a small delay before checking if all enemies are defeated
        this.time.delayedCall(100, () => {
            if (this.enemyGroup.enemies.length === 0) {
                this.triggerTransition();
            }
        });
    }

    triggerTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.gameState.won = true;
        this.gameState.currentLevel++;
        
        const nextLevel = this.levelConfig.nextLevel;
        if (!nextLevel) {
            // Game complete - fade out and transition to win screen
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                SceneManager.getInstance().goToNextScene(this);
            });
            return;
        }

        // Normal level transition
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(nextLevel);
        });
    }
}
