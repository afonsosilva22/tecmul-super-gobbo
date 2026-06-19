import { gameState } from '../state.js';
import { stopMovementSounds } from '../utils/audio.js';

const updateAttackHitbox = () => {
    if (gameState.isAttacking) {
        const dir = gameState.player.flipX ? -1 : 1;
        gameState.attackHitbox.x = gameState.player.x + dir * 32;
        gameState.attackHitbox.y = gameState.player.y;
        gameState.attackHitbox.body.enable = true;
    } else {
        gameState.attackHitbox.body.enable = false;
    }
}

const updateHpBar = () => {
    const hpPct = Math.max(0, gameState.playerHP / gameState.playerMaxHP);
    gameState.hpBarFill.setSize(80 * hpPct, 8);

    if (hpPct > 0.66) {
        gameState.hpBarFill.setFillStyle(0x2ecc71);
    } else if (hpPct > 0.33) {
        gameState.hpBarFill.setFillStyle(0xf39c12);
    } else {
        gameState.hpBarFill.setFillStyle(0xe74c3c);
    }
}

const playAttack = (scene, pointer, onGround) => {
    const isLeftAttack = pointer.leftButtonDown();
    const isRightAttack = pointer.rightButtonDown();
    if (!isLeftAttack && !isRightAttack) return;

    gameState.isAttacking = true;
    stopMovementSounds();
    gameState.swordFX.play();

    if (onGround) {
        gameState.player.body.setVelocity(0, 0);
        gameState.player.body.setAllowGravity(false);
        gameState.player.body.setImmovable(true);
    }

    const animationKey = isLeftAttack ? 'attack1' : 'attack2';
    gameState.player.body.setOffset(5, 5);
    gameState.player.anims.play(animationKey, true);

    gameState.player.once(`animationcomplete-${animationKey}`, () => {
        gameState.isAttacking = false;
        gameState.player.body.setAllowGravity(true);
        gameState.player.body.setImmovable(false);
        gameState.player.body.setOffset(0, 0);
    });
}

const handleMovement = () => {
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

    if (gameState.isAttacking) {
        stopMovementSounds();
        return;
    }

    if (touchingVine && gameState.cursors.up.isDown) {
        stopMovementSounds();
        player.body.setAllowGravity(false);
        player.body.setVelocityY(climbSpeed);
        player.anims.play('walk', true);
    } else if (touchingVine && !onGround) {
        stopMovementSounds();
        player.body.setAllowGravity(false);
        player.body.setVelocityY(0);
        player.anims.play('idle', true);
    } else {
        player.body.setAllowGravity(true);
    }

    if (gameState.cursors.left.isDown) {
        player.body.setVelocityX(-speed);
        player.setFlipX(true);

        if (!onGround) {
            stopMovementSounds();
            player.anims.play('jump', true);
        } else if (isSprinting) {
            gameState.walkSound.stop();
            if (!gameState.sprintSound.isPlaying) gameState.sprintSound.play();
            player.anims.play('sprint', true);
        } else {
            gameState.sprintSound.stop();
            if (!gameState.walkSound.isPlaying) gameState.walkSound.play();
            player.anims.play('walk', true);
        }
    } else if (gameState.cursors.right.isDown) {
        player.body.setVelocityX(speed);
        player.setFlipX(false);

        if (!onGround) {
            stopMovementSounds();
            player.anims.play('jump', true);
        } else if (isSprinting) {
            gameState.walkSound.stop();
            if (!gameState.sprintSound.isPlaying) gameState.sprintSound.play();
            player.anims.play('sprint', true);
        } else {
            gameState.sprintSound.stop();
            if (!gameState.walkSound.isPlaying) gameState.walkSound.play();
            player.anims.play('walk', true);
        }
    } else {
        stopMovementSounds();
        player.body.setVelocityX(0);
        player.anims.play(onGround ? 'idle' : 'jump', true);
    }

    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.up) && onGround) {
        stopMovementSounds();
        gameState.jumpFX.play();
        player.body.setVelocityY(jumpPower);
    }
}

const handleDamage = (scene) => {
    if (gameState.isAttacking || gameState.playerInvincible) return;

    gameState.playerHP -= 34;
    gameState.playerInvincible = true;

    scene.tweens.add({
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
        stopMovementSounds();
        scene.scene.start('GameOverScene');
    }
}

export const createPlayer = (scene, { platformLayer, vines, pauseButtonBounds, text }) => {
    gameState.player = scene.physics.add.sprite(100, 300, 'idle');
    gameState.player.body.setCollideWorldBounds(true);
    gameState.player.body.setSize(32, 32);
    gameState.player.body.setOffset(0, 0);

    scene.physics.add.collider(gameState.player, platformLayer);

    gameState.onVine = false;
    scene.physics.add.overlap(gameState.player, vines, () => {
        gameState.onVine = true;
    });

    gameState.attackHitbox = scene.add.rectangle(0, 0, 40, 28);
    scene.physics.add.existing(gameState.attackHitbox, false);
    gameState.attackHitbox.body.allowGravity = false;
    gameState.attackHitbox.body.enable = false;

    gameState.walkSound = scene.sound.add('walkSound', { loop: true, volume: gameState.effectsVolume });
    gameState.sprintSound = scene.sound.add('sprintSound', { loop: true, volume: gameState.effectsVolume });
    gameState.jumpFX = scene.sound.add('jumpFX', { volume: gameState.effectsVolume });
    gameState.swordFX = scene.sound.add('swordFX', { volume: gameState.effectsVolume });

    gameState.playerMaxHP = 100;
    gameState.playerHP = 100;
    gameState.playerInvincible = false;
    gameState.isAttacking = false;

    gameState.hpLabel = scene.add.text(10, 10, text('hp'), { fontSize: '9px', fill: '#ffffff', fontFamily: 'monospace' })
        .setScrollFactor(0).setDepth(20);
    scene.add.rectangle(75, 16, 84, 10, 0x333333)
        .setScrollFactor(0).setDepth(20);
    gameState.hpBarFill = scene.add.rectangle(35, 16, 80, 8, 0x2ecc71)
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(21);

    gameState.cursors = scene.input.keyboard.createCursorKeys();
    gameState.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    scene.input.mouse.disableContextMenu();

    scene.input.on('pointerdown', (pointer) => {
        if (gameState.isPaused) return;
        if (
            pointer.x >= pauseButtonBounds.x - pauseButtonBounds.width / 2 &&
            pointer.x <= pauseButtonBounds.x + pauseButtonBounds.width / 2 &&
            pointer.y >= pauseButtonBounds.y - pauseButtonBounds.height / 2 &&
            pointer.y <= pauseButtonBounds.y + pauseButtonBounds.height / 2
        ) return;

        if (!gameState.isAttacking) {
            playAttack(scene, pointer, gameState.player.body.blocked.down);
        }
    });

    return {
        handleDamage: () => handleDamage(scene),
        refreshLabels: () => gameState.hpLabel.setText(text('hp')),
        update: () => {
            updateAttackHitbox();
            updateHpBar();
            handleMovement();
        }
    };
}
