import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { useRouter } from "next/router";
import RudolphGame from "./game/scenes/RudolphGame";

function App() {
  // The sprite can only be moved in the MainMenu Scene
  const [canMoveSprite, setCanMoveSprite] = useState(true);
  const router = useRouter();
  const [gameId, setGameId] = useState("");

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  useEffect(() => {
    console.log(router.query.gameId);
    if (router.query.gameId && typeof router.query.gameId == "string") {
      setGameId(router.query.gameId);
    }
  }, [router]);

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    /** 이 부분 key 업뎃 해야 되나? 지워도 되나 */
    setCanMoveSprite(scene.scene.key !== "MainMenu");
  };

  const moveSprite = () => {
    console.log("clicked11111111");

    if (phaserRef.current) {
      const scene = phaserRef.current.scene as RudolphGame;
      console.log("22222222", scene);

      // if (scene && scene.scene.key === "MainMenu") {
      if (scene && scene.scene.key === "RudolphGame") {
        console.log("333333333");
        // Get the update logo position
        // scene.moveLogo(({ x, y }) => {
        //   setSpritePosition({ x, y });
        // });

        scene.spawnStar(50, ["beer"]);
      }
    }
  };

  return (
    <div id="app">
      <button onClick={moveSprite}>spawn item</button>
      <PhaserGame
        ref={phaserRef}
        currentActiveScene={currentScene}
        gameId={gameId}
      />
    </div>
  );
}

export default App;
