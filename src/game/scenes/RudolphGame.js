import Phaser from "phaser";
import { tempItems, items } from "../items.ts";
import { EventBus } from "../EventBus.ts";

const GAME_PLAY_TIME = 7000;
const GAME_WIDTH = 365;
const GAME_HEIGHT = 500;

export class RudolphGame extends Phaser.Scene {
  constructor() {
    super("RudolphGame");

    // game objects & images
    this.player;
    this.stars;
    this.bombs;
    this.platforms;
    this.background;

    // Inputs
    this.leftKey;
    this.rightKey;

    // this.title;
    this.score = 0;
    this.scoreText;

    this.remainingTimeText;
    this.gameTimer;
    this.gameOver = false;
    this.starSpawnId = null;
    this.bombSpawnId = null;

    this.likedItems = new Set();
    this.dislikedItems = new Set();
    this.likedItemsSize = 0;
    this.dislikedItemsSize = 0;
  }

  generateRandomInteger(min, max) {
    return min + Math.floor(Math.random() * max);
  }

  collectStar(player, star) {
    star.disableBody(true, true);

    player.preFX.addGlow(0x00b90c); // green
    this.time.delayedCall(300, () => player.preFX?.clear());

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    this.likedItems.add(star.name);
  }

  itemHitsPlatform(platforms, item) {
    item.disableBody(true, true);
  }

  bombHitsPlayer(player, bomb) {
    this.score -= 5;
    this.scoreText.setText("Score: " + this.score);
    bomb.disableBody(true, true);
    player.preFX.addGlow(0xff0000); // red
    this.time.delayedCall(300, () => player.preFX.clear());

    this.dislikedItems.add(bomb.name);
  }

  spawnLikedItems(x, items = []) {
    const itemList = items.length > 0 ? items : ["star", "ring", "cash"];
    const item = itemList[this.generateRandomInteger(0, itemList.length)];

    let star = this.stars.create(x, 16, item);
    star.name = item;
    star.setDisplaySize(25, 25);
    star.setCollideWorldBounds(true);

    const DROP_SPEED = 50;
    star.setVelocity(0, DROP_SPEED);
  }

  spwanBomb(x, items = []) {
    const itemList = items.length > 0 ? items : ["star", "ring", "cash"];
    const item = itemList[this.generateRandomInteger(0, itemList.length)];

    let bomb = this.bombs.create(x, 16, item);
    bomb.name = item;
    bomb.setCollideWorldBounds(true);
    bomb.setDisplaySize(25, 25);

    const DROP_SPEED = 50; // bigger the value, faster drop
    bomb.setVelocity(0, DROP_SPEED);
  }

  handleGameOver() {
    this.player.stop();
    this.gameTimer.destroy();
    this.remainingTimeText.setText("Remaining time: 0s");

    this.starSpawnId.destroy();
    this.bombSpawnId.destroy();

    // this.gameOver = true;
    // this.game.pause(); // this blocks scene changes
    this.registry.gameScore = this.score;

    this.game.events.emit("game-over", { score: this.score });

    this.changeScene();
  }

  changeScene() {
    this.scene.start("GameOver");
  }

  startTimer() {
    this.gameTimer = this.time.addEvent({
      delay: GAME_PLAY_TIME, // ms
      callback: () => this.handleGameOver(),
    });
  }

