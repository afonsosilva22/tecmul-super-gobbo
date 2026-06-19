import { gameState } from '../state.js';

const enemySpawns = [
    { x: 1376,  patrolStart: 1344,  patrolEnd: 1568, y: 160  },  
    { x: 2368,  patrolStart: 2304,  patrolEnd: 2432, y: 192  },  
    { x: 1100, patrolStart: 960,  patrolEnd: 1350},
    { x: 1700, patrolStart: 1520, patrolEnd: 1900 },
    { x: 2208, patrolStart: 2080, patrolEnd: 2368, y:384 },  
    { x: 3250, patrolStart: 3080, patrolEnd: 3480 },
];

const spawnEnemy = (scene, platformLayer, x, patrolStart, patrolEnd, y = 250) => {
    const enemy = scene.physics.add.sprite(x, y, 'enemy1_walk');
    enemy.setScale(0.5);
    
    
    enemy.body.setSize(60, 95);
    enemy.body.setOffset(34, 33);
    enemy.body.setCollideWorldBounds(true);
    enemy.patrolStart = patrolStart;
    enemy.patrolEnd   = patrolEnd;
    enemy.patrolSpeed = 80;
    enemy.patrolDirection = 1;
    enemy.hp    = 3;
    enemy.maxHp = 3;
    enemy.hitCooldown = false;
    enemy.state = 'patrol';
    // Barra de vida 
    enemy.hpBarBg   = scene.add.rectangle(x, 0, 32, 4, 0x333333).setDepth(5);
    enemy.hpBarFill = scene.add.rectangle(x - 16, 0, 32, 4, 0xe74c3c).setOrigin(0, 0.5).setDepth(6);
    enemy.anims.play('enemy1_walk', true);

    gameState.enemies.add(enemy);
    scene.physics.add.collider(enemy, platformLayer);
}

export const createEnemies = (scene, platformLayer, playerController) => {
    gameState.enemies = scene.physics.add.group();

    enemySpawns.forEach(({ x, patrolStart, patrolEnd, y }) => {
        spawnEnemy(scene, platformLayer, x, patrolStart, patrolEnd, y);
    });

    scene.physics.add.overlap(gameState.attackHitbox, gameState.enemies, (hitbox, enemy) => {
        if (enemy.hitCooldown || enemy.state === 'dead' || enemy.state === 'hurt') return;

        enemy.hp -= 1;
        enemy.hitCooldown = true;
        scene.time.delayedCall(400, () => { if (enemy.active) enemy.hitCooldown = false; });

        if (enemy.hp <= 0) {
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

    scene.physics.add.collider(gameState.player, gameState.enemies, () => playerController.handleDamage());
}

export const updateEnemies = () => {
    gameState.enemies.getChildren().forEach(enemy => {
        if (enemy.state === 'dead') return;

        if (enemy.state === 'hurt') {
            const barY = enemy.y - 30;
            enemy.hpBarBg.setPosition(enemy.x, barY);
            enemy.hpBarFill.setPosition(enemy.x - 16, barY);
            return;
        }

        const dx = Math.abs(gameState.player.x - enemy.x);
        const dy = Math.abs(gameState.player.y - enemy.y);

        if (dx < 55 && dy < 36) {
            // Alcance de ataque
            enemy.body.setVelocityX(0);
            enemy.setFlipX(gameState.player.x < enemy.x);
            if (enemy.state !== 'attack') {
                enemy.state = 'attack';
                enemy.anims.play('enemy1_attack1', true);
                enemy.once('animationcomplete-enemy1_attack1', () => {
                    if (enemy.active && enemy.state === 'attack') enemy.state = 'patrol';
                });
            }
        } else if (dx < 300 && dy < 100) {
            // Alcance de perseguição
            if (enemy.state === 'attack') {
                enemy.state = 'patrol';
                enemy.off('animationcomplete-enemy1_attack1');
            }
            enemy.state = 'chase';
            const chaseDir = gameState.player.x < enemy.x ? -1 : 1;
            enemy.body.setVelocityX(120 * chaseDir);
            enemy.setFlipX(chaseDir === -1);
            enemy.anims.play('enemy1_walk', true);
        } else {
            if (enemy.state === 'attack') {
                enemy.state = 'patrol';
                enemy.off('animationcomplete-enemy1_attack1');
            } else if (enemy.state === 'chase') {
                enemy.state = 'patrol';
            }
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

        const barY = enemy.y - 30;
        enemy.hpBarBg.setPosition(enemy.x, barY);
        enemy.hpBarFill.setPosition(enemy.x - 16, barY);
        enemy.hpBarFill.setSize((enemy.hp / enemy.maxHp) * 32, 4);
    });
}
