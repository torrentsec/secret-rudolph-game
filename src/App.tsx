import { useEffect, useRef, useState, useCallback } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { useRouter } from "next/router";
import { RudolphGame } from "./game/scenes/RudolphGame";
import { itemKeys } from "./game/items";
import { fetchGame } from "./_utils/useFirestore";
import { GameInformation } from "./types/types";

function App() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [gameId, setGameId] = useState("");
  const [gameData, setGameData] = useState<GameInformation | null>(null);
  const [friendName, setFriendName] = useState("");
  const [playerName, setPlayerName] = useState("Anonymous");
  const [error, setError] = useState("");

  const phaserRef = useRef<IRefPhaserGame | null>(null);

  useEffect(() => {
    if (router.query.gameId && typeof router.query.gameId === "string") {
      setGameId(router.query.gameId);
    }
  }, [router.query.gameId]);

  useEffect(() => {
    if (gameId) {
      initGameSettings(gameId);
    }
  }, [gameId]);

  const initGameSettings = async (id: string) => {
    try {
      const data = await fetchGame(id);
      setGameData(data);
      setFriendName(data.name || "");
      setError("");
    } catch (err) {
      console.error(`Failed to initialize game ${id}:`, err);
      setError("Failed to load game. Please check your game code.");
      setGameData(null);
    }
  };

  const validatePlayerName = (name: string): boolean => {
    const regex = /^[\p{L}\p{N} _-]{1,20}$/u;
    return regex.test(name.trim());
  };

  const start = useCallback(() => {
    if (!validatePlayerName(playerName)) {
      setError(
        "Invalid player name! Please type in 1-20 characters of letters, numbers, spaces, _ and -"
      );
      return;
    }

    const likes = gameData?.likes || [itemKeys.SNOWFLAKE];
    const dislikes = gameData?.dislikes || [itemKeys.POO];

    if (phaserRef.current) {
      const scene = phaserRef.current.scene as RudolphGame;

      if (scene && scene.scene.key === "RudolphGame") {
        scene.startGame({ likes, dislikes });
        setIsVisible(false);
        setError("");
      }
    }
  }, [playerName, gameData]);

  const currentScene = useCallback((scene: Phaser.Scene) => {
    if (scene.scene.key === "RudolphGame") {
      setIsVisible(true);
    }
  }, []);

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
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
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
