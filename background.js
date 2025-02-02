export function createBackground(scene, scrollSpeed = 1) {
    const gameWidth = scene.sys.game.config.width;
    const gameHeight = scene.sys.game.config.height;
    const bgTexture = scene.textures.get('background');
    const bgWidth = bgTexture.getSourceImage().width;
    const bgHeight = bgTexture.getSourceImage().height;
    
    const tilesX = Math.ceil(gameWidth / bgWidth) + 1;
    const tilesY = Math.ceil(gameHeight / bgHeight) + 1;
    const bgTiles = [];
    
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            const bg = scene.add.image(x * bgWidth, y * bgHeight, 'background');
            bg.setOrigin(0, 0);
            bg.setAlpha(0.75);
            bgTiles.push(bg);
        }
    }
    return { bgTiles, scrollSpeed };
}

export function updateBackground(scene, bgTiles, scrollSpeed) {
    const bgHeight = scene.textures.get('background').getSourceImage().height;
    bgTiles.forEach(bg => {
        bg.y += scrollSpeed;
        if (bg.y >= scene.sys.game.config.height) {
            bg.y = -bgHeight;
        }
    });
}
