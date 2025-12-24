import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
  background!: GameObjects.Image;
  title!: GameObjects.Text;
  item!: GameObjects.Group;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.background = this.make.image({
      x: 182,
      y: this.scene.systems.scale.height / 2,
      key: "background",
      scale: { x: 1.1, y: 1.1 },
    });

    this.title = this.add
      .text(182, this.scene.systems.scale.height / 2, "Click to Start", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.title.setInteractive().on("pointerdown", () => {
      this.changeScene();
    });

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("RudolphGame");
  }
}
