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
            console.log('[SceneManager] Ignoring transition request - already transitioning');
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
            console.log('[SceneManager] Fade complete, transitioning to menu with state:', nextState);
            
            // Start the menu scene first
            currentScene.scene.start('SceneMenu', { state: nextState });
            
            // Then reset game state
            console.log('[SceneManager] Resetting game state after transition');
            gameState.reset();
            
            this.isTransitioning = false;
            console.log('[SceneManager] Transition complete, ready for next transition');
        });
    }
}
