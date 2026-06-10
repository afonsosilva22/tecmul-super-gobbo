const gameState = {}

// ============================================================================
// NOVO: CLASSE PARA O MENU PRINCIPAL DO JOGO
// ============================================================================
class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' }); // Define a chave identificadora desta cena
    }

    create() {
        // Altera a cor de fundo apenas para o ecrã do menu
        this.cameras.main.setBackgroundColor('#1a1a1a'); // Um cinzento ligeiramente mais escuro para dar contraste

        // Adiciona o título do jogo centralizado com um estilo mais polido
        this.add.text(320, 80, 'SUPER GOBBO', { 
            fontSize: '42px', 
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'monospace', // Fonte que combina mais com estilo pixel/retro
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 2, fill: true } // Sombra no título
        }).setOrigin(0.5);

        // --- FUNÇÃO AUXILIAR PARA CRIAR BOTÕES MODERNOS ---
        // Isto evita repetir código para cada botão e cria caixas arredondadas com efeitos
        const createMenuButton = (x, y, text, baseColor, hoverColor, onClickAction, isPlaceholder = false) => {
            const btnWidth = 200;
            const btnHeight = 45;

            // Desenho do fundo do botão usando gráficos nativos do Phaser
            const btnGraphics = this.add.graphics();
            
            // Se for apenas um placeholder (Options/How to Play), desenhamos mais opaco e sem cliques
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

            // Renderização do botão ativo normal (Play / Quit)
            btnGraphics.fillStyle(baseColor, 1);
            btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8); // Cantos arredondados

            // Texto do botão por cima da caixa geométrica
            const btnText = this.add.text(x, y, text, { 
                fontSize: '18px', 
                fill: '#ffffff', 
                fontFamily: 'monospace',
                fontStyle: 'bold' 
            }).setOrigin(0.5);

            // CORREÇÃO: Definir explicitamente as profundidades para o texto ficar à frente dos gráficos
            btnGraphics.setDepth(0);
            btnText.setDepth(1);

            // Criar a zona invisível interativa diretamente na cena para gerir os inputs de forma isolada
            const clickZone = this.add.zone(x, y, btnWidth, btnHeight)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', onClickAction)
                .on('pointerover', () => {
                    btnGraphics.clear();
                    btnGraphics.fillStyle(hoverColor, 1); // Muda a cor da caixa no hover
                    btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
                    btnText.setStyle({ fill: '#000000' }); // Muda o texto para preto no hover para dar contraste
                })
                .on('pointerout', () => {
                    btnGraphics.clear();
                    btnGraphics.fillStyle(baseColor, 1); // Restaura a cor original da caixa
                    btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
                    btnText.setStyle({ fill: '#ffffff' }); // Restaura o texto para branco
                });
        };

        // Botão Play: Inicia o jogo ao ser clicado (Verde escuro -> Verde alface no hover)
        createMenuButton(320, 160, 'Play', 0x27ae60, 0x2ecc71, () => this.scene.start('GameScene'));

        // Placeholder para o botão Options (Futuro)
        createMenuButton(320, 215, 'Options', null, null, null, true);

        // Placeholder para o botão How to Play (Futuro)
        createMenuButton(320, 270, 'How to Play', null, null, null, true);

        // Botão Quit: Exibe um aviso (Vermelho escuro -> Vermelho claro no hover)
        createMenuButton(320, 325, 'Quit', 0xc0392b, 0xe74c3c, () => alert('Obrigado por jogares!'));
    }
}

