export function createExplosion(scene, x, y, explosionSize) {
    // Create the explosion sprite at the given coordinates
    const explosion = scene.add.sprite(x, y, 'explosion');
    explosion.setDisplaySize(explosionSize, explosionSize);
    
    // When the animation completes, destroy the explosion sprite
    explosion.on('animationcomplete', () => {
        explosion.destroy();
    });

    // Play the explosion animation with specific config
    explosion.play({ 
        key: 'explode',
        frameRate: 20,
        repeat: 0
    });
    
    return explosion;
}
