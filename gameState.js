class GameState {
    static instance = null;
    
    constructor() {
        if (GameState.instance) {
            return GameState.instance;
        }
        GameState.instance = this;
        this.reset();
    }

    reset() {
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.currentLevel = 1;
    }

    static getInstance() {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }
}
