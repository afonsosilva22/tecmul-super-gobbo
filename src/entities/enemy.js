import { gameState } from '../state.js';

const enemySpawns = [
    { x: 600, patrolStart: 480, patrolEnd: 760 },
    { x: 1200, patrolStart: 1050, patrolEnd: 1380 },
    { x: 1800, patrolStart: 1650, patrolEnd: 1980 }
];

const spawnEnemy = (scene, platformLayer, x, patrolStart, patrolEnd) => {
    const enemy = scene.physics.add.sprite(x, 250, 'enemy1_walk');
    enemy.setScale(0.5);
    enemy.body.setSize(60, 95);
    enemy.body.setOffset(34, 33);
    enemy.body.setCollideWorldBounds(true);
    enemy.patrolStart = patrolStart;
    enemy.patrolEnd = patrolEnd;
    enemy.patrolSpeed = 80;
    enemy.patrolDirection = 1;
    enemy.hp = 3;
    enemy.maxHp = 3;
    enemy.hitCooldown = false;
    enemy.hpBarBg = scene.add.rectangle(x, 0, 32, 4, 0x333333).setDepth(5);
    enemy.hpBarFill = scene.add.rectangle(x - 16, 0, 32, 4, 0xe74c3c).setOrigin(0, 0.5).setDepth(6);
    enemy.anims.play('enemy1_walk', true);

    gameState.enemies.add(enemy);
    scene.physics.add.collider(enemy, platformLayer);
}

export const createEnemies = (scene, platformLayer, playerController) => {
    gameState.enemies = scene.physics.add.group();

    enemySpawns.forEach(({ x, patrolStart, patrolEnd }) => {
        spawnEnemy(scene, platformLayer, x, patrolStart, patrolEnd);
    });

    scene.physics.add.overlap(gameState.attackHitbox, gameState.enemies, (hitbox, enemy) => {
        if (enemy.hitCooldown) return;

        enemy.hp -= 1;
        enemy.hitCooldown = true;
        scene.time.delayedCall(400, () => {
            if (enemy.active) enemy.hitCooldown = false;
        });

        if (enemy.hp <= 0) {
            enemy.hpBarBg.destroy();
            enemy.hpBarFill.destroy();
            enemy.destroy();
        }
    });

    scene.physics.add.collider(gameState.player, gameState.enemies, () => playerController.handleDamage());
}

export const updateEnemies = () => {
    gameState.enemies.getChildren().forEach(enemy => {
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

        const barY = enemy.y - 30;
        enemy.hpBarBg.setPosition(enemy.x, barY);
        enemy.hpBarFill.setPosition(enemy.x - 16, barY);
        enemy.hpBarFill.setSize((enemy.hp / enemy.maxHp) * 32, 4);
    });
}
