import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import StartGame from "./game/main";
import { EventBus } from "./game/EventBus";
import { useRouter } from "next/router";
import { ItemKey, items } from "./game/items";
import Help from "@/components/icons/Help";
import Instructions from "./components/Instructions";
import { addGameResult } from "./_utils/useFirestore";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  gameId: string;
  friendName: string;
  playerName: string;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
  function PhaserGame(
    { currentActiveScene, gameId, friendName, playerName },
    ref
  ) {
    const game = useRef<Phaser.Game | null>(null!);
    const [likedItems, setLikedItems] = useState<Partial<ItemKey>[]>([]);
    const [dislikedItems, setDislikedItems] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    const router = useRouter();

    const saveGameResult = (score: number) => {
      const data = localStorage.getItem(gameId);
      if (!data) {
        // invalid game!
        console.log("Failed to fetch game data! Check game id");
        return;
      }
      const parsed = JSON.parse(data);
      const newResult = [...parsed.result, { player: playerName, score }].sort(
        (a, b) => b.score - a.score
      );

      localStorage.setItem(
        gameId,
        JSON.stringify({ ...parsed, result: newResult })
      );
    };

    const handleRedirect = () => {
      router.push(`/results?gameId=${gameId}`);
    };

    const handleHelpClick = (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();

      setShowInstructions(false);
    };

    useLayoutEffect(() => {
      if (game.current === null) {
        game.current = StartGame("game-container");

        if (typeof ref === "function") {
          ref({ game: game.current, scene: null });
        } else if (ref) {
          ref.current = { game: game.current, scene: null };
        }
      }

      return () => {
        if (game.current) {
          game.current.destroy(true);
          if (game.current !== null) {
            game.current = null;
          }
        }
      };
    }, [ref]);

    useEffect(() => {
      EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
        if (currentActiveScene && typeof currentActiveScene === "function") {
          currentActiveScene(scene_instance);
        }

        if (typeof ref === "function") {
          ref({ game: game.current, scene: scene_instance });
        } else if (ref) {
          ref.current = {
            game: game.current,
            scene: scene_instance,
          };
        }
      });

      game.current?.events.on("update-itemList", (data: any) => {
        setLikedItems(data);
      });

      game.current?.events.on("update-dislikes", (data: any) => {
        setDislikedItems(data);
      });

      game.current?.events.on("game-over", async (data: any) => {
        if (typeof data.score !== "number") {
          console.error("Failed to save game result.");
          return;
        }
        try {
          const newResult = {
            gameCode: gameId,
            data: { player: playerName, score: data.score },
          };
          await addGameResult(newResult);
        } catch (err) {
          console.error(err);
        } finally {
          setIsGameOver(true);
        }
      });

      return () => {
        EventBus.removeListener("current-scene-ready");
        game.current?.events.removeListener("game-over");
      };
    }, [currentActiveScene, ref]);

    return (
      <div className="flex flex-col gap-1.5 w-auto max-w-100 mx-auto px-3 py-5 md:py-3">
        <Instructions
          showInstructions={showInstructions}
          friendName={friendName}
          handleHelpClick={handleHelpClick}
        />
        <button
          type="button"
          title="how to play"
          id="help-button"
          onClick={() => setShowInstructions(true)}
          className="place-self-end cursor-pointer inline-flex gap-0.5 place-items-center bg-green-700 hover:bg-green-800 px-2 py-1 rounded-lg text-white text-sm"
        >
          <p aria-label="help-button">Help</p>
          <Help />
        </button>
        <p>Let's find out what "{friendName}" wants for Christmas!</p>
        <div className="inline-flex gap-1.5">
          💚 Likes:{" "}
          {likedItems.map((itemKey: ItemKey) => (
            <Image
              src={items[itemKey].path}
              width={24}
              height={24}
              alt={itemKey}
            />
          ))}
        </div>
        <div className="inline-flex gap-1.5">
          💔 Dislikes:{" "}
          {dislikedItems.map((itemKey: ItemKey) => (
            <Image
              src={items[itemKey].path}
              width={24}
              height={24}
              alt={itemKey}
            />
          ))}
        </div>
        {/* <div>💚 Likes: {likedItems.join(",")}</div>
        <div>💔 Dislikes: {dislikedItems.join(",")}</div> */}
        <div id="game-container" className="self-center"></div>
        {isGameOver && (
          <button
            className="mt-3 p-2 rounded-xl bg-gray-200 hover:bg-green-200 text-green-700 font-semibold border-2 border-green-700 cursor-pointer"
            onClick={handleRedirect}
          >
            See Results
          </button>
        )}
      </div>
    );
  }
);
