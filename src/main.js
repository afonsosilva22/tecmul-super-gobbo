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
        this.load.spritesheet('idle', 'assets/GobboAnims/Gobbo_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('walk', 'assets/GobboAnims/Gobbo_Walk_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('sprint', 'assets/GobboAnims/Gobbo_Run_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('jump', 'assets/GobboAnims/Gobbo_Jump_8.png', { frameWidth: 32, frameHeight: 32 });
        
        // Leitura estável a 42x42 píxeis das tuas spritesheets de ataque
        this.load.spritesheet('attack1', 'assets/GobboAnims/Gobbo_Attack1.png', { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet('attack2', 'assets/GobboAnims/Gobbo_Attack2.png', { frameWidth: 42, frameHeight: 42 });

        this.load.spritesheet('enemy1_walk',    'assets/enemies/enemy1/enemy1_walk.png',    { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_attack1', 'assets/enemies/enemy1/enemy1_attack1.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_idle',    'assets/enemies/enemy1/Idle.png',            { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_hurt',    'assets/enemies/enemy1/Hurt.png',            { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_dead',    'assets/enemies/enemy1/Dead.png',            { frameWidth: 128, frameHeight: 128 });

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

        this.anims.create({
            key: 'enemy1_idle',
            frames: this.anims.generateFrameNumbers('enemy1_idle', { start: 0, end: 4 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy1_hurt',
            frames: this.anims.generateFrameNumbers('enemy1_hurt', { start: 0, end: 2 }),
            frameRate: 12,
            repeat: 0
        });

        this.anims.create({
            key: 'enemy1_dead',
            frames: this.anims.generateFrameNumbers('enemy1_dead', { start: 0, end: 1 }),
            frameRate: 3,
            repeat: 0
        });

        // ====================
        // GROUND
        // ====================
        const map = this.make.tilemap({ key: 'map' });

        const tsDarkForest = map.addTilesetImage('Tiles_DarkForest', 'tiles_darkforest');
        const tsBGDeco     = map.addTilesetImage('background_deco',  'bg_deco');
        const tsBGBush     = map.addTilesetImage('backgroundBush',   'bg_bush');
        const tsBGForest   = map.addTilesetImage('backgroundforest',  'bg_forest');

        map.createLayer('Background',       tsBGDeco,    0, 0);
        map.createLayer('backgroundForest', tsBGForest,  0, 0);
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

                if (tileId === 577) {
                    this.add.image(sx, sy, 'vine');
                } else if (tileId >= 578 && tileId <= 581) {
                    this.add.image(sx, sy, 'vine_tip', tileId - 578);
                } else if (tileId >= 582 && tileId <= 585) {
                    this.add.image(sx, sy, 'vine2', tileId - 582);
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
            // Pontos de vida, cooldown de hit e estado da máquina de estados
            enemy.hp    = 3;
            enemy.maxHp = 3;
            enemy.hitCooldown = false;
            // Estados possíveis: 'patrol' | 'attack' | 'hurt' | 'dead'
            enemy.state = 'patrol';
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
            // Não faz nada se já está morto, em hurt ou dentro do cooldown de dano
            if (enemy.hitCooldown || enemy.state === 'dead' || enemy.state === 'hurt') return;
            enemy.hp -= 1;
            enemy.hitCooldown = true;
            this.time.delayedCall(500, () => { if (enemy.active) enemy.hitCooldown = false; });

            if (enemy.hp <= 0) {
                // Morte: limpa listeners pendentes, para e toca animação; destrói no final
                enemy.state = 'dead';
                enemy.off('animationcomplete-enemy1_attack1');
                enemy.body.setVelocityX(0);
                enemy.anims.play('enemy1_dead', true);
                enemy.once('animationcomplete-enemy1_dead', () => {
                    if (enemy.active) {
                        enemy.hpBarBg.destroy();
                        enemy.hpBarFill.destroy();
                        enemy.destroy();
                    }
                });
            } else {
                // Hurt: knockback na direção oposta ao jogador + animação de dano
                enemy.state = 'hurt';
                enemy.off('animationcomplete-enemy1_attack1');
                const knockDir = gameState.player.x < enemy.x ? 1 : -1;
                enemy.body.setVelocityX(180 * knockDir);
                enemy.anims.play('enemy1_hurt', true);
                enemy.once('animationcomplete-enemy1_hurt', () => {
                    if (enemy.active && enemy.state === 'hurt') enemy.state = 'patrol';
                });
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
                this.scene.restart();
            }
        });

        // ====================
        // TRANSIÇÃO PARA O MAPA 2
        // ====================
        // Zona invisível no limite direito do Mapa 1 — ao tocar, passa para Map2Scene
        const transitionZone = this.add.rectangle(3510, 320, 20, 640);
        this.physics.add.existing(transitionZone, true);
        this.physics.add.overlap(gameState.player, transitionZone, () => {
            this.scene.start('Map2Scene', { playerHP: gameState.playerHP });
        });

        // ====================
        // PLAYER HUD
        // ====================
        gameState.playerMaxHP    = 100;
        gameState.playerHP       = 100;
        gameState.playerInvincible = false;

        // "HP" label fixo à câmara 
        this.add.text(10, 10, 'HP', { fontSize: '9px', fill: '#ffffff', fontFamily: 'monospace' })
            .setScrollFactor(0).setDepth(20);
        // Fundo cinzento da barra (ligeiramente maior para dar borda)
        this.add.rectangle(75, 16, 84, 10, 0x333333)
            .setScrollFactor(0).setDepth(20);
        // Fill da barra — origin(0, 0.5) para encolher da direita para a esquerda
        gameState.hpBarFill = this.add.rectangle(35, 16, 80, 8, 0x2ecc71)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(21);

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

        // Congela a posição contra o chão usando immovable
        this.input.on('pointerdown', (pointer) => {
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
            // Morto: aguarda o callback da animação de morte
            if (enemy.state === 'dead') return;

            // Ferido: knockback resolve o movimento, não intervimos; só atualiza a HP bar
            if (enemy.state === 'hurt') {
                const barY = enemy.y - 30;
                enemy.hpBarBg.setPosition(enemy.x, barY);
                enemy.hpBarFill.setPosition(enemy.x - 16, barY);
                return;
            }

            const dx = Math.abs(gameState.player.x - enemy.x);
            const dy = Math.abs(gameState.player.y - enemy.y);

            if (dx < 55 && dy < 36) {
                // Alcance de ataque: para, vira-se para o jogador, dispara a anim de ataque
                enemy.body.setVelocityX(0);
                enemy.setFlipX(gameState.player.x < enemy.x);
                if (enemy.state !== 'attack') {
                    enemy.state = 'attack';
                    enemy.anims.play('enemy1_attack1', true);
                    // Regressa a patrulha quando o ataque termina — once() garante disparo único
                    enemy.once('animationcomplete-enemy1_attack1', () => {
                        if (enemy.active && enemy.state === 'attack') enemy.state = 'patrol';
                    });
                }
            } else if (dx < 150 && dy < 60) {
                // Alcance de deteção: para, olha para o jogador e fica em idle (alerta)
                if (enemy.state === 'attack') {
                    enemy.state = 'patrol';
                    // Limpa listener pendente para evitar disparos duplicados
                    enemy.off('animationcomplete-enemy1_attack1');
                }
                enemy.body.setVelocityX(0);
                enemy.setFlipX(gameState.player.x < enemy.x);
                enemy.anims.play('enemy1_idle', true);
            } else {
                // Fora do alcance: patrulha normal
                if (enemy.state === 'attack') {
                    enemy.state = 'patrol';
                    enemy.off('animationcomplete-enemy1_attack1');
                }
                // Colisão lateral tem prioridade: parede ou rampa invertem a direção imediatamente,
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
                enemy.anims.play('enemy1_walk', true);
            }

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

// ============================================================================
// CLASSE DO MAPA 2 — BLACK FOREST
// ============================================================================
class Map2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Map2Scene' });
    }

    preload() {
        // Mapa e tilesets específicos do Mapa 2 — chaves prefixadas com m2_ para não colidir com Map1
        this.load.tilemapTiledJSON('map2', 'assets/TIlesetMaps/Map2/Mapa2BlackForest.tmj');
        this.load.image('m2_ts_bg1',         'assets/TIlesetMaps/Map2/tiles/Layer_0003_6.png');
        this.load.image('m2_ts_bg2',         'assets/TIlesetMaps/Map2/tiles/Layer_0005_5.png');
        this.load.image('m2_ts_bg3',         'assets/TIlesetMaps/Map2/tiles/Layer_0006_4.png');
        this.load.image('m2_ts_bg4',         'assets/TIlesetMaps/Map2/tiles/Layer_0008_3.png');
        this.load.image('m2_ts_bg5',         'assets/TIlesetMaps/Map2/tiles/Layer_0009_2.png');
        this.load.image('m2_ts_bg6',         'assets/TIlesetMaps/Map2/tiles/Layer_0000_9.png');
        this.load.image('m2_ts_bg7',         'assets/TIlesetMaps/Map2/tiles/Layer_0001_8.png');
        this.load.image('m2_ts_bg8',         'assets/TIlesetMaps/Map2/tiles/Layer_0002_7.png');
        this.load.image('m2_ts_bg9',         'assets/TIlesetMaps/Map2/tiles/Layer_0004_Lights.png');
        this.load.image('m2_ts_bg10',        'assets/TIlesetMaps/Map2/tiles/Layer_0007_Lights.png');
        this.load.image('m2_ts_bg11',        'assets/TIlesetMaps/Map2/tiles/Layer_0010_1.png');
        this.load.image('m2_ts_bg12',        'assets/TIlesetMaps/Map2/tiles/Layer_0011_0.png');
        this.load.image('m2_ts_tiles',       'assets/TIlesetMaps/Map2/tiles/Tilesheet - WOODS.png');
        this.load.image('m2_ts_branches',    'assets/TIlesetMaps/Map2/tiles/Ramo Variados.png');
        this.load.image('m2_ts_raming',      'assets/TIlesetMaps/Map2/tiles/RAMING.png');
        this.load.image('m2_ts_underwater',  'assets/TIlesetMaps/Map2/tiles/Underwater.png');
        this.load.image('m2_ts_water',       'assets/TIlesetMaps/Map2/tiles/Water.png');
        this.load.image('m2_ts_underwater2', 'assets/TIlesetMaps/Map2/tiles/Underwater2.png');
        // Vinhas do Mapa 2 — vineG é exclusivo do mapa; vine e vine_tip são partilhados com o Mapa 1
        this.load.spritesheet('m2_ts_vineG',   'assets/TIlesetMaps/Map2/tiles/vineG.png',   { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('m2_ts_vinetip', 'assets/TIlesetMaps/tiles/vine_tip.png',      { frameWidth: 32, frameHeight: 32 });
        this.load.image('m2_ts_vine',          'assets/TIlesetMaps/tiles/vine.png');
    }

    create(data) {
        this.cameras.main.setBackgroundColor('#0d1117');

        // ====================
        // ANIMATIONS
        // ====================
        // Animações do Gobbo e do inimigo — só recria se ainda não estiverem no gestor global
        if (!this.anims.exists('idle'))    this.anims.create({ key: 'idle',    frames: this.anims.generateFrameNumbers('idle',    { start: 0, end: 3 }), frameRate: 5,  repeat: -1 });
        if (!this.anims.exists('walk'))    this.anims.create({ key: 'walk',    frames: this.anims.generateFrameNumbers('walk',    { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        if (!this.anims.exists('sprint'))  this.anims.create({ key: 'sprint',  frames: this.anims.generateFrameNumbers('sprint',  { start: 0, end: 5 }), frameRate: 15, repeat: -1 });
        if (!this.anims.exists('jump'))    this.anims.create({ key: 'jump',    frames: this.anims.generateFrameNumbers('jump',    { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        if (!this.anims.exists('attack1')) this.anims.create({ key: 'attack1', frames: this.anims.generateFrameNumbers('attack1', { start: 0, end: 5 }), frameRate: 14, repeat: 0  });
        if (!this.anims.exists('attack2')) this.anims.create({ key: 'attack2', frames: this.anims.generateFrameNumbers('attack2', { start: 0, end: 5 }), frameRate: 14, repeat: 0  });
        if (!this.anims.exists('enemy1_walk'))    this.anims.create({ key: 'enemy1_walk',    frames: this.anims.generateFrameNumbers('enemy1_walk',    { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
        if (!this.anims.exists('enemy1_attack1')) this.anims.create({ key: 'enemy1_attack1', frames: this.anims.generateFrameNumbers('enemy1_attack1', { start: 0, end: 5 }), frameRate: 10, repeat: 0  });
        if (!this.anims.exists('enemy1_idle'))    this.anims.create({ key: 'enemy1_idle',    frames: this.anims.generateFrameNumbers('enemy1_idle',    { start: 0, end: 4 }), frameRate: 6,  repeat: -1 });
        if (!this.anims.exists('enemy1_hurt'))    this.anims.create({ key: 'enemy1_hurt',    frames: this.anims.generateFrameNumbers('enemy1_hurt',    { start: 0, end: 2 }), frameRate: 12, repeat: 0  });
        if (!this.anims.exists('enemy1_dead'))    this.anims.create({ key: 'enemy1_dead',    frames: this.anims.generateFrameNumbers('enemy1_dead',    { start: 0, end: 1 }), frameRate: 3,  repeat: 0  });

        // ====================
        // GROUND
        // ====================
        const map = this.make.tilemap({ key: 'map2' });

        // Liga cada nome-no-TMJ à chave de textura carregada no preload
        // Usamos um array único com todos os tilesets — Phaser ignora os que não são usados em cada layer
        const tsAll = [
            map.addTilesetImage('BackGround1BF',  'm2_ts_bg1'),
            map.addTilesetImage('BG_BF2',         'm2_ts_bg2'),
            map.addTilesetImage('BG_BF3',         'm2_ts_bg3'),
            map.addTilesetImage('BG_BF4',         'm2_ts_bg4'),
            map.addTilesetImage('BG_BF5',         'm2_ts_bg5'),
            map.addTilesetImage('BG_BF6',         'm2_ts_bg6'),
            map.addTilesetImage('BG_BF7',         'm2_ts_bg7'),
            map.addTilesetImage('BF_BG8',         'm2_ts_bg8'),
            map.addTilesetImage('BG_BF9',         'm2_ts_bg9'),
            map.addTilesetImage('BG_BF10',        'm2_ts_bg10'),
            map.addTilesetImage('BG_BF11',        'm2_ts_bg11'),
            map.addTilesetImage('BG_BF12',        'm2_ts_bg12'),
            map.addTilesetImage('BF_Tiles',       'm2_ts_tiles'),
            map.addTilesetImage('BranchesTiles',  'm2_ts_branches'),
            map.addTilesetImage('RAMINGTile',     'm2_ts_raming'),
            map.addTilesetImage('UnderwaterTile', 'm2_ts_underwater'),
            map.addTilesetImage('WaterTile',      'm2_ts_water'),
            map.addTilesetImage('UnderWater2Tile','m2_ts_underwater2'),
            // Os três tilesets de vinha também são registados para o Phaser não lançar avisos
            map.addTilesetImage('VinhaGrandeTile', 'm2_ts_vineG'),
            map.addTilesetImage('VinhaTipTile',    'm2_ts_vinetip'),
            map.addTilesetImage('vinhaTile',       'm2_ts_vine'),
        ];

        // Camadas de fundo — ordem bottom→top, tal como no Tiled
        map.createLayer('BG_CEU2',    tsAll, 0, 0);
        map.createLayer('BG_CEU1',    tsAll, 0, 0);
        map.createLayer('BG_tree5',   tsAll, 0, 0);
        map.createLayer('BGtree4',    tsAll, 0, 0);
        map.createLayer('BG_LUZ2',    tsAll, 0, 0);
        map.createLayer('BG_tree3',   tsAll, 0, 0);
        map.createLayer('BGtree2',    tsAll, 0, 0);
        map.createLayer('BG_Luz1',    tsAll, 0, 0);
        map.createLayer('BG_tree1',   tsAll, 0, 0);
        map.createLayer('BG_treeTOp', tsAll, 0, 0);
        map.createLayer('BG_CHAO2',   tsAll, 0, 0);
        map.createLayer('BG_chao1',   tsAll, 0, 0);

        // Camada de colisão principal
        const platformLayer = map.createLayer('Plataforma', tsAll, 0, 0);
        platformLayer.setCollisionByExclusion([-1]);

        // ForeGround: ramos e elementos visuais na frente do jogador — depth 3 garante que fica
        // à frente dos sprites (depth 0) mas atrás das barras de HP (depth 5+) e do HUD (depth 20+)
        const foregroundLayer = map.createLayer('ForeGround', tsAll, 0, 0);
        foregroundLayer.setDepth(3);

        // ====================
        // VINES
        // ====================
        gameState.vines = this.physics.add.staticGroup();

        const vinhasLayer = map.getObjectLayer('Vinhas');
        vinhasLayer.objects.forEach(obj => {
            const tileId = obj.gid ? (obj.gid & 0x0FFFFFFF) : null;

            if (!tileId) {
                // Retângulo invisível — zona de escalada
                const zone = this.add.rectangle(
                    obj.x + obj.width  / 2,
                    obj.y + obj.height / 2,
                    obj.width,
                    obj.height
                );
                gameState.vines.add(zone);
            } else {
                // Em Tiled, tile objects têm y na base do sprite (não no topo)
                const sx = obj.x + obj.width  / 2;
                const sy = obj.y - obj.height / 2;

                // VinhaGrandeTile gids 8528–8531 (2×2 spritesheet de 32×32)
                if (tileId >= 8528 && tileId <= 8531) {
                    this.add.image(sx, sy, 'm2_ts_vineG', tileId - 8528);
                // VinhaTipTile gids 8532–8535 (2×2 spritesheet de 32×32)
                } else if (tileId >= 8532 && tileId <= 8535) {
                    this.add.image(sx, sy, 'm2_ts_vinetip', tileId - 8532);
                // vinhaTile gid 8536 (imagem única 32×32)
                } else if (tileId === 8536) {
                    this.add.image(sx, sy, 'm2_ts_vine');
                }
            }
        });

        // ====================
        // PLAYER
        // ====================
        // HP recebido da cena anterior; se a cena for iniciada directamente, começa no máximo
        const startHP = (data && data.playerHP != null) ? data.playerHP : 100;

        gameState.player = this.physics.add.sprite(100, 580, 'idle');
        gameState.player.body.setCollideWorldBounds(true);
        gameState.player.body.setSize(32, 32);
        gameState.player.body.setOffset(0, 0);

        // ====================
        // COLLISIONS
        // ====================
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
            const enemy = this.physics.add.sprite(x, 600, 'enemy1_walk');
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
            // Pontos de vida, cooldown de hit e estado da máquina de estados
            enemy.hp    = 3;
            enemy.maxHp = 3;
            enemy.hitCooldown = false;
            // Estados possíveis: 'patrol' | 'attack' | 'hurt' | 'dead'
            enemy.state = 'patrol';
            // Barra de vida flutuante
            enemy.hpBarBg   = this.add.rectangle(x, 0, 32, 4, 0x333333).setDepth(5);
            // origin(0, 0.5): o x do fill é sempre o bordo esquerdo — assim a barra encolhe pela direita
            enemy.hpBarFill = this.add.rectangle(x - 16, 0, 32, 4, 0xe74c3c).setOrigin(0, 0.5).setDepth(6);
            enemy.anims.play('enemy1_walk', true);
            gameState.enemies.add(enemy);
            this.physics.add.collider(enemy, platformLayer);
        };

        spawnEnemy(600,  480,  760);
        spawnEnemy(1400, 1250, 1600);
        spawnEnemy(2200, 2050, 2380);

        gameState.attackHitbox = this.add.rectangle(0, 0, 40, 28);
        this.physics.add.existing(gameState.attackHitbox, false);
        gameState.attackHitbox.body.allowGravity = false;
        gameState.attackHitbox.body.enable = false;

        this.physics.add.overlap(gameState.attackHitbox, gameState.enemies, (hitbox, enemy) => {
            // Não faz nada se já está morto, em hurt ou dentro do cooldown de dano
            if (enemy.hitCooldown || enemy.state === 'dead' || enemy.state === 'hurt') return;
            enemy.hp -= 1;
            enemy.hitCooldown = true;
            this.time.delayedCall(500, () => { if (enemy.active) enemy.hitCooldown = false; });

            if (enemy.hp <= 0) {
                // Morte: limpa listeners pendentes, para e toca animação; destrói no final
                enemy.state = 'dead';
                enemy.off('animationcomplete-enemy1_attack1');
                enemy.body.setVelocityX(0);
                enemy.anims.play('enemy1_dead', true);
                enemy.once('animationcomplete-enemy1_dead', () => {
                    if (enemy.active) {
                        enemy.hpBarBg.destroy();
                        enemy.hpBarFill.destroy();
                        enemy.destroy();
                    }
                });
            } else {
                // Hurt: knockback na direção oposta ao jogador + animação de dano
                enemy.state = 'hurt';
                enemy.off('animationcomplete-enemy1_attack1');
                const knockDir = gameState.player.x < enemy.x ? 1 : -1;
                enemy.body.setVelocityX(180 * knockDir);
                enemy.anims.play('enemy1_hurt', true);
                enemy.once('animationcomplete-enemy1_hurt', () => {
                    if (enemy.active && enemy.state === 'hurt') enemy.state = 'patrol';
                });
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
            // Ao morrer no Mapa 2, reinicia o Mapa 1
            if (gameState.playerHP <= 0) {
                this.scene.start('GameScene');
            }
        });

        // ====================
        // PLAYER HUD
        // ====================
        gameState.playerMaxHP    = 100;
        gameState.playerHP       = startHP;
        gameState.playerInvincible = false;

        // "HP" label fixo à câmara
        this.add.text(10, 10, 'HP', { fontSize: '9px', fill: '#ffffff', fontFamily: 'monospace' })
            .setScrollFactor(0).setDepth(20);
        // Fundo cinzento da barra (ligeiramente maior para dar borda)
        this.add.rectangle(75, 16, 84, 10, 0x333333)
            .setScrollFactor(0).setDepth(20);
        // Fill da barra — origin(0, 0.5) para encolher da direita para a esquerda
        gameState.hpBarFill = this.add.rectangle(35, 16, 80, 8, 0x2ecc71)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(21);

        // ====================
        // CAMERA AND BOUNDARIES
        // ====================
        // Mapa 2: 200×30 tiles × 32px = 6400×960 px
        this.physics.world.setBounds(0, 0, 6400, 960);
        this.cameras.main.setBounds(0, 0, 6400, 960);
        this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);

        // ====================
        // INPUT (TECLADO E RATO)
        // ====================
        gameState.cursors = this.input.keyboard.createCursorKeys();
        gameState.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        gameState.isAttacking = false;

        this.input.mouse.disableContextMenu();

        // Congela a posição contra o chão usando immovable
        this.input.on('pointerdown', (pointer) => {
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
            // Morto: aguarda o callback da animação de morte
            if (enemy.state === 'dead') return;

            // Ferido: knockback resolve o movimento, não intervimos; só atualiza a HP bar
            if (enemy.state === 'hurt') {
                const barY = enemy.y - 30;
                enemy.hpBarBg.setPosition(enemy.x, barY);
                enemy.hpBarFill.setPosition(enemy.x - 16, barY);
                return;
            }

            const dx = Math.abs(gameState.player.x - enemy.x);
            const dy = Math.abs(gameState.player.y - enemy.y);

            if (dx < 55 && dy < 36) {
                // Alcance de ataque: para, vira-se para o jogador, dispara a anim de ataque
                enemy.body.setVelocityX(0);
                enemy.setFlipX(gameState.player.x < enemy.x);
                if (enemy.state !== 'attack') {
                    enemy.state = 'attack';
                    enemy.anims.play('enemy1_attack1', true);
                    // Regressa a patrulha quando o ataque termina — once() garante disparo único
                    enemy.once('animationcomplete-enemy1_attack1', () => {
                        if (enemy.active && enemy.state === 'attack') enemy.state = 'patrol';
                    });
                }
            } else if (dx < 150 && dy < 60) {
                // Alcance de deteção: para, olha para o jogador e fica em idle (alerta)
                if (enemy.state === 'attack') {
                    enemy.state = 'patrol';
                    // Limpa listener pendente para evitar disparos duplicados
                    enemy.off('animationcomplete-enemy1_attack1');
                }
                enemy.body.setVelocityX(0);
                enemy.setFlipX(gameState.player.x < enemy.x);
                enemy.anims.play('enemy1_idle', true);
            } else {
                // Fora do alcance: patrulha normal
                if (enemy.state === 'attack') {
                    enemy.state = 'patrol';
                    enemy.off('animationcomplete-enemy1_attack1');
                }
                // Colisão lateral tem prioridade: parede ou rampa invertem a direção imediatamente,
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
                enemy.anims.play('enemy1_walk', true);
            }

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
    scene: [MainMenu, GameScene, Map2Scene]
}

const game = new Phaser.Game(config)