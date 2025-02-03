# Space Shooter Game Technical Specification

## Functional Overview
A 2D side-scrolling space shooter game with:
- Progressive difficulty across multiple levels
- Player ship with lives system and upgradable weapons
- Diverse enemy types with attack patterns
- Persistent high scores and game state
- Collision detection and particle effects
- Responsive UI with menu systems

## Key Technical Components

### 1. Game Architecture
- Built with Phaser 3 framework
- Scene-based state management:
  ```javascript
  export class SceneManager {
    static getInstance() {
      if (!SceneManager.instance) {
        SceneManager.instance = new SceneManager();
      }
      return SceneManager.instance;
    }
  }
  ```
- Singleton game state persistence:
  ```javascript
  export class GameState {
    reset() {
      this.score = 0;
      this.highScore = localStorage.getItem('highScore') || 0;
      this.currentLevel = 1;
      this.lives = 3;
      this.won = false;
    }
  }
  ```

### 2. Core Game Systems
- **Physics & Collision**:
  - Circle-based collision detection
  - Projectile management with object pooling
  ```javascript
  checkCollision(obj1, obj2, radius1, radius2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy) < (radius1 + radius2);
  }
  ```

- **Enemy AI System**:
  - Configurable spawn patterns
  - Adaptive firing algorithms
  ```javascript
  resetFiringState(baseTime) {
    const base = baseTime !== undefined ? baseTime : this.scene.time.now;
    this.nextShotTime = base + this.getRandomFireDelay();
  }
  ```

### 3. Asset Management
- Image assets organized by type:
  ```
  assets/
    img/
      enemies/
      player/
      space/
  ```
- Animation definitions for explosions and effects

### 4. Configuration System
- Centralized game constants:
  - COLLISION radii
  - EXPLOSION sizes
  - SCROLL speeds
  - UI positions

### 5. Scene Hierarchy
1. MenuScene - Main menu and game over screens
2. Level1 - Introductory level with basic enemies
3. Level2 - Advanced level with boss encounters

### Dependencies
- Phaser 3.55+
- Webpack/Babel for bundling
- Browser-local storage

### Build & Run
```bash
npm install
npm start
