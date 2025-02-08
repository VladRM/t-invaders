import { BaseLevelScene } from './baseLevelScene.js';
import { SceneManager } from './sceneManager.js';
import { EnemyGroup } from './enemies.js';
import { levelsConfig } from './levelsConfig.js';

export class LevelScene extends BaseLevelScene {
    constructor() {
        super({ key: 'Level1' });
    }
    
    init(data) {
        super.init(data);
        // Use the config passed in via scene.start, or default to level0 if none provided
        this.levelConfig = (data && data.key) ? data : levelsConfig.level0;
    }

    create() {
        super.createCommonElements();
        
        const gameWidth = this.sys.game.config.width;
        
        if (this.levelConfig.enemyGroups) {
            // Process multiple enemy groups from config
            const groups = [];
            this.levelConfig.enemyGroups.forEach(groupConfig => {
                const enemyGroup = new EnemyGroup(this, groupConfig.config || {});
                groupConfig.enemyRows.forEach(rowConfig => {
                    const spacingExpr = typeof rowConfig.spacing === 'string' ? rowConfig.spacing.trim() : "";
                    const spacing = typeof rowConfig.spacing === 'string'
                        ? eval(spacingExpr.replace('gameWidth', gameWidth))
                        : rowConfig.spacing;
                    const startXExpr = rowConfig.startX.trim();
                    let startX = typeof rowConfig.startX === 'string'
                        ? eval(startXExpr.replace('gameWidth', gameWidth))
                        : (rowConfig.startX || ((gameWidth - (spacing * (rowConfig.count - 1))) / 2));
                    
                    // Ensure values are numbers
                    const numSpacing = Number(spacing);
                    let numStartX = Number(startX);
                    
                    
                    
                    
                    if (isNaN(numStartX)) {
                        numStartX = (gameWidth - (numSpacing * (rowConfig.count - 1))) / 2;
                    }
                    
                    enemyGroup.createEnemyRow({
                        ...rowConfig,
                        spacing: numSpacing,
                        y: rowConfig.y + (groupConfig.config.yOffset || 0),
                        startX: numStartX,
                        enemyConfig: {
                            ...rowConfig.enemyConfig,
                            isEnemy: true
                        }
                    });
                    
                });
                groups.push(enemyGroup);
                
            });
            this.enemyGroups = groups;
            
        } else if (this.levelConfig.enemyRows) {
            // Fallback for previous config structure using a single enemy group
            this.enemyGroup = new EnemyGroup(this, {});
            this.enemyGroups.push(this.enemyGroup);

            this.levelConfig.enemyRows.forEach(rowConfig => {
                const spacing = typeof rowConfig.spacing === 'string' ? 
                    eval(rowConfig.spacing.replace('gameWidth', gameWidth)) : rowConfig.spacing;
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
    }

    handleEnemyDefeated() {
        // Add a small delay before checking if all enemies are defeated
        this.time.delayedCall(100, () => {
            if (this.enemyGroups.every(group => group.enemies.length === 0)) {
                this.triggerTransition();
            }
        });
    }

    triggerTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.gameState.won = true;
        this.gameState.currentLevel++;
        console.log("triggerTransition: current level config:", this.levelConfig);
        console.log("triggerTransition: nextLevelKey: " + this.levelConfig.nextLevel);

        const nextLevelKey = this.levelConfig.nextLevel;
        if (!nextLevelKey) {
            // Game complete - let SceneManager handle the transition
            SceneManager.getInstance().goToNextScene(this);
            return;
        }

        // Normal level transition
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            const nextLevelConfig = levelsConfig[nextLevelKey.toLowerCase()];
            console.log("triggerTransition: nextLevelConfig:", nextLevelConfig);
            if (nextLevelConfig) {
                this.scene.start(nextLevelConfig.key, nextLevelConfig);
            } else {
                console.error("Next level config not found for key:", nextLevelKey);
            }
        });
    }
}
