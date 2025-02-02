export function createExplosion(scene, x, y, explosionSize) {
    // Create the explosion sprite at the given coordinates
    const explosion = scene.add.sprite(x, y, 'explosion');
    explosion.setDisplaySize(explosionSize, explosionSize);
    
    // Play the explosion animation (assumes the animation 'explode' is defined)
    explosion.play('explode');
    
    // When the animation completes, destroy the explosion sprite
    explosion.on('animationcomplete', () => {
        explosion.destroy();
    });
}
