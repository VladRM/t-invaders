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
        const nextSceneKey = this.sceneFlow[currentScene.scene.key];
        if (nextSceneKey) {
            // Always use fade transition
            currentScene.cameras.main.fadeOut(1000);
            currentScene.cameras.main.once('camerafadeoutcomplete', () => {
                if (nextSceneKey === 'SceneMenu') {
                    // If going to menu from a level, it's game over
                    const state = currentScene.gameState?.won ? 'win' : 'gameover';
                    currentScene.scene.start(nextSceneKey, { state });
                } else {
                    currentScene.scene.start(nextSceneKey);
                }
            });
        } else {
            console.warn(`No next scene defined for ${currentScene.scene.key}`);
        }
    }
}
