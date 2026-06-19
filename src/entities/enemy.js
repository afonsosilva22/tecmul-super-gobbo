import { gameState } from '../state.js';

const enemySpawns = [
    // Zona esquerda (x=0–800): dois inimigos a cobrir toda a secção
    { x: 280,  patrolStart: 160,  patrolEnd: 560  },  // emboscada imediata à saída do spawn
    { x: 650,  patrolStart: 480,  patrolEnd: 780  },  // guarda o final da zona esquerda
    // Zona central (x=896–2464): três inimigos — o último perto do abismo
    { x: 1100, patrolStart: 960,  patrolEnd: 1350 },
    { x: 1700, patrolStart: 1520, patrolEnd: 1900 },
    { x: 2250, patrolStart: 2060, patrolEnd: 2430 },  // beira do abismo — perigoso de combater
    // Zona direita (x=3040–3520): guarda a saída do mapa
    { x: 3250, patrolStart: 3080, patrolEnd: 3480 },
];

const spawnEnemy = (scene, platformLayer, x, patrolStart, patrolEnd) => {
    const enemy = scene.physics.add.sprite(x, 250, 'enemy1_walk');
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
    enemy.hpBarBg   = scene.add.rectangle(x, 0, 32, 4, 0x333333).setDepth(5);
    // origin(0,0.5): o x do fill é o bordo esquerdo — a barra encolhe pela direita
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
        // Não faz nada se já está morto, em hurt ou dentro do cooldown de dano
        if (enemy.hitCooldown || enemy.state === 'dead' || enemy.state === 'hurt') return;

        enemy.hp -= 1;
        enemy.hitCooldown = true;
        scene.time.delayedCall(400, () => { if (enemy.active) enemy.hitCooldown = false; });

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

    scene.physics.add.collider(gameState.player, gameState.enemies, () => playerController.handleDamage());
}

export const updateEnemies = () => {
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
