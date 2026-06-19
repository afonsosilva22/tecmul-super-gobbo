import { getText } from '../utils/text.js';
import { assetPath } from '../utils/assets.js';
import { loadGameAudio, playBackgroundMusic } from '../utils/audio.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' }); // Define a chave identificadora desta cena
    }

    preload() {
        this.load.json('strings', assetPath('assets/strings.json'));
        loadGameAudio(this);
    }

    create() {
        const text = (key) => getText(this, key);

        playBackgroundMusic(this);
        this.input.once('pointerdown', () => playBackgroundMusic(this));

        // Altera a cor de fundo apenas para o ecrã do menu
        this.cameras.main.setBackgroundColor('#1a1a1a'); 

        // Adiciona o título do jogo centralizado com um estilo mais polido
        this.add.text(320, 80, text('title'), { 
            fontSize: '42px', 
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'monospace', 
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 2, fill: true } 
        }).setOrigin(0.5);

        // --- FUNÇÃO AUXILIAR PARA CRIAR BOTÕES MODERNOS ---
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

            const clickZone = this.add.zone(x, y, btnWidth, btnHeight)
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

        createMenuButton(320, 160, text('play'), 0x27ae60, 0x2ecc71, () => this.scene.start('GameScene'));
        createMenuButton(320, 215, text('options'), 0x2980b9, 0x3498db, () => this.scene.start('OptionsScene', { returnScene: 'MainMenu' }));
        createMenuButton(320, 270, text('howToPlay'), 0x2980b9, 0x3498db, () => this.scene.start('HowToPlayScene', { returnScene: 'MainMenu' }));
        createMenuButton(320, 325, text('quit'), 0xc0392b, 0xe74c3c, () => alert(text('quitMessage')));
    }
}
