export default class Dude extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene);

        this.dude = this.scene.physics.add.sprite(100, 450, "dude");
        this.dude.setCollideWorldBounds(true);
        this.scene.physics.add.collider(this.dude, this.scene.platforms);
        // console.log(this.scene, "<<< scene");
        // console.log(this.dude, "<<< dude");
    }
}

