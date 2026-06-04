const gameState = {}

function preload() {

    this.load.spritesheet('idle', 'assets/Gobbo_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('walk', 'assets/Gobbo_Walk_6.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('sprint', 'assets/Gobbo_Run_6.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('jump', 'assets/Gobbo_Jump_8.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('climb', 'assets/Gobbo_Climb_4.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('push', 'assets/Gobbo_Push_6.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('punch', 'assets/Gobbo_Punch_4.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {

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

    this.anims.create({
        key: 'climb',
        frames: this.anims.generateFrameNumbers('climb', {
            start: 0,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'push',
        frames: this.anims.generateFrameNumbers('push', { 
            start: 0, 
            end: 5 }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'punch',
        frames: this.anims.generateFrameNumbers('punch', {
            start: 0,
            end: 3
        }),
        frameRate: 12,
        repeat: 0
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
    // VINES
    // ====================
    // Create a static group for vines (no physics engine collisions, just tracking positions)
    gameState.vines = this.physics.add.staticGroup();

    // Let's place 5 long, dark green vines hanging down from platforms or mid-air
    for (let i = 0; i < 5; i++) {
        const vineX = Phaser.Math.Between(500, 2500);
        const vineY = 200; // mid-air
        const vineWidth = 30;
        const vineHeight = 240; // long vine

        // 0x1a4314 is a dark forest green
        const vine = this.add.rectangle(vineX, vineY, vineWidth, vineHeight, 0x1a4314);
        gameState.vines.add(vine);
    }

        // ====================
    // PUSHABLE BOXES
    // ====================
    gameState.boxes = this.physics.add.group();

    const boxPositions = [600, 900, 1200, 1600, 2000];
    for (let i = 0; i < boxPositions.length; i++) {
        const box = this.add.rectangle(
            boxPositions[i],
            310,          // sits on ground
            24, 24,       // width, height
            0x7a3b0a      // dark brown
        );
        this.physics.add.existing(box);
        box.body.setCollideWorldBounds(true);
        box.body.setDragX(400);   // friction — box slows to a stop
        box.body.setMaxVelocityX(200);
        box.body.setBounce(0.1);  // very slight bounce
        box.body.setMass(2);      // heavier than player push force
        gameState.boxes.add(box);
    }

    // ====================
    // BREAKABLE BOXES
    // ====================
    gameState.breakableBoxes = this.physics.add.staticGroup();

    const breakablePositions = [750, 1100, 1450, 1850];
    for (let i = 0; i < breakablePositions.length; i++) {
        const box = this.add.rectangle(
            breakablePositions[i],
            318, 24, 24,
            0xff3333 // red
        );

        this.physics.add.existing(box, true); // static
        box.hp = 3;
        gameState.breakableBoxes.add(box);
    }

    // ====================
    // ADDING OBSTACLES
    // ====================
    // Create a static group to hold all our environment blocks
    gameState.platforms = this.physics.add.staticGroup();

    // Generate 15 random platforms across the 3000px wide world
    for (let i = 0; i < 15; i++) {
        // Generate random coordinates (avoiding the starting area)
        const randomX = Phaser.Math.Between(400, 2800);
        const randomY = Phaser.Math.Between(150, 280);
        const randomWidth = Phaser.Math.Between(60, 150);
    
        // Create a visual rectangle block
        const block = this.add.rectangle(randomX, randomY, randomWidth, 20, 0x7a5230);
    
        // Add it to our physics group so the player can land on it
        gameState.platforms.add(block);
    }

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
    // COLLISIONS
    // ====================
    this.physics.add.collider(
        gameState.player, 
        gameState.ground
    );
    
    this.physics.add.collider(
        gameState.player, 
        gameState.platforms
    );

    this.physics.add.overlap(gameState.player, gameState.vines, () => {
        gameState.onVine = true;
    });

    // Box collides with ground and platforms
    this.physics.add.collider(gameState.boxes, gameState.ground);
    this.physics.add.collider(gameState.boxes, gameState.platforms);

    // Boxes collide with each other (so they stack / push each other)
    this.physics.add.collider(gameState.boxes, gameState.boxes);

    this.physics.add.collider(gameState.player, gameState.boxes, () => {
        gameState.pushingBox = true;
    });

    this.physics.add.collider(gameState.player, gameState.breakableBoxes);
    this.physics.add.collider(gameState.boxes, gameState.breakableBoxes);

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

    gameState.punchKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    gameState.isPunching = false;
    gameState.punchCooldown = 0;
}

function update() {

    const player = gameState.player;

    const walkSpeed = 170;
    const sprintSpeed = 260;
    const isSprinting = gameState.shiftKey.isDown;
    
    
    const jumpPower = -300;
    const onGround = player.body.touching.down;

    const climbUpSpeed = -100;
    const climbDownSpeed = 100;
    const touchingVine = gameState.onVine;
    gameState.onVine = false; // reset for next frame

    const isPushing = gameState.pushingBox;
    gameState.pushingBox = false; // reset for next frame

    const speed = isSprinting ? sprintSpeed : isPushing ? walkSpeed * 0.75 : walkSpeed;

    // Tick down punch cooldown
    if (gameState.punchCooldown > 0) gameState.punchCooldown--;

    // Trigger punch
    if (Phaser.Input.Keyboard.JustDown(gameState.punchKey)) {
        doPunch(this);
    }

    // ====================
    // CLIMBING LOGIC
    // ====================
    let isClimbing = false; // Track if climbing logic is active

    if (touchingVine && gameState.cursors.up.isDown) {
        player.body.setAllowGravity(false);
        player.body.setVelocityY(climbUpSpeed);
        player.anims.play('climb', true); 
        isClimbing = true;
    } else if (touchingVine && gameState.cursors.down.isDown) {
        player.body.setAllowGravity(false);
        player.body.setVelocityY(climbDownSpeed);
        player.anims.play('climb', true); 
        isClimbing = true;
    } else if (touchingVine && !onGround) {
        player.body.setAllowGravity(false);
        player.body.setVelocityY(0); 
        player.anims.play('climb', true);
        isClimbing = true;
    } else {
        player.body.setAllowGravity(true);
    }

    // ====================
    // MOVEMENT
    // ====================
    if (gameState.cursors.left.isDown) {
        player.body.setVelocityX(-speed);
        player.setFlipX(true);

        if (!isClimbing && !gameState.isPunching) {
            if (!onGround) {
                player.anims.play('jump', true);
            } else if (isPushing) {
                player.anims.play('push', true);
            } else if (isSprinting) {
                player.anims.play('sprint', true);
            } else {
                player.anims.play('walk', true);
            }
        }
    } else if (gameState.cursors.right.isDown) {
        player.body.setVelocityX(speed);
        player.setFlipX(false);

        if (!isClimbing && !gameState.isPunching) {
            if (!onGround) {
                player.anims.play('jump', true);
            } else if (isPushing) {
                player.anims.play('push', true);
            } else if (isSprinting) {
                player.anims.play('sprint', true);
            } else {
                player.anims.play('walk', true);
            }
        }
    } else {
        player.body.setVelocityX(0);
        
        if (!isClimbing && !gameState.isPunching) {
            if (!onGround) {
                player.anims.play('jump', true);
            } else {
                player.anims.play('idle', true);
            }
        }
    }

    // ====================
    // JUMP
    // ====================
    if (gameState.cursors.up.isDown && onGround) {
        player.body.setVelocityY(jumpPower);
    }

    gameState.boxes.getChildren().forEach(box => {
        box.body.setVelocityX(box.body.velocity.x * 0.75);
    });
}

function doPunch(scene) {
    if (gameState.isPunching || gameState.punchCooldown > 0) return;

    gameState.isPunching = true;
    gameState.punchCooldown = 40; // frames before you can punch again

    const player = gameState.player;
    player.anims.play('punch', true);

    // Hitbox appears in front of the player
    const facing = player.flipX ? -1 : 1;
    const hitX = player.x + facing * 20;
    const hitY = player.y;

    // Check all breakable boxes for overlap with the hitbox
    gameState.breakableBoxes.getChildren().forEach(box => {
        const dist = Phaser.Math.Distance.Between(hitX, hitY, box.x, box.y);
        if (dist < 28) {
            box.hp -= 1;

            // Flash white
            box.setFillStyle(0xffffff);
            scene.time.delayedCall(80, () => {
                if (box.active) box.setFillStyle(0xff3333);
            });

            if (box.hp <= 0) {
                box.destroy();
            }
        }
    });

    // After animation ends, clear punching state
    player.once('animationcomplete-punch', () => {
        gameState.isPunching = false;
    });
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
