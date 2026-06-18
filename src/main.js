const gameState = {}

gameState.language = 'en';

const formatTimer = (milliseconds, roundUp = false) => {
    const totalSeconds = Math.max(0, roundUp ? Math.ceil(milliseconds / 1000) : Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const getStrings = (scene) => {
    const strings = scene.cache.json.get('strings');
    return strings?.[gameState.language] ?? strings?.en ?? {};
}

const getText = (scene, key) => getStrings(scene)[key] ?? key;

// ============================================================================
// CLASSE PARA O MENU PRINCIPAL DO JOGO
// ============================================================================
class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' }); // Define a chave identificadora desta cena
    }

    preload() {
        this.load.json('strings', 'assets/strings.json');
    }

    create() {
        const text = (key) => getText(this, key);

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
        createMenuButton(320, 270, text('howToPlay'), null, null, null, true);
        createMenuButton(320, 325, text('quit'), 0xc0392b, 0xe74c3c, () => alert(text('quitMessage')));
    }
}

// ============================================================================
// CLASSE PARA O ECRÃƒ DE GAME OVER
// ============================================================================
// ============================================================================
// CLASSE PARA AS OPCOES
// ============================================================================
class OptionsScene extends Phaser.Scene {
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

        this.add.text(320, 115, text('language'), {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const createMenuButton = (x, y, buttonText, baseColor, hoverColor, onClickAction) => {
            const btnWidth = 200;
            const btnHeight = 38;

            const btnGraphics = this.add.graphics();
            btnGraphics.fillStyle(baseColor, 1);
            btnGraphics.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);

            const btnText = this.add.text(x, y, buttonText, {
                fontSize: '16px',
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

            createMenuButton(320, y, text(labelKey), baseColor, hoverColor, () => {
                gameState.language = language;
                this.scene.restart({ returnScene });
            });
        };

        createLanguageButton(155, 'en', 'english');
        createLanguageButton(198, 'pt', 'portuguese');
        createLanguageButton(241, 'es', 'spanish');
        createLanguageButton(284, 'fr', 'french');
        createMenuButton(320, 327, text('back'), 0xc0392b, 0xe74c3c, () => this.scene.start(returnScene));
    }
}

class GameOverScene extends Phaser.Scene {
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

// ============================================================================
// CLASSE PARA O ECRÃƒ DE VITÃ“RIA / SCORE
// ============================================================================
class ScoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ScoreScene' });
    }

    create(data) {
        const text = (key) => getText(this, key);

        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.add.text(320, 80, text('win'), {
            fontSize: '42px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'monospace',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5);

        this.add.text(320, 130, `${text('yourTime')} ${data?.finishTime ?? '0:00'}`, {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
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

// ============================================================================
// CLASSE PARA O MENU DE PAUSA
// ============================================================================
class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        const text = (key) => getText(this, key);

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
            this.scene.resume('GameScene');
            this.scene.stop();
        });
        createMenuButton(320, 200, text('options'), 0x2980b9, 0x3498db, () => this.scene.start('OptionsScene', { returnScene: 'PauseScene' }));
        createMenuButton(320, 255, text('howToPlay'), null, null, null, true);
        createMenuButton(320, 310, text('quit'), 0xc0392b, 0xe74c3c, () => {
            gameState.isPaused = false;
            this.scene.stop('GameScene');
            this.scene.start('MainMenu');
        });
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
        const text = (key) => getText(this, key);

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
        const tsBGForest3   = map.addTilesetImage('backgroundforest_3', 'bg_forest');

        map.createLayer('Background',       [tsDarkForest, tsBGDeco, tsDarkForest2, tsBGDeco2], 0, 0);
        map.createLayer('backgroundForest', [tsBGForest, tsBGForest3], 0, 0);
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
                // Retângulo invisível 
                const zone = this.add.rectangle(
                    obj.x + obj.width / 2,
                    obj.y + obj.height / 2,
                    obj.width,
                    obj.height
                );
                gameState.vines.add(zone);
            } else {
                //visual colocado pelo Tiled
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
        
     //Ajusta o corpo de colisão para ser centralizado, para não ficar preso em cantos ou rampas
        gameState.player.body.setSize(32, 32);
        gameState.player.body.setOffset(0, 0);

        // ====================
        // COLLISIONS
        // ====================
        // Mantemos o colisor sempre ativo, sem nunca o desligar para evitar bugs com spam
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
            
            // setSize usa coordenadas locais (pre-escala): 60×95 local = 30×47 px em écran.
            // offsetY + bodyHeight = 128 → body.bottom alinha com o fundo do sprite.
            // offsetX centra a largura: (128-60)/2 = 34.
            enemy.body.setSize(60, 95);
            enemy.body.setOffset(34, 33);
            enemy.body.setCollideWorldBounds(true);
            enemy.patrolStart = patrolStart;
            enemy.patrolEnd = patrolEnd;
            enemy.patrolSpeed = 80;
            enemy.patrolDirection = 1;
            // Pontos de vida e cooldown de hit para não registar dano múltiplo por golpe
            enemy.hp    = 3;
            enemy.maxHp = 3;
            enemy.hitCooldown = false;
            // Barra de vida flutuante
            enemy.hpBarBg   = this.add.rectangle(x, 0, 32, 4, 0x333333).setDepth(5);
            // origin(0, 0.5): o x do fill é sempre o bordo esquerdo — assim a barra encolhe pela direita
            enemy.hpBarFill = this.add.rectangle(x - 16, 0, 32, 4, 0xe74c3c).setOrigin(0, 0.5).setDepth(6);
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
            // Cooldown evita que o mesmo golpe tire dano múltiplo em frames consecutivos
            if (enemy.hitCooldown) return;
            enemy.hp -= 1;
            enemy.hitCooldown = true;
            this.time.delayedCall(400, () => { if (enemy.active) enemy.hitCooldown = false; });
            if (enemy.hp <= 0) {
                enemy.hpBarBg.destroy();
                enemy.hpBarFill.destroy();
                enemy.destroy();
            }
        });

        this.physics.add.collider(gameState.player, gameState.enemies, () => {
            // Não toma dano se estiver a atacar ou em período de invencibilidade pós-golpe
            if (gameState.isAttacking || gameState.playerInvincible) return;
            gameState.playerHP -= 34;
            gameState.playerInvincible = true;
            // Flash visual de invencibilidade: pisca 5 vezes durante ~1 segundo
            this.tweens.add({
                targets: gameState.player,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: 4,
                onComplete: () => {
                    gameState.player.setAlpha(1);
                    gameState.playerInvincible = false;
                }
            });
            if (gameState.playerHP <= 0) {
                this.scene.start('GameOverScene');
            }
        });

        // ====================
        // PLAYER HUD
        // ====================
        gameState.playerMaxHP    = 100;
        gameState.playerHP       = 100;
        gameState.playerInvincible = false;

        // "HP" label fixo à câmara 
        gameState.hpLabel = this.add.text(10, 10, text('hp'), { fontSize: '9px', fill: '#ffffff', fontFamily: 'monospace' })
            .setScrollFactor(0).setDepth(20);
        // Fundo cinzento da barra (ligeiramente maior para dar borda)
        this.add.rectangle(75, 16, 84, 10, 0x333333)
            .setScrollFactor(0).setDepth(20);
        // Fill da barra — origin(0, 0.5) para encolher da direita para a esquerda
        gameState.hpBarFill = this.add.rectangle(35, 16, 80, 8, 0x2ecc71)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(21);

        gameState.timerDuration = 120000;
        gameState.remainingTime = gameState.timerDuration;
        gameState.elapsedTime = 0;
        gameState.timerText = this.add.text(320, 10, '2:00', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 1, fill: true }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);

        gameState.isPaused = false;
        const pauseButtonWidth = 82;
        const pauseButtonHeight = 28;
        const pauseButtonX = 590;
        const pauseButtonY = 20;
        const pauseButtonGraphics = this.add.graphics().setScrollFactor(0).setDepth(20);
        pauseButtonGraphics.fillStyle(0x333333, 1);
        pauseButtonGraphics.fillRoundedRect(
            pauseButtonX - pauseButtonWidth / 2,
            pauseButtonY - pauseButtonHeight / 2,
            pauseButtonWidth,
            pauseButtonHeight,
            8
        );

        const pauseButtonText = this.add.text(pauseButtonX, pauseButtonY, text('pause'), {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        this.add.zone(pauseButtonX, pauseButtonY, pauseButtonWidth, pauseButtonHeight)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(22)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                gameState.isPaused = true;
                this.scene.launch('PauseScene');
                this.scene.pause();
            })
            .on('pointerover', () => {
                pauseButtonGraphics.clear();
                pauseButtonGraphics.fillStyle(0x777777, 1);
                pauseButtonGraphics.fillRoundedRect(
                    pauseButtonX - pauseButtonWidth / 2,
                    pauseButtonY - pauseButtonHeight / 2,
                    pauseButtonWidth,
                    pauseButtonHeight,
                    8
                );
                pauseButtonText.setStyle({ fill: '#000000' });
            })
            .on('pointerout', () => {
                pauseButtonGraphics.clear();
                pauseButtonGraphics.fillStyle(0x333333, 1);
                pauseButtonGraphics.fillRoundedRect(
                    pauseButtonX - pauseButtonWidth / 2,
                    pauseButtonY - pauseButtonHeight / 2,
                    pauseButtonWidth,
                    pauseButtonHeight,
                    8
                );
                pauseButtonText.setStyle({ fill: '#ffffff' });
            });

        this.events.on('resume', () => {
            gameState.hpLabel.setText(text('hp'));
            pauseButtonText.setText(text('pause'));
        });

        // ====================
        // CAMERA AND BOUNDARIES
        // ====================
        this.physics.world.setBounds(0, 0, 3520, 640);
        this.cameras.main.setBounds(0, 0, 3520, 640);
        this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);
        gameState.mapRightEdge = 3520;
        gameState.hasWon = false;

