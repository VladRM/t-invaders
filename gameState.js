export class GameState {
    static instance = null;
    
    constructor() {
        if (GameState.instance) {
            return GameState.instance;
        }
        GameState.instance = this;
        
        // Initialize default values
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.currentLevel = 1;
        this.lives = 3;
        this.won = false;
        
        // Ensure we're properly initialized
        this.reset();
    }

    reset() {
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.currentLevel = 1;
        this.lives = 3;  // Reset lives here instead
        this.won = false; // Critical addition
    }

    static getInstance() {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }
}
