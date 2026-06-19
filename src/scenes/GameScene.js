import { createEnemies, updateEnemies } from '../entities/enemy.js';
import { createPlayer } from '../entities/player.js';
import { gameState } from '../state.js';
import { createGameAnimations } from '../utils/animations.js';
import { assetPath } from '../utils/assets.js';
import { loadGameAudio, playBackgroundMusic, stopMovementSounds } from '../utils/audio.js';
import { getText } from '../utils/text.js';
import { formatTimer } from '../utils/time.js';

const MAP_WIDTH = 3520;
const MAP_HEIGHT = 640;

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        loadGameAudio(this);

        this.load.spritesheet('idle', assetPath('assets/spritesheets/gobbo/Gobbo_Idle_4.png'), { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('walk', assetPath('assets/spritesheets/gobbo/Gobbo_Walk_6.png'), { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('sprint', assetPath('assets/spritesheets/gobbo/Gobbo_Run_6.png'), { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('jump', assetPath('assets/spritesheets/gobbo/Gobbo_Jump_8.png'), { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('climb', assetPath('assets/spritesheets/gobbo/Gobbo_Climb_4.png'), { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('attack1', assetPath('assets/spritesheets/gobbo/Gobbo_Attack1.png'), { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet('attack2', assetPath('assets/spritesheets/gobbo/Gobbo_Attack2.png'), { frameWidth: 42, frameHeight: 42 });
        this.load.spritesheet('enemy1_walk',    assetPath('assets/spritesheets/enemy/enemy1_walk.png'),    { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_attack1', assetPath('assets/spritesheets/enemy/enemy1_attack1.png'), { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_idle',    assetPath('assets/spritesheets/enemy/Idle.png'),           { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_hurt',    assetPath('assets/spritesheets/enemy/Hurt.png'),           { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy1_dead',    assetPath('assets/spritesheets/enemy/Dead.png'),           { frameWidth: 128, frameHeight: 128 });

        this.load.tilemapTiledJSON('map', assetPath('assets/TIlesetMaps/Map1/Mapa1.tmj'));
        this.load.image('tiles_darkforest', assetPath('assets/TIlesetMaps/tiles/Tilesheet - WOODS.png'));
        this.load.image('bg_deco', assetPath('assets/TIlesetMaps/tiles/BACKGROUND.png'));
        this.load.image('bg_bush', assetPath('assets/TIlesetMaps/tiles/BUSH - BACKGROUND.png'));
        this.load.image('bg_forest', assetPath('assets/TIlesetMaps/tiles/WOODS - Second.png'));
        this.load.image('bg_forest2', assetPath('assets/TIlesetMaps/tiles/WOODS - Third.png'));
        this.load.image('vine', assetPath('assets/TIlesetMaps/tiles/vine.png'));
        this.load.spritesheet('vine_tip', assetPath('assets/TIlesetMaps/tiles/vine_tip.png'), { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('vine2', assetPath('assets/TIlesetMaps/tiles/vine2.png'), { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const text = (key) => getText(this, key);

        playBackgroundMusic(this);
        this.input.once('pointerdown', () => playBackgroundMusic(this));
        this.cameras.main.setBackgroundColor('#b9eaff');
        createGameAnimations(this);

        const { platformLayer, vines } = this.createMap();
        const pauseButton = this.createPauseButton(text);

        this.playerController = createPlayer(this, {
            platformLayer,
            vines,
            pauseButtonBounds: pauseButton.bounds,
            text
        });
        createEnemies(this, platformLayer, this.playerController);

        this.createTimerHud();
        this.configureWorld();

        this.events.on('resume', () => {
            this.playerController.refreshLabels();
            pauseButton.refreshLabel();
        });

        this.events.once('shutdown', () => {
            stopMovementSounds();
        });
    }

    createMap() {
        const map = this.make.tilemap({ key: 'map' });
        const tsDarkForest = map.addTilesetImage('Tiles_DarkForest', 'tiles_darkforest');
        const tsBGDeco = map.addTilesetImage('background_deco', 'bg_deco');
        const tsBGBush = map.addTilesetImage('backgroundBush', 'bg_bush');
        const tsBGForest = map.addTilesetImage('backgroundforest', 'bg_forest');
        const tsBGForest2 = map.addTilesetImage('backgroundforest2', 'bg_forest2');
        const tsDarkForest2 = map.addTilesetImage('Tiles_DarkForest_2', 'tiles_darkforest');
        const tsBGDeco2 = map.addTilesetImage('background_deco_2', 'bg_deco');
        const tsBGForest3 = map.addTilesetImage('backgroundforest_3', 'bg_forest');

        map.createLayer('Background', [tsDarkForest, tsBGDeco, tsDarkForest2, tsBGDeco2], 0, 0);
        map.createLayer('backgroundForest', [tsBGForest, tsBGForest3], 0, 0);
        map.createLayer('BackgroundBush', tsBGBush, 0, 0);

        const platformLayer = map.createLayer('Plataforma', tsDarkForest, 0, 0);
        platformLayer.setCollisionByExclusion([-1]);

        return {
            platformLayer,
            vines: this.createVines(map)
        };
    }

    createVines(map) {
        const vines = this.physics.add.staticGroup();
        const vineObjectLayer = map.getObjectLayer('VinhasCamada');

        vineObjectLayer.objects.forEach(obj => {
            const tileId = obj.gid ? (obj.gid & 0x0FFFFFFF) : null;

            if (!tileId) {
                const zone = this.add.rectangle(
                    obj.x + obj.width / 2,
                    obj.y + obj.height / 2,
                    obj.width,
                    obj.height
                );
                vines.add(zone);
                return;
            }

            const sx = obj.x + obj.width / 2;
            const sy = obj.y - obj.height / 2;

            if (tileId === 577) {
                this.add.image(sx, sy, 'vine');
            } else if (tileId >= 578 && tileId <= 581) {
                this.add.image(sx, sy, 'vine_tip', tileId - 578);
            } else if (tileId >= 582 && tileId <= 585) {
                this.add.image(sx, sy, 'vine2', tileId - 582);
            }
        });

        return vines;
    }

    createTimerHud() {
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
    }

    createPauseButton(text) {
        gameState.isPaused = false;

        const bounds = { x: 590, y: 20, width: 82, height: 28 };
        const graphics = this.add.graphics().setScrollFactor(0).setDepth(20);
        const drawButton = (color) => {
            graphics.clear();
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(
                bounds.x - bounds.width / 2,
                bounds.y - bounds.height / 2,
                bounds.width,
                bounds.height,
                8
            );
        };

        drawButton(0x333333);

        const label = this.add.text(bounds.x, bounds.y, text('pause'), {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        this.add.zone(bounds.x, bounds.y, bounds.width, bounds.height)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(22)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                gameState.isPaused = true;
                stopMovementSounds();
                this.scene.launch('PauseScene');
                this.scene.pause();
            })
            .on('pointerover', () => {
                drawButton(0x777777);
                label.setStyle({ fill: '#000000' });
            })
            .on('pointerout', () => {
                drawButton(0x333333);
                label.setStyle({ fill: '#ffffff' });
            });

        return {
            bounds,
            refreshLabel: () => label.setText(text('pause'))
        };
    }

    configureWorld() {
        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);
        gameState.mapRightEdge = MAP_WIDTH;
        gameState.hasWon = false;
    }

    update(time, delta) {
        gameState.remainingTime = Math.max(0, gameState.remainingTime - delta);
        gameState.elapsedTime = gameState.timerDuration - gameState.remainingTime;
        gameState.timerText.setText(formatTimer(gameState.remainingTime, true));

        if (gameState.remainingTime <= 0) {
            stopMovementSounds();
            this.scene.start('GameOverScene');
            return;
        }

        if (!gameState.hasWon && gameState.player.body.right >= gameState.mapRightEdge - 1) {
            gameState.hasWon = true;
            stopMovementSounds();
            // Transição para o Mapa 2 — passa o HP actual para o jogador não começar cheio
            this.scene.start('Map2Scene', { playerHP: gameState.playerHP });
            return;
        }

        this.playerController.update();
        updateEnemies();
    }
}
