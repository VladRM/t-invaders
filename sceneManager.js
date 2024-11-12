export class SceneManager {
    static instance = null;
    
    constructor() {
        if (SceneManager.instance) {
            return SceneManager.instance;
        }
        SceneManager.instance = this;
        
        this.sceneFlow = {
            'SceneStart': 'Level1',
            'Level1': 'Level2',
            'Level2': 'SceneWin',
            'SceneWin': 'Level1',
            'SceneGameOver': 'SceneStart'
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
            currentScene.scene.start(nextSceneKey);
        } else {
            console.warn(`No next scene defined for ${currentScene.scene.key}`);
        }
    }
}
