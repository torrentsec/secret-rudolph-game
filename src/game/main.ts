// import { AUTO, Game } from "phaser";
import Phaser, { Game } from "phaser";

// const GAME_PLAY_TIME = 30000; // 30 seconds
const GAME_PLAY_TIME = 10000; // 10 seconds

let player;
let rudolph;
let stars;
let bombs;
let platforms;
let cursors;
let score = 0;
let scoreText;

let remainingTimeText;
let gameTimer;
let gameOver = false;
let starSpawnId = null;
let bombSpawnId = null;

function generateRandomInteger(min: number, max: number) {
    return min + Math.floor(Math.random() * max);
}

function collectStar(player, star) {
    star.disableBody(true, true);

    player.preFX.addGlow(0x00b90c); // green
    setTimeout(() => player.preFX.clear(), 500);
    score += 10;
    scoreText.setText("Score: " + score);
}

function itemHitsPlatform(platforms, item) {
    item.disableBody(true, true);
}

function bombHitsPlayer(player, bomb) {
    score -= 5;
    scoreText.setText("Score: " + score);
    bomb.disableBody(true, true);
    player.preFX.addGlow(0xff0000); // red
    setTimeout(() => player.preFX.clear(), 500);
}

function spawnStar(x) {
    // gameObject.setRandomPosition
    let star = stars.create(x, 16, "star");
    star.setCollideWorldBounds(true);

    const DROP_SPEED = 100;
    star.setVelocity(0, DROP_SPEED);
}

function spwanBomb(x) {
    let bomb = bombs.create(x, 16, "bomb");
    // bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);

    const DROP_SPEED = 100; // bigger the value, faster drop
    bomb.setVelocity(0, DROP_SPEED);
}

function handleGameOver() {
    player.stop();
    gameTimer.destroy();
    console.log(this.scene, "#####SCENE");
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

function preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
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
}

function create() {
    this.add.image(400, 300, "sky");

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, "ground").setScale(2).refreshBody();

    // platforms.create(600, 400, "ground");
    // platforms.create(50, 250, "ground");
    // platforms.create(750, 220, "ground");

    // player = this.physics.add.sprite(100, 450, "dude");
    player = this.physics.add.sprite(100, 450, "rudolph");

    // player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    // rudolph.setCollideWorldBounds(true);

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

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group();
    starSpawnId = setInterval(
        () => spawnStar(generateRandomInteger(10, 800)),
        800
    );

    bombs = this.physics.add.group();
    bombSpawnId = setInterval(
        () => spwanBomb(generateRandomInteger(10, 800)),
        1000
    );

    scoreText = this.add.text(16, 16, "score: 0", {
        fontSize: "32px",
        fill: "#000",
    });

    remainingTimeText = this.add.text(
        16,
        56,
        `Remaining Time: ${GAME_PLAY_TIME / 1000 + 1}s`,
        {
            fontSize: "32px",
            fill: "#000",
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

        return;
        // game over scene 으로 전환?
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-400);

        player.anims.play("left", true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(400);

        player.anims.play("right", true);
    } else {
        player.setVelocityX(0);

        player.anims.play("turn");
    }

    // if (cursors.up.isDown && player.body.touching.down) {
    //     player.setVelocityY(-330);
    // }

    let remainingTime = Math.floor(gameTimer.getRemainingSeconds());

    if (remainingTime >= 0) {
        remainingTimeText.setText(`Remaining time: ${remainingTime + 1}s`);
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    backgroundColor: "#3366b2",
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 200,
                // x: 0,
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

