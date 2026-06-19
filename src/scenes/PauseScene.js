import { gameState } from '../state.js';
import { getText } from '../utils/text.js';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create(data) {
        const text = (key) => getText(this, key);
        const callerScene = data?.callerScene ?? 'GameScene';

        this.scene.bringToTop();
        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.add.text(320, 80, text('paused'), {
            fontSize: '42px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'monospace',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5);

        const createMenuButton = (x, y, text, baseColor, hoverColor, onClickAction, isPlaceholder = false) => {
            const btnWidth = 200;
            const btnHeight = 45;

            const btnGraphics = this.add.graphics();

            if (isPlaceholder) {
                btnGraphics.fillStyle(0x333333, 1);
                btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);

                this.add.text(x, y, text, {
                    fontSize: '18px',
                    fill: '#777777',
                    fontFamily: 'monospace',
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                return;
            }

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

        createMenuButton(320, 145, text('continue'), 0x27ae60, 0x2ecc71, () => {
            gameState.isPaused = false;
            this.scene.resume(callerScene);
            this.scene.stop();
        });
        createMenuButton(320, 200, text('options'), 0x2980b9, 0x3498db, () => this.scene.start('OptionsScene', { returnScene: 'PauseScene' }));
        createMenuButton(320, 255, text('howToPlay'), 0x2980b9, 0x3498db, () => this.scene.start('HowToPlayScene', { returnScene: 'PauseScene' }));
        createMenuButton(320, 310, text('quit'), 0xc0392b, 0xe74c3c, () => {
            gameState.isPaused = false;
            this.scene.stop(callerScene);
            this.scene.start('MainMenu');
        });
    }
}
