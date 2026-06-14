const gameState = {}

// ============================================================================
// CLASSE PARA O MENU PRINCIPAL DO JOGO
// ============================================================================
class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' }); // Define a chave identificadora desta cena
    }

    create() {
        // Altera a cor de fundo apenas para o ecrã do menu
        this.cameras.main.setBackgroundColor('#1a1a1a'); 

        // Adiciona o título do jogo centralizado com um estilo mais polido
        this.add.text(320, 80, 'SUPER GOBBO', { 
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

        createMenuButton(320, 160, 'Play', 0x27ae60, 0x2ecc71, () => this.scene.start('GameScene'));
        createMenuButton(320, 215, 'Options', null, null, null, true);
        createMenuButton(320, 270, 'How to Play', null, null, null, true);
        createMenuButton(320, 325, 'Quit', 0xc0392b, 0xe74c3c, () => alert('Obrigado por jogares!'));
    }
}

// ============================================================================
// CLASSE QUE ENCAPSULA O TEU JOGO ATUAL
// ============================================================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' }); 
    }

    preload() {
        this.load.spritesheet('idle', 'assets/Gobbo_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('walk', 'assets/Gobbo_Walk_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('sprint', 'assets/Gobbo_Run_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('jump', 'assets/Gobbo_Jump_8.png', { frameWidth: 32, frameHeight: 32 });
        
        // Leitura estável a 42x42 píxeis das tuas spritesheets de ataque
        this.load.spritesheet('attack1', 'assets/Gobbo_Attack1.png', { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet('attack2', 'assets/Gobbo_Attack2.png', { frameWidth: 42, frameHeight: 42 });

        this.load.spritesheet('enemy1_walk', 'assets/enemies/enemy1/enemy1_walk.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_attack1', 'assets/enemies/enemy1/enemy1_attack1.png', { frameWidth: 128, frameHeight: 128 });

        this.load.tilemapTiledJSON('map', 'assets/TIlesetMaps/Map1/Mapa1.tmj');
        this.load.image('tiles_darkforest', 'assets/TIlesetMaps/tiles/Tilesheet - WOODS.png');
        this.load.image('bg_deco',    'assets/TIlesetMaps/tiles/BACKGROUND.png');
        this.load.image('bg_bush',    'assets/TIlesetMaps/tiles/BUSH - BACKGROUND.png');
        this.load.image('bg_forest',  'assets/TIlesetMaps/tiles/WOODS - Second.png');
        this.load.image('bg_forest2', 'assets/TIlesetMaps/tiles/WOODS - Third.png');

        this.load.image('vine',     'assets/TIlesetMaps/tiles/vine.png');
        this.load.spritesheet('vine_tip', 'assets/TIlesetMaps/tiles/vine_tip.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('vine2',    'assets/TIlesetMaps/tiles/vine2.png',    { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        this.cameras.main.setBackgroundColor('#b9eaff');

        // ====================
        // ANIMATIONS
        // ====================
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('walk', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'sprint',
            frames: this.anims.generateFrameNumbers('sprint', { start: 0, end: 5 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('jump', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'attack1',
            frames: this.anims.generateFrameNumbers('attack1', { start: 0, end: 5 }), 
            frameRate: 14, 
            repeat: 0
        });

        this.anims.create({
            key: 'attack2',
            frames: this.anims.generateFrameNumbers('attack2', { start: 0, end: 5 }),
            frameRate: 14,
            repeat: 0
        });

        this.anims.create({
            key: 'enemy1_walk',
            frames: this.anims.generateFrameNumbers('enemy1_walk', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy1_attack1',
            frames: this.anims.generateFrameNumbers('enemy1_attack1', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });

        // ====================
        // GROUND
        // ====================
        const map = this.make.tilemap({ key: 'map' });

        const tsDarkForest  = map.addTilesetImage('Tiles_DarkForest',   'tiles_darkforest');
        const tsBGDeco      = map.addTilesetImage('background_deco',   'bg_deco');
        const tsBGBush      = map.addTilesetImage('backgroundBush',    'bg_bush');
        const tsBGForest    = map.addTilesetImage('backgroundforest',   'bg_forest');
        const tsBGForest2   = map.addTilesetImage('backgroundforest2',  'bg_forest2');
        const tsDarkForest2 = map.addTilesetImage('Tiles_DarkForest_2', 'tiles_darkforest');
        const tsBGDeco2     = map.addTilesetImage('background_deco_2',  'bg_deco');

        map.createLayer('Background',       [tsDarkForest, tsBGDeco, tsDarkForest2, tsBGDeco2], 0, 0);
        map.createLayer('backgroundForest', tsBGForest, 0, 0);
        map.createLayer('BackgroundBush',   tsBGBush,   0, 0);

        const platformLayer = map.createLayer('Plataforma', tsDarkForest, 0, 0);
        platformLayer.setCollisionByExclusion([-1]);

        // ====================
        // VINES
        // ====================
        gameState.vines = this.physics.add.staticGroup();

        const vineObjectLayer = map.getObjectLayer('VinhasCamada');
        vineObjectLayer.objects.forEach(obj => {
            const tileId = obj.gid ? (obj.gid & 0x0FFFFFFF) : null;

            if (!tileId) {
                // Retângulo invisível — zona de escalada com física
                const zone = this.add.rectangle(
                    obj.x + obj.width / 2,
                    obj.y + obj.height / 2,
                    obj.width,
                    obj.height
                );
                gameState.vines.add(zone);
            } else {
                // Tile sprite — visual colocado pelo Tiled
                // Em Tiled, tile objects têm y na base do sprite (não no topo)
                const sx = obj.x + obj.width / 2;
                const sy = obj.y - obj.height / 2;

                if (tileId === 1009) {
                    this.add.image(sx, sy, 'vine');
                } else if (tileId >= 1010 && tileId <= 1013) {
                    this.add.image(sx, sy, 'vine_tip', tileId - 1010);
                } else if (tileId >= 1014 && tileId <= 1017) {
                    this.add.image(sx, sy, 'vine2', tileId - 1014);
                }
            }
        });

        // ====================
        // PLAYER
        // ====================
        gameState.player = this.physics.add.sprite(100, 300, 'idle');
        gameState.player.body.setCollideWorldBounds(true);
        
        // Caixa física trancada estável no tamanho original do Gobbo (32x32)
        gameState.player.body.setSize(32, 32);
        gameState.player.body.setOffset(0, 0);

        // ====================
        // COLLISIONS
        // ====================
        // CORRIGIDO: Mantemos o colisor sempre ativo, sem nunca o desligar para evitar bugs com spam
        this.physics.add.collider(gameState.player, platformLayer);

        gameState.onVine = false;
        this.physics.add.overlap(gameState.player, gameState.vines, () => {
            gameState.onVine = true;
        });

        // ====================
        // ENEMIES
        // ====================
        gameState.enemies = this.physics.add.group();

        const spawnEnemy = (x, patrolStart, patrolEnd) => {
            const enemy = this.physics.add.sprite(x, 250, 'enemy1_walk');
            enemy.setScale(0.5);
            enemy.patrolStart = patrolStart;
            enemy.patrolEnd = patrolEnd;
            enemy.patrolSpeed = 80;
            enemy.patrolDirection = 1;
            enemy.anims.play('enemy1_walk', true);
            gameState.enemies.add(enemy);
            this.physics.add.collider(enemy, platformLayer);
        };

        spawnEnemy(600, 480, 760);
        spawnEnemy(1200, 1050, 1380);
        spawnEnemy(1800, 1650, 1980);

        gameState.attackHitbox = this.add.rectangle(0, 0, 40, 28);
        this.physics.add.existing(gameState.attackHitbox, false);
        gameState.attackHitbox.body.allowGravity = false;
        gameState.attackHitbox.body.enable = false;

        this.physics.add.overlap(gameState.attackHitbox, gameState.enemies, (hitbox, enemy) => {
            enemy.destroy();
        });

        this.physics.add.collider(gameState.player, gameState.enemies, () => {
            if (!gameState.isAttacking) {
                this.scene.restart();
            }
        });

        // ====================
        // CAMERA AND BOUNDARIES
        // ====================
        this.physics.world.setBounds(0, 0, 3520, 640);
        this.cameras.main.setBounds(0, 0, 3520, 640);
        this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);

        // ====================
        // INPUT (TECLADO E RATO)
        // ====================
        gameState.cursors = this.input.keyboard.createCursorKeys();
        gameState.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    
        gameState.isAttacking = false;

        this.input.mouse.disableContextMenu(); 

        // Configuração à prova de spam: Congela a posição contra o chão usando immovable
        this.input.on('pointerdown', (pointer) => {
            if (!gameState.isAttacking) {
                const onGround = gameState.player.body.blocked.down;

                if (pointer.leftButtonDown()) {
                    gameState.isAttacking = true; 
                    
                    if (onGround) {
                        gameState.player.body.setVelocity(0, 0);
                        gameState.player.body.setAllowGravity(false);
                        // CORRIGIDO: Torna o corpo imutável temporariamente para o chão não o empurrar para baixo
                        gameState.player.body.setImmovable(true); 
                    }

                    gameState.player.body.setOffset(5, 5);
                    gameState.player.anims.play('attack1', true);

                    gameState.player.once('animationcomplete-attack1', () => {
                        gameState.isAttacking = false;
                        // Restaura todas as propriedades físicas de movimento estável
                        gameState.player.body.setAllowGravity(true);
                        gameState.player.body.setImmovable(false);
                        gameState.player.body.setOffset(0, 0);
                    });
                } else if (pointer.rightButtonDown()) {
                    gameState.isAttacking = true; 
                    
                    if (onGround) {
                        gameState.player.body.setVelocity(0, 0);
                        gameState.player.body.setAllowGravity(false);
                        gameState.player.body.setImmovable(true);
                    }

                    gameState.player.body.setOffset(5, 5);
                    gameState.player.anims.play('attack2', true);

                    gameState.player.once('animationcomplete-attack2', () => {
                        gameState.isAttacking = false;
                        gameState.player.body.setAllowGravity(true);
                        gameState.player.body.setImmovable(false);
                        gameState.player.body.setOffset(0, 0);
                    });
                }
            }
        });
    }

    update() {
        const player = gameState.player;

        const walkSpeed = 170;
        const sprintSpeed = 260;
        const isSprinting = gameState.shiftKey.isDown;
        const speed = isSprinting ? sprintSpeed : walkSpeed;
        
        const jumpPower = -300;
        const climbSpeed = -100;
        const onGround = player.body.blocked.down;

        const touchingVine = gameState.onVine;
        gameState.onVine = false; 

        // ====================
        // ENEMY AI
        // ====================
        if (gameState.isAttacking) {
            const dir = gameState.player.flipX ? -1 : 1;
            gameState.attackHitbox.x = gameState.player.x + dir * 32;
            gameState.attackHitbox.y = gameState.player.y;
            gameState.attackHitbox.body.enable = true;
        } else {
            gameState.attackHitbox.body.enable = false;
        }

        gameState.enemies.getChildren().forEach(enemy => {
            if (enemy.x >= enemy.patrolEnd) {
                enemy.patrolDirection = -1;
            } else if (enemy.x <= enemy.patrolStart) {
                enemy.patrolDirection = 1;
            }
            enemy.body.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
            enemy.setFlipX(enemy.patrolDirection === -1);
        });

        if (gameState.isAttacking) {
            return; // Bloqueia novos comandos se estiver a golpear
        }

        // ====================
        // CLIMBING LOGIC
        // ====================
        if (touchingVine && gameState.cursors.up.isDown) {
            player.body.setAllowGravity(false);
            player.body.setVelocityY(climbSpeed);
            player.anims.play('walk', true); 
        } else if (touchingVine && !onGround) {
            player.body.setAllowGravity(false);
            player.body.setVelocityY(0); 
            player.anims.play('idle', true);
        } else {
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
    scene: [MainMenu, GameScene] 
}

const game = new Phaser.Game(config)