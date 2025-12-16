// import { AUTO, Game } from "phaser";
import Phaser, { Game } from "phaser";
import { items, itemKeys, tempItems } from "./items.ts";

// const GAME_PLAY_TIME = 30000; // 30 seconds
const GAME_PLAY_TIME = 20000;
const GAME_WIDTH = 365;
const GAME_HEIGHT = 500;

// game objects & images
let player;
let stars;
let bombs;
let platforms;
let background;

// Inputs
let leftKey;
let rightKey;

let score = 0;
let scoreText;

let remainingTimeText;
let gameTimer;
let gameOver = false;
let starSpawnId = null;
let bombSpawnId = null;

const likedItems = new Set();
const dislikedItems = new Set();
let likedItemsSize = 0;
let dislikedItemsSize = 0;

function generateRandomInteger(min: number, max: number) {
  return min + Math.floor(Math.random() * max);
}

function collectStar(player, star) {
  star.disableBody(true, true);

  player.preFX.addGlow(0x00b90c); // green
  setTimeout(() => player.preFX.clear(), 300);

  score += 10;
  scoreText.setText("Score: " + score);

  likedItems.add(star.name);
}

function itemHitsPlatform(platforms, item) {
  item.disableBody(true, true);
}

function bombHitsPlayer(player, bomb) {
  score -= 5;
  scoreText.setText("Score: " + score);
  bomb.disableBody(true, true);
  player.preFX.addGlow(0xff0000); // red
  setTimeout(() => player.preFX.clear(), 300);

  dislikedItems.add(bomb.name);
}

function spawnStar(x) {
  // gameObject.setRandomPosition
  const itemList = ["star", "ring", "cash"];
  const item = itemList[generateRandomInteger(0, itemList.length)];
  let star = stars.create(x, 16, item);
  star.name = item;
  star.setDisplaySize(25, 25);
  star.setCollideWorldBounds(true);

  const DROP_SPEED = 50;
  star.setVelocity(0, DROP_SPEED);
}

function spwanBomb(x) {
  let bomb = bombs.create(x, 16, "bomb");
  // bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.name = "bomb";

  const DROP_SPEED = 50; // bigger the value, faster drop
  bomb.setVelocity(0, DROP_SPEED);
}

function handleGameOver() {
  player.stop();
  gameTimer.destroy();
  remainingTimeText.setText("Remaining time: 0s");

  gameOver = true;
}

function startTimer() {
  gameTimer = this.time.addEvent({
    delay: GAME_PLAY_TIME, // ms
    callback: handleGameOver,
    //args: [],
    // callbackScope: thisArg,
  });
}

function handleLeftKeydown() {
  player.setVelocityX(-400);
  player.anims.play("left", true);
}

function handleRightKeydown() {
  player.setVelocityX(400);
  player.anims.play("right", true);
}

function setPlayerToNeutral() {
  player.setVelocityX(0);

  player.anims.play("turn");
}

function preload() {
  this.load.image("background", "assets/christmas-bg.jpg");
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("snow-ground", "assets/snow-platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("rudolph", "assets/rudolph-v2.png", {
    frameWidth: 64,
    frameHeight: 92,
  });

  // items
  Object.entries(tempItems).forEach(([key, data]) => {
    // console.log(key, data, "<<<<");

    this.load.image(key, data.path);
  });
  //   this.load.image("ring", "assets/items/ring.svg");
  //   this.load.image("cash", "assets/items/cash.svg");
  //   this.load.image("bike", "assets/items/bike.svg");
  //   this.load.image("beer", "assets/items/beer.svg");
  //   this.load.image("cat", "assets/items/cat.svg");
}

function create() {
  background = this.make.image({
    x: 182,
    y: GAME_HEIGHT / 2 - 10,
    key: "background",
    scale: { x: 1.1, y: 1.1 },
  });

  platforms = this.physics.add.staticGroup();
  platforms.create(GAME_WIDTH / 2, GAME_HEIGHT, "snow-ground").refreshBody();

  player = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 80, "rudolph");
  player.setScale(0.8).refreshBody();
  player.setCollideWorldBounds(true);

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

  leftKey = this.input.keyboard.addKey("LEFT"); // Get key object
  rightKey = this.input.keyboard.addKey("RIGHT"); // Get key object

  stars = this.physics.add.group();
  starSpawnId = setInterval(
    () => spawnStar(generateRandomInteger(10, GAME_WIDTH)),
    800
  );

  bombs = this.physics.add.group();
  bombSpawnId = setInterval(
    () => spwanBomb(generateRandomInteger(10, GAME_WIDTH)),
    1000
  );

  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "20px",
    fill: "#000",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  });

  remainingTimeText = this.add.text(
    16,
    38,
    `Remaining Time: ${GAME_PLAY_TIME / 1000 + 1}s`,
    {
      fontSize: "20px",
      fill: "#000",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
    }
  );

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(platforms, stars, itemHitsPlatform, null, this);
  this.physics.add.collider(platforms, bombs, itemHitsPlatform, null, this);
  this.physics.add.collider(player, bombs, bombHitsPlayer, null, this);

  this.physics.add.overlap(player, stars, collectStar, null, this);

  startTimer.call(this);
}

function update() {
  if (gameOver) {
    clearInterval(starSpawnId);
    clearInterval(bombSpawnId);

    this.game.events.emit("game-over", { score });
    this.game.pause();

    return;
    // game over scene 으로 전환?
  }

  //   let viewport = this.scene.scale.getViewPort();
  //   var parentSize = this.scene.scale.parentSize;

  //   console.log(this.scene.scene.scale.getViewPort(), "<<< sizes");

  const { width, height } = this.scene.scene.scale.getViewPort();
  if (width < GAME_WIDTH) {
    this.scene.scene.scale.setGameSize(
      width,
      width * (GAME_HEIGHT / GAME_WIDTH)
    );

    background.setPosition(width / 2, height / 2);
    background.setDisplaySize(width, height);
    // console.log(platforms);
    platforms.setXY(width / 2, height);
    // platforms.refreshBody();

    player.setY(height - 50);
  }

  if (
    leftKey.isDown ||
    (this.input.activePointer.isDown &&
      this.input.activePointer.x < GAME_WIDTH / 2)
  ) {
    player.setVelocityX(-400);
    player.anims.play("left", true);
  } else if (
    rightKey.isDown ||
    (this.input.activePointer.isDown &&
      this.input.activePointer.x >= GAME_WIDTH / 2)
  ) {
    player.setVelocityX(400);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  let remainingTime = Math.floor(gameTimer.getRemainingSeconds());

  if (remainingTime >= 0) {
    remainingTimeText.setText(`Remaining time: ${remainingTime + 1}s`);
  }

  if (likedItemsSize !== likedItems.size) {
    likedItemsSize = likedItems.size;
    const items = Array.from(likedItems);
    this.game.events.emit("update-itemList", items);
  }

  if (dislikedItemsSize !== dislikedItems.size) {
    dislikedItemsSize = dislikedItems.size;
    const items = Array.from(dislikedItems);
    this.game.events.emit("update-dislikes", items);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,

  min: {
    width: GAME_WIDTH * (500 / GAME_HEIGHT),
    // width: 300,
    height: 500,
  },
  max: {
    width: GAME_WIDTH, // 365
    height: GAME_HEIGHT, // 600
  },
  parent: "game-container",
  backgroundColor: "#3366b2",
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 150,
      },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const StartGame = (parent: string) => {
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;