// ============================================================================
// NOVO: CLASSE QUE ENCAPSULA O TEU JOGO ATUAL
// ============================================================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' }); // Define a chave identificadora da cena do jogo
    }

    preload() {

        this.load.spritesheet('idle', 'assets/Gobbo_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('walk', 'assets/Gobbo_Walk_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('sprint', 'assets/Gobbo_Run_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('jump', 'assets/Gobbo_Jump_8.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {

        // NOVO: Força o background correto da GameScene para evitar que herde o cinzento do MainMenu
        this.cameras.main.setBackgroundColor('#b9eaff');

        // ====================
        // ANIMATIONS
        // ====================
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('idle', {
                start: 0,
                end: 3
            }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('walk', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'sprint',
            frames: this.anims.generateFrameNumbers('sprint', {
                start: 0,
                end: 5
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('jump', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });

        // ====================
        // GROUND
        // ====================
        gameState.ground = this.add.rectangle(
            1500, // x
            340, // y
            3000, // width
            40, // height
            0x00ff00 // color
        );
        this.physics.add.existing(gameState.ground, true);

        // ====================
        // ADDING WORLD OBSTACLES
        // ====================
        // Create a static group to hold all our environment blocks
        const platforms = this.physics.add.staticGroup();

        // Generate 15 random platforms across the 3000px wide world
        for (let i = 0; i < 15; i++) {
            // Generate random coordinates (avoiding the starting area)
            const randomX = Phaser.Math.Between(400, 2800);
            const randomY = Phaser.Math.Between(150, 280);
            const randomWidth = Phaser.Math.Between(60, 150);
        
            // Create a visual rectangle block
            const block = this.add.rectangle(randomX, randomY, randomWidth, 20, 0x7a5230);
        
            // Add it to our physics group so the player can land on it
            platforms.add(block);
        }

        // ====================
        // VINES
        // ====================
        // Create a static group for vines (no physics engine collisions, just tracking positions)
        gameState.vines = this.physics.add.staticGroup();

        // Let's place 5 long, dark green vines hanging down from platforms or mid-air
        for (let i = 0; i < 5; i++) {
            const vineX = Phaser.Math.Between(500, 2500);
            const vineY = 200; // mid-air
            const vineWidth = 50;
            const vineHeight = 240; // long vine

            // 0x1a4314 is a dark forest green
            const vine = this.add.rectangle(vineX, vineY, vineWidth, vineHeight, 0x1a4314);
            gameState.vines.add(vine);
        }

        // ====================
        // PLAYER
        // ====================
        gameState.player = this.physics.add.sprite(
            100, // x
            300, // y
            'idle' // texture
        );
        gameState.player.body.setCollideWorldBounds(true);

        // ====================
        // COLLISIONS
        // ====================
        this.physics.add.collider(
            gameState.player, 
            gameState.ground
        );
        this.physics.add.collider(
            gameState.player, 
            platforms
        );

        gameState.onVine = false;

        this.physics.add.overlap(gameState.player, gameState.vines, () => {
            gameState.onVine = true;
        });

        // ====================
        // CAMERA AND BOUNDARIES
        // ====================
        // 1. Tells the physics system how big the total playable area is (3000px wide, 360px high)
        this.physics.world.setBounds(0, 0, 3000, 360);
        // 2. Tells the main camera to mirror those same boundaries
        this.cameras.main.setBounds(0, 0, 3000, 360);
        // 3. Makes the camera follow the player sprite
        this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);

        // ====================
        // INPUT
        // ====================
        gameState.cursors = this.input.keyboard.createCursorKeys();
        gameState.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    update() {

        const player = gameState.player;

        const walkSpeed = 170;
        const sprintSpeed = 260;
        const isSprinting = gameState.shiftKey.isDown;
        const speed = isSprinting ? sprintSpeed : walkSpeed;
        
        const jumpPower = -300;
        const climbSpeed = -100;
        const onGround = player.body.touching.down;

        const touchingVine = gameState.onVine;
        gameState.onVine = false; // reset for next frame

        // ====================
        // CLIMBING LOGIC
        // ====================
        if (touchingVine && gameState.cursors.up.isDown) {
            // Disable gravity briefly so the player doesn't slide down while trying to climb
            player.body.setAllowGravity(false);
            player.body.setVelocityY(climbSpeed);
            
            // Optional: Play your walk or jump animation to show climbing effort
            player.anims.play('walk', true); 
        } else if (touchingVine && !onGround) {
            // If touching a vine in mid-air but NOT pressing up, hold onto it (suspend gravity)
            player.body.setAllowGravity(false);
            player.body.setVelocityY(0); 
            player.anims.play('idle', true);
        } else {
            // Turn gravity back on if we walk away or land on the ground
            player.body.setAllowGravity(true);
        }

        // ====================
        // MOVEMENT
        // ====================
        if (gameState.cursors.left.isDown) {
            player.body.setVelocityX(-speed);
            player.setFlipX(true);

            if (!onGround) {
                player.anims.play('jump', true);
            } else if (isSprinting) {
                player.anims.play('sprint', true);
            } else {
                player.anims.play('walk', true);
            }
        } else if (gameState.cursors.right.isDown) {
            player.body.setVelocityX(speed);
            player.setFlipX(false);

            if (!onGround) {
                player.anims.play('jump', true);
            } else if (isSprinting) {
                player.anims.play('sprint', true);
            } else {
                player.anims.play('walk', true);
            }
        } else {
            player.body.setVelocityX(0);
            
            if (!onGround) {
                player.anims.play('jump', true);
            } else {
                player.anims.play('idle', true);
            }
        }

        // ====================
        // JUMP
        // ====================
        if (gameState.cursors.up.isDown && onGround) {
            player.body.setVelocityY(jumpPower);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    width: 640,
    height: 360,
    backgroundColor: "b9eaff",

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false,
        }
    },

    // MODIFICADO: Agora mapeia as classes criadas em forma de lista. A primeira será iniciada por padrão.
    scene: [MainMenu, GameScene] 
}

const game = new Phaser.Game(config)