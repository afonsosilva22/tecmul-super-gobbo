import { gameState } from '../state.js';
import { assetPath } from '../utils/assets.js';
import { createGameAnimations } from '../utils/animations.js';
import { loadGameAudio, playBackgroundMusic, stopMovementSounds } from '../utils/audio.js';
import { createPlayer } from '../entities/player.js';
import { getText } from '../utils/text.js';
import { formatTimer } from '../utils/time.js';

const MAP2_WIDTH  = 6400;
const MAP2_HEIGHT = 960;

// ============================================================================
// CLASSE DO MAPA 2 — BLACK FOREST
// ============================================================================
export class Map2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Map2Scene' });
    }

    preload() {
        loadGameAudio(this);

        // Mapa e tilesets específicos do Mapa 2 — chaves prefixadas m2_ para não colidir com Map1
        this.load.tilemapTiledJSON('map2', assetPath('assets/TIlesetMaps/Map2/Mapa2BlackForest.tmj'));
        this.load.image('m2_ts_bg1',         assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0003_6.png'));
        this.load.image('m2_ts_bg2',         assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0005_5.png'));
        this.load.image('m2_ts_bg3',         assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0006_4.png'));
        this.load.image('m2_ts_bg4',         assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0008_3.png'));
        this.load.image('m2_ts_bg5',         assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0009_2.png'));
        this.load.image('m2_ts_bg6',         assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0000_9.png'));
        this.load.image('m2_ts_bg7',         assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0001_8.png'));
        this.load.image('m2_ts_bg8',         assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0002_7.png'));
        this.load.image('m2_ts_bg9',         assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0004_Lights.png'));
        this.load.image('m2_ts_bg10',        assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0007_Lights.png'));
        this.load.image('m2_ts_bg11',        assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0010_1.png'));
        this.load.image('m2_ts_bg12',        assetPath('assets/TIlesetMaps/Map2/tiles/Layer_0011_0.png'));
        this.load.image('m2_ts_tiles',       assetPath('assets/TIlesetMaps/Map2/tiles/Tilesheet - WOODS.png'));
        this.load.image('m2_ts_branches',    assetPath('assets/TIlesetMaps/Map2/tiles/Ramo Variados.png'));
        this.load.image('m2_ts_raming',      assetPath('assets/TIlesetMaps/Map2/tiles/RAMING.png'));
        this.load.image('m2_ts_underwater',  assetPath('assets/TIlesetMaps/Map2/tiles/Underwater.png'));
        this.load.image('m2_ts_water',       assetPath('assets/TIlesetMaps/Map2/tiles/Water.png'));
        this.load.image('m2_ts_underwater2', assetPath('assets/TIlesetMaps/Map2/tiles/Underwater2.png'));
        // Vinhas do Mapa 2 — vineG é exclusivo; vine e vine_tip são partilhados com o Mapa 1
        this.load.spritesheet('m2_ts_vineG',   assetPath('assets/TIlesetMaps/Map2/tiles/vineG.png'),   { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('m2_ts_vinetip', assetPath('assets/TIlesetMaps/tiles/vine_tip.png'),     { frameWidth: 32, frameHeight: 32 });
        this.load.image('m2_ts_vine',          assetPath('assets/TIlesetMaps/tiles/vine.png'));
        // Animações do inimigo que não são carregadas no GameScene (usadas pela máquina de estados)
        this.load.spritesheet('enemy1_idle', assetPath('assets/spritesheets/enemy/Idle.png'), { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_hurt', assetPath('assets/spritesheets/enemy/Hurt.png'), { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_dead', assetPath('assets/spritesheets/enemy/Dead.png'), { frameWidth: 128, frameHeight: 128 });
    }

    create(data) {
        const text = (key) => getText(this, key);

        this.cameras.main.setBackgroundColor('#0d1117');
        playBackgroundMusic(this);

        // ====================
        // ANIMATIONS
        // ====================
        // Animações partilhadas (gobbo + enemy1_walk/attack1)
        createGameAnimations(this);
        // Animações adicionais do inimigo para a máquina de estados do Mapa 2
        if (!this.anims.exists('enemy1_idle')) this.anims.create({ key: 'enemy1_idle', frames: this.anims.generateFrameNumbers('enemy1_idle', { start: 0, end: 4 }), frameRate: 6,  repeat: -1 });
        if (!this.anims.exists('enemy1_hurt')) this.anims.create({ key: 'enemy1_hurt', frames: this.anims.generateFrameNumbers('enemy1_hurt', { start: 0, end: 2 }), frameRate: 12, repeat: 0  });
        if (!this.anims.exists('enemy1_dead')) this.anims.create({ key: 'enemy1_dead', frames: this.anims.generateFrameNumbers('enemy1_dead', { start: 0, end: 1 }), frameRate: 3,  repeat: 0  });

        // ====================
        // GROUND
        // ====================
        const map = this.make.tilemap({ key: 'map2' });

        // Liga cada nome-no-TMJ à chave de textura — array único, Phaser ignora os não utilizados em cada layer
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
            // Os tilesets de vinha são registados para o Phaser não lançar avisos
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

        // ForeGround: ramos à frente do jogador — depth 3 (sprites=0, HP bars=5+, HUD=20+)
        const foregroundLayer = map.createLayer('ForeGround', tsAll, 0, 0);
        foregroundLayer.setDepth(3);

        // ====================
        // VINES
        // ====================
        const vines = this.physics.add.staticGroup();
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
                vines.add(zone);
            } else {
                // Em Tiled, tile objects têm y na base do sprite (não no topo)
                const sx = obj.x + obj.width  / 2;
                const sy = obj.y - obj.height / 2;
                // VinhaGrandeTile gids 8528–8531 (spritesheet 2×2 de 32×32)
                if (tileId >= 8528 && tileId <= 8531) {
                    this.add.image(sx, sy, 'm2_ts_vineG', tileId - 8528);
                // VinhaTipTile gids 8532–8535 (spritesheet 2×2 de 32×32)
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
        // pauseButtonBounds fora do ecrã — Map2 não tem botão de pausa ainda
        const dummyPauseBounds = { x: -9999, y: -9999, width: 0, height: 0 };
        this.playerController = createPlayer(this, { platformLayer, vines, pauseButtonBounds: dummyPauseBounds, text });
        // Reposiciona o jogador acima do chão (o chão do Mapa 2 está em y≈640)
        gameState.player.setPosition(100, 580);
        // Aplica o HP vindo do Mapa 1; createPlayer redefine para 100, por isso sobrepõe aqui
        if (data && data.playerHP != null) gameState.playerHP = data.playerHP;

        // ====================
        // ENEMIES
        // ====================
        // Os inimigos do Mapa 2 usam a máquina de estados completa (patrol/detect/attack/hurt/dead)
        // em vez da patrulha simples do enemy.js do Mapa 1
        gameState.enemies = this.physics.add.group();

        const spawnEnemy = (x, patrolStart, patrolEnd) => {
            const enemy = this.physics.add.sprite(x, 580, 'enemy1_walk');
            enemy.setScale(0.5);
            // setSize usa coordenadas locais (pre-escala): 60×95 local = 30×47 px em écran.
            // offsetY + bodyHeight = 128 → body.bottom alinha com o fundo do sprite.
            // offsetX centra a largura: (128-60)/2 = 34.
            enemy.body.setSize(60, 95);
            enemy.body.setOffset(34, 33);
            enemy.body.setCollideWorldBounds(true);
            enemy.patrolStart = patrolStart;
            enemy.patrolEnd   = patrolEnd;
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
            // origin(0,0.5): o x do fill é o bordo esquerdo — a barra encolhe pela direita
            enemy.hpBarFill = this.add.rectangle(x - 16, 0, 32, 4, 0xe74c3c).setOrigin(0, 0.5).setDepth(6);
            enemy.anims.play('enemy1_walk', true);
            gameState.enemies.add(enemy);
            this.physics.add.collider(enemy, platformLayer);
        };

        spawnEnemy(600,  480,  760);
        spawnEnemy(1400, 1250, 1600);
        spawnEnemy(2200, 2050, 2380);

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
            this.playerController.handleDamage();
        });

        // ====================
        // TIMER HUD
        // ====================
        // O tempo restante vem do Mapa 1; se não houver, dá 2 minutos novos
        if (!gameState.remainingTime || gameState.remainingTime <= 0) {
            gameState.timerDuration  = 120000;
            gameState.remainingTime  = 120000;
            gameState.elapsedTime    = 0;
        }
        gameState.timerText = this.add.text(320, 10, formatTimer(gameState.remainingTime, true), {
            fontSize: '18px', fill: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 1, fill: true }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);

        // ====================
        // CAMERA AND BOUNDARIES
        // ====================
        // Mapa 2: 200×30 tiles × 32px = 6400×960 px
        this.physics.world.setBounds(0, 0, MAP2_WIDTH, MAP2_HEIGHT);
        this.cameras.main.setBounds(0, 0, MAP2_WIDTH, MAP2_HEIGHT);
        this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);
        gameState.hasWon = false;

        this.events.once('shutdown', () => {
            stopMovementSounds();
        });
    }

    update(time, delta) {
        // ====================
        // TIMER
        // ====================
        gameState.remainingTime = Math.max(0, gameState.remainingTime - delta);
        gameState.elapsedTime   = gameState.timerDuration - gameState.remainingTime;
        gameState.timerText.setText(formatTimer(gameState.remainingTime, true));

        if (gameState.remainingTime <= 0) {
            stopMovementSounds();
            this.scene.start('GameOverScene');
            return;
        }

        this.playerController.update();

        // ====================
        // ENEMY AI
        // ====================
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
                // Colisão lateral tem prioridade sobre os limites de patrulha
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
    }
}