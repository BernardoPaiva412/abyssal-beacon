const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#151515',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}
let rob
let tec
const jog = new Phaser.Game(config)
function preload() {

}
function create() {
rob = this.physics.add.sprite(100, 300, null)
rob.setCollideWorldBounds(true)
tec = this.input.keyboard.createCursorKeys()
rob.setTint(0x00ff00)
}
function update() {
    rob.setVelocity(0)
    const vel = 200
    if (tec.left.isDown) {
        rob.setVelocityX(-vel)
    } if (tec.right.isDown) {
        rob.setVelocityX(vel)
    }
    if (tec.up.isDown) {
        rob.setVelocityY(-vel)
    } else if (tec.down.isDown) {
        rob.setVelocityY(vel)
    }
}