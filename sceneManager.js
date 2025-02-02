export class SceneManager {
    static instance = null;
    
    constructor() {
        if (SceneManager.instance) {
            return SceneManager.instance;
        }
        SceneManager.instance = this;
        
        // Remove the fixed scene flow since we're handling transitions explicitly
        this.isTransitioning = false;
    }

    static getInstance() {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }

    goToNextScene(currentScene) {
        if (this.isTransitioning) {
            // Ignore transition request - already transitioning
            return;
        }
        this.isTransitioning = true;

        const gameState = currentScene.gameState;
        const isWin = gameState.won;
        const currentSceneKey = currentScene.scene.key;
        console.log('[SceneManager] Starting transition from scene:', currentSceneKey, 'won:', isWin, 'gameState:', {
            currentLevel: gameState.currentLevel,
            lives: gameState.lives,
            won: gameState.won
        });
        
        currentScene.cameras.main.fadeOut(1000);
        currentScene.cameras.main.once('camerafadeoutcomplete', () => {
            const nextState = isWin ? 'win' : 'gameover';
            // Start the menu scene, passing state and gameState values
            // Stop any existing instance of SceneMenu so that parameters aren't lost
            currentScene.scene.stop('SceneMenu');
            currentScene.scene.start('SceneMenu', { state: nextState });
            
            this.isTransitioning = false;
        });
    }
}
