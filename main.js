const gameState = {}

function preload() {

    this.load.spritesheet('idle', 'assets/Gobbo_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('walk', 'assets/Gobbo_Walk_6.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('sprint', 'assets/Gobbo_Run_6.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('jump', 'assets/Gobbo_Jump_8.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {

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
    // COLLISIONS
    // ====================
    this.physics.add.collider(
        gameState.player, 
        gameState.ground
    );    

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

function update() {

    const player = gameState.player;

    const walkSpeed = 170;
    const sprintSpeed = 260;
    const isSprinting = gameState.shiftKey.isDown;
    const speed = isSprinting ? sprintSpeed : walkSpeed;
    
    const jumpPower = -300;
    const onGround = player.body.touching.down;

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

    scene: {
		preload,
		create,
		update
	}
}

const game = new Phaser.Game(config)
