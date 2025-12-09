import Boot from "./scenes/Boot";
import MainGame from "./scenes/MainGame";
import MainMenu from "./scenes/MainMenu";
// import { AUTO, Game } from "phaser";
import Preloader from "./scenes/Preloader";
import Phaser from "phaser";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#3366b2",
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 300,
                x: 0,
            },
            debug: false,
        },
    },
    scene: [Boot, Preloader, /* MainMenu, */ MainGame],
};

const StartGame = (parent: string) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;

