import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { useRouter } from "next/router";
import { RudolphGame } from "./game/scenes/RudolphGame";
import { MainMenu } from "./game/scenes/MainMenu";
import { itemKeys } from "./game/items";

function App() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [gameId, setGameId] = useState("");
  const [gameData, setGameData] = useState<any>({});
  const [friendName, setFriendName] = useState("");
  const [playerName, setPlayerName] = useState("Anonymous");

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

  useEffect(() => {
    const gameData = fetchGameData(gameId);
    setGameData(gameData);
    setFriendName(gameData.name || "Friend");
  }, [gameId]);

  // local storage
  const fetchGameData = (gameId: string) => {
    if (!gameId) {
      // @todo handle game id invalid error
      // throw new Error("game id is invalid");
      console.error("game id is invalid");
      return {};
    }
    const data = localStorage.getItem(gameId);
    if (!data) {
      return {};
    }
    return JSON.parse(data);
  };

  const validatePlayerName = (name: string) => {
    const regex = /^[\p{L}\p{N} _-]{1,20}$/u;
    return regex.test(name.trim());
  };

  const start = () => {
    if (!validatePlayerName(playerName)) {
      alert(
        "Invalid player name! Please type in 1-20 characters of letters, numbers, spaces, _ and -"
      );
      return;
    }

    // @todo handle invalid game data
    const likes = gameData.likes || [itemKeys.SNOWFLAKE];
    const dislikes = gameData.dislikes || [itemKeys.POO];

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
    if (scene.scene.key === "RudolphGame") {
      setIsVisible(true);
    }
  };

  return (
    <div id="app">
      {isVisible && (
        <div className="absolute w-full z-10 bg-black/50 flex justify-center items-center">
          <div className="bg-white px-5 py-8 rounded-3xl flex flex-col gap-3 text-black w-[350px] h-fit">
            <label htmlFor="playerName">Type in your name:</label>
            <input
              type="text"
              id="playerName"
              name="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nickname (1-20 characters)"
              maxLength={20}
              className="p-3 bg-white border border-gray-300 rounded-xl"
            />
            <p className="text-sm">
              This name will be saved and displayed on the scoreboard after you
              play.
            </p>
            <button
              type="button"
              className="self-center mt-3 w-fit h-fit rounded-xl p-4 bg-green-700 hover:bg-green-800 text-white hover:cursor-pointer"
              onClick={start}
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      <PhaserGame
        ref={phaserRef}
        currentActiveScene={currentScene}
        gameId={gameId}
        friendName={friendName}
        playerName={playerName}
      />
    </div>
  );
}

export default App;
