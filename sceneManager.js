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
            if (nextSceneKey === 'SceneMenu') {
                currentScene.cameras.main.fadeOut(1000);
                currentScene.cameras.main.once('camerafadeoutcomplete', () => {
                    currentScene.scene.start(nextSceneKey, { state: 'win' });
                });
            } else {
                // Direct transition for levels
                currentScene.scene.start(nextSceneKey);
            }
        } else {
            console.warn(`No next scene defined for ${currentScene.scene.key}`);
        }
    }
}
