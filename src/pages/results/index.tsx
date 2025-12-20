import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import type { GameInformation } from "@/types/types";
import Image from "next/image";
import { ItemKey, items } from "@/game/items";
import Link from "next/link";

type Props = {};

export default function ResultsPage({}: Props) {
  const router = useRouter();
  const gameId = useMemo(() => router.query.gameId, [router]);

  const [isLoading, setIsLoading] = useState(true);
  const [gameData, setGameData] = useState<GameInformation>();

  const fetchData = (id: string): Promise<GameInformation> =>
    new Promise((resolve, reject) => {
      const data = localStorage.getItem(id);
      if (!data) {
        // error
        reject({});
        return;
      }
      const parsed = JSON.parse(data) as GameInformation;
      // console.log(parsed, "##########");

      resolve(parsed);
    });

  const init = async (id: string) => {
    setIsLoading(true);
    // check validity and save origin data
    try {
      const result: GameInformation = await fetchData(id);
      if (!result?.name) {
        // @todo 예외처리하기
        console.error("Failed to fetch data");
        setGameData(undefined);
      }
      setGameData(result);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // if game id is valid
    if (!gameId || typeof gameId !== "string") {
      // @todo handle exception
      console.error("[Results Page] Invalid game id");
      return;
    }
    init(gameId);
  }, [gameId]);

  if (isLoading) {
    return <section> Loading results..</section>;
  }

  if (!gameData) {
    // @todo set error boundary ?
    return <div> Game Result </div>;
  }

  return (
    <section className="flex flex-col justify-center items-center mx-auto w-full md:w-[50%] p-10 gap-5">
      <h1 className="text-3xl font-bold text-center">Game Result</h1>
      <div className="w-full">
        <h2 className="text-xl font-semibold text-center">
          {gameData.name || "User"}'s Wishlist
        </h2>
        <div className="mt-3">
          <h3 className="py-2">{gameData.name || "User"} wants.. </h3>
          <ul className="flex flex-wrap place-self-center gap-2">
            {gameData.likes.map((itemKey: ItemKey) => (
              <li
                key={itemKey}
                className="w-20 h-20 place-content-center place-items-center text-sm text-center p-2 rounded-xl bg-gray-300 text-black"
              >
                <Image
                  className="mx-auto"
                  src={items[itemKey].path}
                  width={30}
                  height={30}
                  alt={items[itemKey].name}
                />
                {items[itemKey].name}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3">
          <h3 className="py-2">
            {gameData.name || "User"} less likely wants..{" "}
          </h3>
          <ul className="flex flex-wrap place-self-center gap-2">
            {gameData.dislikes.map((itemKey: ItemKey) => (
              <li
                key={itemKey}
                className="w-20 h-20 place-content-center place-items-center text-sm text-center p-2 rounded-xl bg-gray-300 text-black"
              >
                <Image
                  className="mx-auto"
                  src={items[itemKey].path}
                  width={30}
                  height={30}
                  alt={items[itemKey].name}
                />
                {items[itemKey].name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full">
        {/* <h2 className="text-xl font-semibold text-center">
          {gameData.name || "User"}'s friends played:{" "}
        </h2> */}
        <h2 className="text-2xl text-center text-green-500 font-semibold py-3">
          SCORE BOARD
        </h2>
        <ul className="w-full flex flex-col gap-2 p-2 rounded-2xl bg-gray-200/80 text-black">
          {/* make sure to render a ordered list */}
          {gameData.result.map((item, index) => {
            return (
              <li
                key={index}
                className={`inline-flex items-center py-2 px-4 rounded-2xl border-2 ${
                  index <= 2 ? "font-bold border-green-700" : " border-gray-500"
                }`}
              >
                <span className="flex-1 mr-2">#{index + 1}</span>
                <span className="flex-4">{item.player}</span>
                <span className="flex-2 p-1 border-2 border-green-800 rounded-full text-center">
                  {item.score}
                </span>
              </li>
            );
          })}
          {gameData.result.length === 0 && (
            <li className="text-center my-5">
              No players yet. Be the first one!
            </li>
          )}
        </ul>
      </div>

      <div className="w-full flex flex-col gap-2">
        <Link
          href={`/game?gameId=${gameId}`}
          className="p-3 rounded-2xl bg-green-700 hover:bg-green-800 text-center font-semibold cursor-pointer"
        >
          Play Again
        </Link>
        <Link
          href="/new-game"
          className="p-3 rounded-2xl bg-green-700 hover:bg-green-800 text-center font-semibold cursor-pointer"
        >
          Create your own game
        </Link>
        <button className="p-3 rounded-2xl bg-green-700 hover:bg-green-800 text-center font-semibold cursor-pointer">
          Share the result
        </button>
      </div>
    </section>
  );
}
