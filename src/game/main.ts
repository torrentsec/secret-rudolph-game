import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
// import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { RudolphGame as MainGame } from "./scenes/RudolphGame";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig

const GAME_WIDTH = 365;
const GAME_HEIGHT = 500;

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  //   width: 1024,
  //   height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  min: {
    width: GAME_WIDTH * (500 / GAME_HEIGHT),
    // width: 300,
    height: 500,
  },
  max: {
    width: GAME_WIDTH, // 365
    height: GAME_HEIGHT, // 600
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 150,
      },
      debug: false,
    },
  },
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
