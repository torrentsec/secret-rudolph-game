import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameOverText: Phaser.GameObjects.Text;
  gameScoreText: Phaser.GameObjects.Text;

  constructor() {
    super("GameOver");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xff0000);

    this.background = this.make.image({
      x: 182,
      y: this.scene.systems.scale.height / 2,
      key: "background",
      scale: { x: 1.1, y: 1.1 },
    });

    this.gameOverText = this.add
      .text(182, this.scene.systems.scale.height / 2 - 30, "Game Over", {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.gameScoreText = this.add
      .text(
        182,
        this.scene.systems.scale.height / 2 + 30,
        `Your Score: ${this.registry?.gameScore}`,
        {
          fontFamily: "Arial Black",
          fontSize: 30,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 8,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("MainMenu");
  }
}