  // init
  startGame({ likes, dislikes }) {
    this.leftKey = this.input.keyboard.addKey("LEFT"); // Get key object
    this.rightKey = this.input.keyboard.addKey("RIGHT"); // Get key object

    this.starSpawnId = this.time.addEvent({
      delay: 800, // ms
      callback: () =>
        this.spawnLikedItems(this.generateRandomInteger(10, GAME_WIDTH), likes),
      loop: true,
    });
    this.bombSpawnId = this.time.addEvent({
      delay: 1000, // ms
      callback: () =>
        this.spwanBomb(this.generateRandomInteger(10, GAME_WIDTH), dislikes),
      loop: true,
    });

    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "20px",
      fill: "#000",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
    });

    this.remainingTimeText = this.add.text(
      16,
      38,
      `Remaining Time: ${GAME_PLAY_TIME / 1000 + 1}s`,
      {
        fontSize: "20px",
        fill: "#000",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
      }
    );

    this.startTimer();
  }

  preload() {
    // this.load.image("background", "assets/christmas-bg.jpg");
    this.load.image("ground", "assets/platform.png");
    this.load.image("snow-ground", "assets/snow-platform.png");
    this.load.image("star", "assets/star-2.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("rudolph", "assets/rudolph-v2.png", {
      frameWidth: 64,
      frameHeight: 92,
    });

    // items
    Object.entries(items).forEach(([key, data]) => {
      // console.log(key, data, "<<<<");

      this.load.image(key, data.path);
    });
    //   this.load.image("ring", "assets/items/ring.svg");
    //   this.load.image("cash", "assets/items/cash.svg");
    //   this.load.image("bike", "assets/items/bike.svg");
    //   this.load.image("beer", "assets/items/beer.svg");
    //   this.load.image("cat", "assets/items/cat.svg");
  }

  create() {
    // this.title = this.add
    //   .text(182, this.scene.systems.scale.height / 2, "Click to Play", {
    //     fontFamily: "Arial Black",
    //     fontSize: 30,
    //     color: "#ffffff",
    //     stroke: "#000000",
    //     strokeThickness: 8,
    //     align: "center",
    //   })
    //   .setOrigin(0.5)
    //   .setDepth(100);

    // this.title.setInteractive().on(
    //   "pointerdown",
    //   function () {
    //     // this.startGame();
    //     console.log("play Clicked@@@@@ ");
    //     // this.game.events.emit("game-init");
    //   },
    //   this
    // );

    this.background = this.make.image({
      x: 182,
      y: GAME_HEIGHT / 2 - 10,
      key: "background",
      scale: { x: 1.1, y: 1.1 },
    });

    this.platforms = this.physics.add.staticGroup();
    this.platforms
      .create(GAME_WIDTH / 2, GAME_HEIGHT, "snow-ground")
      .refreshBody();

    this.player = this.physics.add.sprite(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 80,
      "rudolph"
    );
    this.player.setScale(0.8).refreshBody();
    this.player.setCollideWorldBounds(true);

    /** rudolph anims */
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("rudolph", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "rudolph", frame: 2 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("rudolph", {
        start: 3,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.stars = this.physics.add.group();
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(
      this.platforms,
      this.stars,
      this.itemHitsPlatform,
      null,
      this
    );
    this.physics.add.collider(
      this.platforms,
      this.bombs,
      this.itemHitsPlatform,
      null,
      this
    );
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.bombHitsPlayer,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    EventBus.emit("current-scene-ready", this);
  }

  update() {
    if (this.gameOver) {
      return;
    }

    //   let viewport = this.scene.scale.getViewPort();
    //   var parentSize = this.scene.scale.parentSize;

    //   console.log(this.scene.scene.scale.getViewPort(), "<<< sizes");

    const { width, height } = this.scale.getViewPort();
    if (width < GAME_WIDTH) {
      this.scale.setGameSize(width, width * (GAME_HEIGHT / GAME_WIDTH));

      this.background.setPosition(width / 2, height / 2);
      this.background.setDisplaySize(width, height);

      this.platforms.setXY(width / 2, height);
      // platforms.refreshBody();

      this.player.setY(height - 50);
    }

    if (!this.gameTimer) {
      // game started / is being playing
      return;
    }

    if (
      this.leftKey.isDown ||
      (this.input.activePointer.isDown &&
        this.input.activePointer.x < GAME_WIDTH / 2)
    ) {
      this.player.setVelocityX(-400);
      this.player.anims.play("left", true);
    } else if (
      this.rightKey.isDown ||
      (this.input.activePointer.isDown &&
        this.input.activePointer.x >= GAME_WIDTH / 2)
    ) {
      this.player.setVelocityX(400);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    let remainingTime = Math.floor(this.gameTimer.getRemainingSeconds());

    if (remainingTime >= 0) {
      this.remainingTimeText.setText(`Remaining time: ${remainingTime + 1}s`);
    }

    if (this.likedItemsSize !== this.likedItems.size) {
      this.likedItemsSize = this.likedItems.size;
      const items = Array.from(this.likedItems);
      this.game.events.emit("update-itemList", items);
    }

    if (this.dislikedItemsSize !== this.dislikedItems.size) {
      this.dislikedItemsSize = this.dislikedItems.size;
      const items = Array.from(this.dislikedItems);
      this.game.events.emit("update-dislikes", items);
    }
  }
}
