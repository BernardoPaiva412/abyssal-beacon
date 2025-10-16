/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#151515',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x:0, y: 0 },
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
let rea
let ini
let invi
let gaov = false
const jog = new Phaser.Game(config)
function preload() {
    
}
function create() {
rob = this.physics.add.sprite(100, 300, null)
rob.setCollideWorldBounds(true)
rob.setTint(0x00ff00)
rea = this.physics.add.sprite(400, 300, null)
rea.body.setCircle(25)
rea.setImmovable(true)
rea.setVisible(false)
let revi = this.add.graphics({ fillStyle: { color: 0xffffff } })
revi.fillCircle(rea.x, rea.y, 25)
ini = this.physics.add.sprite(750, 100, null)
ini.body.setCircle(15)
ini.setVisible(false)
invi = this.add.graphics({ fillStyle: { color: 0xff0000}})
invi.fillCircle(ini.x, ini.y, 15)
ini.setData('visual', invi)
tec = this.input.keyboard.createCursorKeys()
this.physics.add.collider(ini, rea, dere, null, this)
}
function update() {
    if (gaov) {
        return
    }
    const vero = 200
    rob.setVelocity(0)
    if (tec.left.isDown) {
        rob.setVelocityX(-vero)
    } else if (tec.right.isDown) {
        rob.setVelocityX(vero)
    }
    if (tec.up.isDown) {
        rob.setVelocityY(-vero)
    } else if (tec.down.isDown) {
        rob.setVelocityY(vero)
    }
    this.physics.moveToObject(ini, rea, 60)
    invi = ini.getData('visual')
    invi.clear()
    invi.fillCircle(ini.x, ini.y, 15)
}
/**
 * Função chamada quando o inimigo colide com o reator.
 * @param {Phaser.Physics.Arcade.Sprite} a - Primeiro objeto.
 * @param {Phaser.Physics.Arcade.Sprite} b - Segundo objeto.
 */
function dere(a, b) {
    gaov = true
    a.disableBody(true, true)
    this.add.text(400, 300, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000'
    }).setOrigin(0.5)
    this.physics.pause()
    rob.clearTint().setTint(0xff0000)
}