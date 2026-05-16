const gameState = {}

function preload() {

}

function create() {

    // PLAYER
    gameState.player = this.add.rectangle(
        100, // x
        300, // y
        20, // width
        40, // height
        0xff0000 // color
    );
    this.physics.add.existing(gameState.player);
    gameState.player.body.setCollideWorldBounds(true);

    // GROUND
    gameState.ground = this.add.rectangle(
        320, // x
        340, // y
        640, // width
        40, // height
        0x00ff00 // color
    );
    this.physics.add.existing(gameState.ground, true);

    // COLLISIONS
    this.physics.add.collider(
        gameState.player, 
        gameState.ground
    );

    // INPUT
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
}

function update() {

    const player = gameState.player;

    const walkSpeed = 170;
    const sprintSpeed = 260;
    const speed = gameState.shiftKey.isDown ? sprintSpeed : walkSpeed;
    
    const jumpPower = -200;
    const onGround = player.body.touching.down;

    // MOVEMENT
    if (gameState.cursors.left.isDown) {
        player.body.setVelocityX(-speed);
    } else if (gameState.cursors.right.isDown) {
        player.body.setVelocityX(speed);
    } else {
        player.body.setVelocityX(0);
    }

    // JUMP
    if (gameState.cursors.up.isDown && onGround) {
        player.body.setVelocityY(jumpPower);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
	backgroundColor: "b9eaff",

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 290},
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
