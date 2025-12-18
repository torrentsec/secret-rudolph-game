import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { useRouter } from "next/router";
import { RudolphGame } from "./game/scenes/RudolphGame";
import { MainMenu } from "./game/scenes/MainMenu";
import { itemKeys } from "./game/items";

function App() {
  // The sprite can only be moved in the MainMenu Scene
  const [canMoveSprite, setCanMoveSprite] = useState(true);
  const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [gameId, setGameId] = useState("");

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  useEffect(() => {
    console.log(router.query.gameId);
    if (router.query.gameId && typeof router.query.gameId == "string") {
      setGameId(router.query.gameId);
    } else {
      // @todo redirect to main page ? or play with default items mode
    }
  }, [router]);

  const callGameover = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as RudolphGame;
      if (scene && scene.scene.key === "RudolphGame") {
        scene.handleGameOver();
      }
    }
  };

  const spawnBeer = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as RudolphGame;
      if (scene && scene.scene.key === "RudolphGame") {
        scene.spawnLikedItems(Math.floor(Math.random() * 300), ["beer"]);
      }
    }
  };

  // local storage
  const fetchGameData = (gameId: string) => {
    if (!gameId) {
      // @todo handle game id invalid error
      throw new Error("game id is invalid");
    }
    const data = localStorage.getItem(gameId);
    if (!data) {
      return {};
    }
    return JSON.parse(data);
  };

  const start = () => {
    console.log(" START !!!!");

    const gameData = fetchGameData(gameId);
    // console.log(gameData);
    // { likes, dislikes, name }
    const likes = gameData.likes || [itemKeys.SNOWFLAKE];
    const dislikes = gameData.dislikes || ["bomb"];

    if (phaserRef.current) {
      const scene = phaserRef.current.scene as RudolphGame;

      if (scene && scene.scene.key === "RudolphGame") {
        scene.startGame({ likes, dislikes });

        setIsVisible(false);
      }
    }
  };

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key !== "MainMenu");

    if (scene.scene.key === "RudolphGame") {
      setIsVisible(true);
    }
    // setIsVisible(scene.scene.key === 'RudolphGame')
  };

  return (
    <div id="app">
      {isVisible && (
        <div className="absolute w-full h-full z-10 bg-black/50 flex justify-center items-center">
          {/* <div>
          <button className="button" onClick={callGameover}>
            Trigger Game over
          </button>
        </div> */}
          {/* <div className="spritePosition">
          Sprite Position:
          <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
        </div> */}
          <button
            type="button"
            className="w-fit h-fit bg-black p-5 border hover:bg-gray-800 hover:cursor-pointer"
            onClick={start}
          >
            Click to Play
          </button>
        </div>
      )}
      <PhaserGame
        ref={phaserRef}
        currentActiveScene={currentScene}
        gameId={gameId}
      />
    </div>
  );
}

export default App;