        // ====================
        // INPUT (TECLADO E RATO)
        // ====================
        gameState.cursors = this.input.keyboard.createCursorKeys();
        gameState.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    
        gameState.isAttacking = false;

        this.input.mouse.disableContextMenu(); 

        // Congela a posição contra o chão usando immovable
        this.input.on('pointerdown', (pointer) => {
            if (gameState.isPaused) return;
            if (
                pointer.x >= pauseButtonX - pauseButtonWidth / 2 &&
                pointer.x <= pauseButtonX + pauseButtonWidth / 2 &&
                pointer.y >= pauseButtonY - pauseButtonHeight / 2 &&
                pointer.y <= pauseButtonY + pauseButtonHeight / 2
            ) return;

            if (!gameState.isAttacking) {
                const onGround = gameState.player.body.blocked.down;

                if (pointer.leftButtonDown()) {
                    gameState.isAttacking = true; 
                    
                    if (onGround) {
                        gameState.player.body.setVelocity(0, 0);
                        gameState.player.body.setAllowGravity(false);
                        //Torna o corpo imutável temporariamente para o chão não o empurrar para baixo
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

    update(time, delta) {
        const player = gameState.player;

        gameState.remainingTime = Math.max(0, gameState.remainingTime - delta);
        gameState.elapsedTime = gameState.timerDuration - gameState.remainingTime;
        gameState.timerText.setText(formatTimer(gameState.remainingTime, true));

        if (gameState.remainingTime <= 0) {
            this.scene.start('GameOverScene');
            return;
        }

        if (!gameState.hasWon && player.body.right >= gameState.mapRightEdge - 1) {
            gameState.hasWon = true;
            this.scene.start('ScoreScene', { finishTime: formatTimer(gameState.elapsedTime) });
            return;
        }

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
            // Colisão lateral tem prioridade: parede ou rampa invertem a direção,
            // sem esperar pelos limites de patrulha (evita ficar preso contra tiles sólidos).
            if (enemy.body.blocked.right && enemy.patrolDirection === 1) {
                enemy.patrolDirection = -1;
            } else if (enemy.body.blocked.left && enemy.patrolDirection === -1) {
                enemy.patrolDirection = 1;
            } else if (enemy.x >= enemy.patrolEnd) {
                enemy.patrolDirection = -1;
            } else if (enemy.x <= enemy.patrolStart) {
                enemy.patrolDirection = 1;
            }
            enemy.body.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
            enemy.setFlipX(enemy.patrolDirection === -1);
            // Atualiza a barra de HP flutuante acima do inimigo a cada frame
            const barY = enemy.y - 30;
            enemy.hpBarBg.setPosition(enemy.x, barY);
            // x do fill é o bordo esquerdo (origin 0): enemy.x - metade da largura total
            enemy.hpBarFill.setPosition(enemy.x - 16, barY);
            enemy.hpBarFill.setSize((enemy.hp / enemy.maxHp) * 32, 4);
        });

        // Atualiza a barra de HP do jogador — largura proporcional ao HP restante
        const hpPct = Math.max(0, gameState.playerHP / gameState.playerMaxHP);
        gameState.hpBarFill.setSize(80 * hpPct, 8);
        // Verde → amarelo → vermelho conforme a vida vai baixando
        if (hpPct > 0.66) {
            gameState.hpBarFill.setFillStyle(0x2ecc71);
        } else if (hpPct > 0.33) {
            gameState.hpBarFill.setFillStyle(0xf39c12);
        } else {
            gameState.hpBarFill.setFillStyle(0xe74c3c);
        }

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
            debug: true, 
        }
    },
    scene: [MainMenu, OptionsScene, GameScene, GameOverScene, ScoreScene, PauseScene] 
}

const game = new Phaser.Game(config)
