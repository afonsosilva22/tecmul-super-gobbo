const gameState = {}

function preload() {

}

function create() {
    // PLAYER
    gameState.player = this.add.rectangle(
        100, // x
        100, // y
        20, // width
        20, // height
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
}

function update() {

}

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
	backgroundColor: "b9eaff",

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
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
