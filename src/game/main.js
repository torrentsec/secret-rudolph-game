import Phaser from "phaser";
import RudolphGame from "./scenes/RudolphGame.js";

const GAME_WIDTH = 365;
const GAME_HEIGHT = 500;

const config = {
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
  // parent: "game-container",
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
  scene: [RudolphGame],
};

const StartGame = (parent, gameId) => {
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;
