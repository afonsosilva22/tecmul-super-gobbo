import { getText } from '../utils/text.js';

export class HowToPlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HowToPlayScene' });
    }

    create(data) {
        const text = (key) => getText(this, key);
        const returnScene = data?.returnScene ?? 'MainMenu';

        this.scene.bringToTop();
        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.add.text(320, 65, text('howToPlay'), {
            fontSize: '42px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'monospace',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5);

        const controls = [
            text('movementControls'),
            text('jumpClimbControls'),
            text('sprintControls'),
            text('swordControls')
        ];

        controls.forEach((controlText, index) => {
            this.add.text(320, 135 + index * 42, controlText, {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'monospace',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        });

        const createMenuButton = (x, y, buttonText, baseColor, hoverColor, onClickAction) => {
            const btnWidth = 200;
            const btnHeight = 45;

            const btnGraphics = this.add.graphics();
            btnGraphics.fillStyle(baseColor, 1);
            btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);

            const btnText = this.add.text(x, y, buttonText, {
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

        createMenuButton(320, 325, text('back'), 0xc0392b, 0xe74c3c, () => this.scene.start(returnScene));
    }
}
