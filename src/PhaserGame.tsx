import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import StartGame from "./game/main";
import { EventBus } from "./game/EventBus";
import { useRouter } from "next/router";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  gameId: string; // length is 10 ?
  friendName: string;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
  function PhaserGame({ currentActiveScene, gameId, friendName }, ref) {
    const game = useRef<Phaser.Game | null>(null!);
    // const friendName = "Jiho";
    const playerName = "Anonymous";
    const [likedItems, setLikedItems] = useState([]);
    const [dislikedItems, setDislikedItems] = useState([]);

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

      game.current?.events.on("update-itemList", (data) => {
        // console.log(data);
        setLikedItems(data);
      });

      game.current?.events.on("update-dislikes", (data) => {
        // console.log(data);
        setDislikedItems(data);
      });

      game.current?.events.on("game-over", (data) => {
        if (typeof data.score !== "number") {
          console.error("Failed to save game result.");
          return;
        }
        saveGameResult(data.score);
        handleRedirect();
      });

      return () => {
        EventBus.removeListener("current-scene-ready");
        game.current?.events.removeListener("game-over");
      };
    }, [currentActiveScene, ref]);

    return (
      <div className="flex flex-col justify-center w-auto max-w-100 h-dvh mx-auto">
        <p>Let's find out what {friendName} wants for Christmas!</p>
        <div>💚 Likes: {likedItems.join(",")}</div>
        <div>💔 Dislikes: {dislikedItems.join(",")}</div>
        <div id="game-container"></div>
      </div>
    );
  }
);
