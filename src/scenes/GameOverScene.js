import { getText } from '../utils/text.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const text = (key) => getText(this, key);

        this.scene.bringToTop();
        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.add.text(320, 80, text('gameOver'), {
            fontSize: '42px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'monospace',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5);

        const createMenuButton = (x, y, text, baseColor, hoverColor, onClickAction) => {
            const btnWidth = 200;
            const btnHeight = 45;

            const btnGraphics = this.add.graphics();
            btnGraphics.fillStyle(baseColor, 1);
            btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);

            const btnText = this.add.text(x, y, text, {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'monospace',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            btnGraphics.setDepth(0);
            btnText.setDepth(1);

            this.add.zone(x, y, btnWidth, btnHeight)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', onClickAction)
                .on('pointerover', () => {
                    btnGraphics.clear();
                    btnGraphics.fillStyle(hoverColor, 1);
                    btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
                    btnText.setStyle({ fill: '#000000' });
                })
                .on('pointerout', () => {
                    btnGraphics.clear();
                    btnGraphics.fillStyle(baseColor, 1);
                    btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
                    btnText.setStyle({ fill: '#ffffff' });
                });
        };

        createMenuButton(320, 175, text('restart'), 0x27ae60, 0x2ecc71, () => this.scene.start('GameScene'));
        createMenuButton(320, 235, text('mainMenu'), 0xc0392b, 0xe74c3c, () => this.scene.start('MainMenu'));
    }
}
