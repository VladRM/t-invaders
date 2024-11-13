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
        // Handle game over state
        if (!currentScene.gameState?.won) {
            currentScene.cameras.main.fadeOut(1000);
            currentScene.cameras.main.once('camerafadeoutcomplete', () => {
                currentScene.scene.start('SceneMenu', { state: 'gameover' });
            });
            return;
        }

        // Handle normal progression
        const nextSceneKey = this.sceneFlow[currentScene.scene.key];
        console.log('Next scene key:', nextSceneKey); // Debug log
        
        if (nextSceneKey) {
            currentScene.cameras.main.fadeOut(1000);
            currentScene.cameras.main.once('camerafadeoutcomplete', () => {
                const state = nextSceneKey === 'SceneMenu' && currentScene.gameState?.won ? 'win' : undefined;
                console.log('Transitioning to:', nextSceneKey, 'with state:', state); // Debug log
                currentScene.scene.stop();  // Stop the current scene first
                currentScene.scene.start(nextSceneKey, { state: state });
                if (nextSceneKey !== 'SceneMenu') {
                    currentScene.cameras.main.fadeIn(1000);
                }
            });
        } else {
            console.warn(`No next scene defined for ${currentScene.scene.key}`);
        }
    }
}
