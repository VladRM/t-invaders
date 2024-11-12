export class UI {
    static createButton(scene, x, y, text, onClick) {
        const button = scene.add.text(x, y, text, {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        });
        
        button.setOrigin(0.5);
        button.setInteractive({ useHandCursor: true })
            .on('pointerover', () => button.setStyle({ fill: '#ff0' }))
            .on('pointerout', () => button.setStyle({ fill: '#fff' }))
            .on('pointerdown', () => button.setStyle({ fill: '#0f0' }))
            .on('pointerup', () => {
                button.setStyle({ fill: '#ff0' });
                onClick();
            });

        return button;
    }

    static createMenu(scene, items) {
        const centerX = scene.cameras.main.centerX;
        const startY = scene.cameras.main.centerY - (items.length * 40);
        
        return items.map((item, index) => {
            return this.createButton(
                scene,
                centerX,
                startY + (index * 80),
                item.text,
                item.onClick
            );
        });
    }
}
