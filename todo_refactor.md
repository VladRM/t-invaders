# To Do: Code Refactoring Suggestions

Below are in-depth refactoring suggestions covering multiple aspects for improvements.

## 1. Collision Handling and Overlap Management
- **Issue:** Manual iteration over projectile groups and enemy groups using distance calculations and hard-coded collision radii.
- **Suggestions:**
  - Leverage Phaser’s built-in Arcade Physics overlap/collision mechanisms via physics.add.overlap() to handle:
    - Player projectiles vs. enemy sprites.
    - Enemy bullets vs. player sprite.
  - Centralize collision callbacks to handle explosion animations, damage, and projectile destruction, eliminating duplicate manual loops.

## 2. Centralize Explosion and Animation Logic
- **Issue:** Multiple instances of similar explosion creation and cleanup code are scattered across levels.
- **Suggestions:**
  - Create a helper function (e.g., createExplosion(scene, x, y, size)) or an Explosion class that encapsulates:
    - Sprite creation.
    - Display size adjustment.
    - One-time "animationcomplete" listener for cleanup.
  - Use the centralized logic across all collision events.

## 3. Reduce Duplication in Collision Geometry/Boundaries
- **Issue:** Magic numbers are used for collision radii and offsets for player, enemy, and projectiles.
- **Suggestions:**
  - Define constants (e.g., PLAYER_COLLISION_SCALE, ENEMY_COLLISION_SCALE, PROJECTILE_RADIUS) in a configuration file.
  - Replace hard-coded values with these constants for both sprite setup (using body.setCircle and body.setOffset) and in collision checks.

## 4. Consolidate Enemy and Weapon Firing Behavior
- **Issue:** Firing logic for enemies is scattered between Enemy and Weapon classes with inline delayedCall scheduling.
- **Suggestions:**
  - Encapsulate firing logic, including delay management, within the Weapon class.
  - Ensure proper cleanup by canceling any pending firing timers when an enemy is destroyed.
  - Streamline Enemy.destroy() to focus on sprite destruction while delegating weapon cleanup.

## 5. Modularize Background and Level Setup Code
- **Issue:** Both Level1 and Level2 contain almost identical code for creating and scrolling the background, along with enemy row creation.
- **Suggestions:**
  - Extract background tile creation and scrolling into a dedicated Background helper or class.
  - Consider creating a base Level scene (e.g., BaseLevelScene) that handles common functionality (background, collisions, common enemy behavior), with Level1 and Level2 extending this base class.
  - Centralize enemy row creation into the EnemyGroup class to reduce duplication.

## 6. Cleanup and Projectile Reuse
- **Issue:** Projectiles are created and destroyed frequently, and the cleanup logic is repeated across the Weapon class.
- **Suggestions:**
  - Implement object pooling for projectiles to enhance performance, reducing the overhead of constant creation/destruction.
  - Introduce a centralized cleanup method or a dedicated Projectile class that standardizes how projectiles are disabled, cleaned up, and reused.
  - Ensure collision callbacks and explosion handlers always invoke the centralized cleanup to avoid multiple processing of the same projectile.

## 7. Code Organization and Consistency
- **Issue:** Inconsistent use of magic numbers, varying code styles, and scattered singleton logic among GameState, SceneManager, and individual scenes.
- **Suggestions:**
  - Create a centralized constants module/file for magic numbers (fire delays, collision sizes, speeds, etc.) to make adjustments easier.
  - Standardize on modern ES6+ practices; use arrow functions where appropriate, and consistently use const/let.
  - Improve documentation and comments for each class and method, especially for complex logic around collisions, delayed calls, and cleanup.
  - Reassess the use of singletons (GameState, SceneManager) and consider an event-driven approach for scalability.
