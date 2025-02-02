export class SceneManager {
    static instance = null;
    
    constructor() {
        if (SceneManager.instance) {
            return SceneManager.instance;
        }
        SceneManager.instance = this;
        
        this.sceneFlow = {
            'SceneMenu': 'Level1',
            'Level1': 'Level2',
            'Level2': 'SceneMenu'
        };
    }

    static getInstance() {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }

    goToNextScene(currentScene) {
        const gameState = currentScene.gameState;
        const isWin = gameState.won;  // Store win state before reset
        console.log('[SceneManager] Before reset - GameState won:', gameState.won, 'isWin:', isWin);
        gameState.reset(); // Ensure fresh state
        console.log('[SceneManager] After reset - GameState won:', gameState.won, 'isWin:', isWin);
        
        currentScene.cameras.main.fadeOut(1000);
        currentScene.cameras.main.once('camerafadeoutcomplete', () => {
            const nextState = isWin ? 'win' : 'gameover';
            console.log('[SceneManager] Transitioning to SceneMenu with state:', nextState);
            currentScene.scene.start('SceneMenu', {
                state: nextState
            });
        });
    }
}
