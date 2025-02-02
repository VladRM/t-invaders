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
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const gameState = currentScene.gameState;
        const isWin = gameState.won;
        console.log('[SceneManager] Starting transition, won:', isWin);
        
        currentScene.cameras.main.fadeOut(1000);
        currentScene.cameras.main.once('camerafadeoutcomplete', () => {
            const nextState = isWin ? 'win' : 'gameover';
            console.log('[SceneManager] Fade complete, transitioning to menu with state:', nextState);
            
            // Start the menu scene and then reset game state
            currentScene.scene.start('SceneMenu', { state: nextState });
            gameState.reset();
            this.isTransitioning = false;
        });
    }
}
