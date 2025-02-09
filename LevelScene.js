import { BaseLevelScene } from './baseLevelScene.js';
import { SceneManager } from './sceneManager.js';
import { EnemyGroup } from './enemies.js';
import { levelsConfig } from './levelsConfig.js';

export class LevelScene extends BaseLevelScene {
    constructor(config) {
        super({ key: config.key });
        this.levelConfig = config;
    }
    
    init(data) {
        super.init(data);
        console.log("LevelScene: init called with data:", data);
        // Use the levelKey from data if available; otherwise, use gameState.currentLevel to determine which level to load.
        // Use the provided levelKey or default to "Level" + current level.
        const levelKey = (data && data.levelKey) ? data.levelKey : ("Level" + this.gameState.currentLevel);
        console.log("LevelScene: Using levelKey =", levelKey);
        // Find the config that has the matching 'key' property
        this.levelConfig = Object.values(levelsConfig).find(cfg => cfg.key === levelKey) || levelsConfig.level0;
        console.log("LevelScene: Level config set to:", this.levelConfig);
        if (!this.levelConfig) {
            console.error("LevelScene: No level configuration found for key:", levelKey);
        }
    }

    create() {
        console.log("LevelScene: create method entered.");
        super.createCommonElements();
        
        const gameWidth = this.sys.game.config.width;
        
        if (this.levelConfig.enemyGroups) {
            console.log("LevelScene: Processing enemy groups:", this.levelConfig.enemyGroups);
            // Process multiple enemy groups from config
            const groups = [];
            this.levelConfig.enemyGroups.forEach(groupConfig => {
                const enemyGroup = new EnemyGroup(this, groupConfig.config || {});
                groupConfig.enemyRows.forEach(rowConfig => {
                    const spacingExpr = typeof rowConfig.spacing === 'string' ? rowConfig.spacing.trim() : "";
                    const spacing = typeof rowConfig.spacing === 'string'
                        ? eval(spacingExpr.replace('gameWidth', gameWidth))
                        : rowConfig.spacing;
                    let startX;
                    if (typeof rowConfig.startX === 'string') {
                        const startXExpr = rowConfig.startX.trim();
                        startX = eval(startXExpr.replace('gameWidth', gameWidth));
                    } else if (typeof rowConfig.startX === 'number') {
                        startX = rowConfig.startX;
                    } else {
                        startX = (gameWidth - (spacing * (rowConfig.count - 1))) / 2;
                    }
                    
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
            console.log("LevelScene: Using legacy enemyRows configuration");
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
    this.cameras.main.fadeIn(500, 0, 0, 0);
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
            console.log("triggerTransition: starting scene with levelKey:", nextLevelKey);
            this.scene.start(nextLevelKey, { levelKey: nextLevelKey });
        });
    }
}
