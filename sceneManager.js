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
        gameState.reset(); // Ensure fresh state
        
        currentScene.cameras.main.fadeOut(1000);
        currentScene.cameras.main.once('camerafadeoutcomplete', () => {
            currentScene.scene.start('SceneMenu', {
                state: gameState.lives > 0 ? 'win' : 'gameover'
            });
        });
    }
}
