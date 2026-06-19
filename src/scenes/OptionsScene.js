import { gameState } from '../state.js';
import { getText } from '../utils/text.js';
import { setEffectsVolume, setMusicVolume } from '../utils/audio.js';

export class OptionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OptionsScene' });
    }

    create(data) {
        const text = (key) => getText(this, key);
        const returnScene = data?.returnScene ?? 'MainMenu';

        this.scene.bringToTop();
        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.add.text(320, 65, text('options'), {
            fontSize: '42px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'monospace',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5);

        this.add.text(170, 115, text('language'), {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const createMenuButton = (x, y, buttonText, baseColor, hoverColor, onClickAction, btnWidth = 200, btnHeight = 38, fontSize = '16px') => {

            const btnGraphics = this.add.graphics();
            btnGraphics.fillStyle(baseColor, 1);
            btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);

            const btnText = this.add.text(x, y, buttonText, {
                fontSize,
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

        const createLanguageButton = (y, language, labelKey) => {
            const isSelected = gameState.language === language;
            const baseColor = isSelected ? 0x27ae60 : 0x2980b9;
            const hoverColor = isSelected ? 0x2ecc71 : 0x3498db;

            createMenuButton(170, y, text(labelKey), baseColor, hoverColor, () => {
                gameState.language = language;
                this.scene.restart({ returnScene });
            }, 170, 34, '14px');
        };

        const createVolumeControl = (y, labelKey, value, onChange) => {
            this.add.text(455, y, `${Math.round(value * 100)}%`, {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'monospace',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(455, y - 36, text(labelKey), {
                fontSize: '22px',
                fill: '#ffffff',
                fontFamily: 'monospace',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            createMenuButton(390, y, '-', 0x333333, 0x777777, () => {
                onChange(-0.1);
                this.scene.restart({ returnScene });
            }, 40, 34, '20px');

            createMenuButton(520, y, '+', 0x333333, 0x777777, () => {
                onChange(0.1);
                this.scene.restart({ returnScene });
            }, 40, 34, '20px');
        };

        createLanguageButton(150, 'en', 'english');
        createLanguageButton(190, 'pt', 'portuguese');
        createLanguageButton(230, 'es', 'spanish');
        createLanguageButton(270, 'fr', 'french');
        createVolumeControl(170, 'music', gameState.musicVolume, (amount) => setMusicVolume(gameState.musicVolume + amount));
        createVolumeControl(255, 'effects', gameState.effectsVolume, (amount) => setEffectsVolume(gameState.effectsVolume + amount));
        createMenuButton(320, 327, text('back'), 0xc0392b, 0xe74c3c, () => this.scene.start(returnScene));
    }
}
