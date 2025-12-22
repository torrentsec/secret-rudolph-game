import { createGame } from "@/_utils/useFirestore";
import { generateUniqueHash } from "@/_utils/utils";
import { type Items, type ItemKey, items, Item } from "@/game/items";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

type Props = {
  setGameId: Dispatch<SetStateAction<string | undefined>>;
  setCreatedBy: Dispatch<SetStateAction<string>>;
};

const MIN_LIKES_COUNT = 1;
const MAX_LIKES_COUNT = 3;
const MIN_DISLIKES_COUNT = 1;
const MAX_DISLIKES_COUNT = 3;

function GameCreateSuccess({
  uniqueId,
  nickname,
}: {
  uniqueId: string;
  nickname: string;
}) {
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(uniqueId);
      alert("Game code copied!");
    } catch (err) {
      console.error("Failed to copy!", err);
      alert("Failed to copy the code. Please copy it manually.");
    }
  };

  const copyLink = async () => {
    try {
      if (!window || !window.location) {
        throw new Error("window.location is undefined");
      }
      const fullLink = `${window.location.origin}/game?gameId=${uniqueId}`;
      await navigator.clipboard.writeText(fullLink);
      alert("Share link is copied!");
    } catch (err) {
      console.error("Failed to copy!", err);
      alert("Failed to copy the link. Please copy it manually.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">
        Congrats, {nickname}! 🎉
        <br />
        Your game has been successfully created!
      </h1>
      <div className="font-semibold">
        Your code: {uniqueId}
        <button
          className="ml-2 bg-green-600 py-1 px-2.5 rounded-2xl cursor-pointer font-medium"
          onClick={handleCopyCode}
        >
          Copy
        </button>
      </div>
      <p>
        Share the link with your friends to find out how well they guess your
        wishlist by playing the game.
      </p>
      <p>
        Please keep in mind you will need to save the link or code to check the
        game results.
      </p>
      <div>
        <div className="my-2 font-semibold">🔗 Share link</div>
        <ul className="flex gap-2 flex-wrap">
          {/* <li className="px-3 py-1 rounded-2xl bg-white text-black cursor-pointer">
            Facebook
          </li>
          <li className="px-3 py-1 rounded-2xl bg-white text-black cursor-pointer">
            X
          </li>
          <li className="px-3 py-1 rounded-2xl bg-white text-black cursor-pointer">
            Whatsapp
          </li>
          <li className="px-3 py-1 rounded-2xl bg-white text-black cursor-pointer">
            KakaoTalk
          </li> */}
          <p className="text-sm border border-green-50 rounded-xl p-2 break-all">{`${window.location.origin}/game?gameId=${uniqueId}`}</p>
          <li
            className="text-sm px-3 py-1 rounded-2xl bg-white text-black cursor-pointer"
            onClick={copyLink}
          >
            Click to copy
          </li>
        </ul>
      </div>
      <div className="flex gap-2 mt-3 text-center">
        <Link
          href={`/game?gameId=${uniqueId}`}
          className="flex-1 w-fit px-6 py-4 rounded-xl bg-green-700 hover:bg-green-800 cursor-pointer"
        >
          Play game
        </Link>
        <Link
          href="/"
          className="flex-1 px-6 py-4 rounded-xl bg-green-700 hover:bg-green-800 cursor-pointer"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function GameCreateSteps({ setGameId, setCreatedBy }: Props) {
  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState(1);
  const isLastStep = useMemo(() => currentStep === totalSteps, [currentStep]);
  const itemOptions: Items = useMemo(() => items, [items]);
  const [selectedLikes, setSelectedLikes] = useState<ItemKey[]>([]);
  const [selectedDislikes, setSelectedDislikes] = useState<ItemKey[]>([]);
  const likeOptions: Partial<Items> = useMemo(() => {
    const entries = Object.entries(itemOptions).filter(
      ([key, _]) => !selectedDislikes.includes(key as ItemKey)
    );
    return Object.fromEntries(entries);
  }, [selectedDislikes, itemOptions]);
  const dislikeOptions: Partial<Items> = useMemo(() => {
    const entries = Object.entries(itemOptions).filter(
      ([key, _]) => !selectedLikes.includes(key as ItemKey)
    );
    return Object.fromEntries(entries);
  }, [selectedLikes, itemOptions]);

  const [nickname, setNickname] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const handlePrevClick = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const sanitizeNickname = (input: string) => {
    let name = input.trim();
    name = name.replace(/\s+/g, " "); // replace multiple spaces with single space
    name = name.replace(/[^\p{L}\p{N} _-]/gu, "");
    return name;
  };

  const handleNextClick = () => {
    if (isLastStep) {
      handleCreateGame();
      return;
    }

    if (currentStep === 1 && nickname.trim().length < 1) {
      setErrorMessage("Please enter a nickname. (At least 1 character)");
      return;
    }

    if (
      (currentStep === 2 && selectedLikes.length < 1) ||
      (currentStep === 3 && selectedDislikes.length < 1)
    ) {
      setErrorMessage("Select at least 1 item");
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleCreateGame = async () => {
    try {
      const uniqueId = generateUniqueHash();
      const newGameData = {
        name: nickname,
        likes: selectedLikes,
        dislikes: selectedDislikes,
        results: [], // { player: 'anonymous', score: 5 }
        creationDate: new Date().toISOString(),
      };

      localStorage.setItem(uniqueId, JSON.stringify(newGameData));
      await createGame({ gameCode: uniqueId, data: newGameData });
      // console.log("saved!@@@@@", uniqueId, newGameData);
      setGameId(uniqueId);
      setCreatedBy(nickname);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = (
    e: React.MouseEvent<HTMLLIElement>,
    itemKey: ItemKey
  ) => {
    if (currentStep === 2) {
      if (selectedLikes.includes(itemKey)) {
        setSelectedLikes((likedList) =>
          likedList.filter((key) => key !== itemKey)
        );
      } else {
        if (MAX_LIKES_COUNT === selectedLikes.length) {
          setErrorMessage(`You can select up to ${MAX_LIKES_COUNT} items.`);
          return;
        }
        setSelectedLikes((likedList) => [...likedList, itemKey]);
      }
    } else if (currentStep === 3) {
      if (selectedDislikes.includes(itemKey)) {
        setSelectedDislikes((dislikedList) =>
          dislikedList.filter((key) => key !== itemKey)
        );
      } else {
        if (MAX_DISLIKES_COUNT === selectedDislikes.length) {
          setErrorMessage(`You can select up to ${MAX_DISLIKES_COUNT} items.`);
          return;
        }
        setSelectedDislikes((dislikedList) => [...dislikedList, itemKey]);
      }
    }
  };

  useEffect(() => {
    setErrorMessage("");
    scrollTo(0, 0);
  }, [currentStep]);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const isSelected = (key: ItemKey) => {
    if (currentStep === 2) {
      return selectedLikes.includes(key);
    } else if (currentStep === 3) {
      return selectedDislikes.includes(key);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-center">Create new game</h1>
      <h2>
        If Santa were to get you presents, what would you like or dislike for
        Christmas?
      </h2>
      <h3>
        Step {currentStep} / {totalSteps}
      </h3>
      <div className={`${currentStep === 1 ? "block" : "hidden"}`}>
        <label htmlFor="nickname">What is your nickname?</label>
        <p className="text-sm text-gray-200 my-2">
          * Type in 1-25 characters of letters, numbers, spaces, _ and - <br />*
          This nickname will be displayed to your friends when you share the
          game
        </p>
        <input
          className="p-3 rounded-xl bg-green-50 text-gray-800 w-full"
          type="text"
          name="nickname"
          placeholder="Nickname (1-25 characters)"
          id="nickname"
          value={nickname}
          maxLength={25}
          onChange={handleChangeInput}
          onBlur={() => setNickname(sanitizeNickname(nickname))}
        />
      </div>

      <div className={currentStep === 2 ? "block" : "hidden"}>
        <div>I would like.. 💚 {selectedLikes.length} selected</div>
        <p className="my-2">
          * Select {MIN_LIKES_COUNT} to {MAX_LIKES_COUNT} items
        </p>
        <ul className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
          {Object.entries(likeOptions).map(([itemKey, itemData]) => {
            return (
              <li
                className={`col text-center rounded-xl p-2 bg-green-100 text-sm text-black hover:cursor-pointer ${
                  isSelected(itemKey as ItemKey) &&
                  " bg-green-600 font-semibold text-white"
                }`}
                key={itemKey as ItemKey}
                onClick={(e) => handleItemClick(e, itemKey as ItemKey)}
              >
                <Image
                  className="mx-auto"
                  src={itemData.path}
                  aria-label={itemData.name}
                  alt={itemData.name}
                  width={30}
                  height={30}
                />
                {itemData.name}
              </li>
            );
          })}
        </ul>
      </div>

      <div className={currentStep === 3 ? "block" : "hidden"}>
        <div>I would NOT like.. 💔 {selectedDislikes.length} selected</div>
        <p className="my-2">
          Select {MIN_DISLIKES_COUNT} to {MAX_DISLIKES_COUNT} items
        </p>

        <ul className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
          {Object.entries(dislikeOptions).map(([itemKey, itemData]) => {
            return (
              <li
                className={`col text-center rounded-xl p-2 bg-green-100 text-sm text-black hover:cursor-pointer ${
                  isSelected(itemKey as ItemKey) &&
                  " bg-green-600 font-semibold text-white"
                }`}
                key={itemKey}
                onClick={(e) => handleItemClick(e, itemKey as ItemKey)}
              >
                <Image
                  className="mx-auto"
                  src={itemData.path}
                  aria-label={itemData.name}
                  alt={itemData.name}
                  width={30}
                  height={30}
                />
                {itemData.name}
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className={`${currentStep === 4 ? "flex" : "hidden"} flex-col gap-2`}
      >
        <div className="mb-2">
          <div className="font-semibold mb-2">⭐️ Nickname:</div>
          <span className="text-black px-2 py-1 rounded-lg bg-green-100">
            {nickname}
          </span>
        </div>

        <p className="font-semibold">🎁 Your wishlist: </p>
        <div className="flex flex-col gap-2">
          <p>Likes: {selectedLikes.length} items selected</p>
          <ul className="flex gap-2">
            {selectedLikes.map((key) => (
              <li
                key={key}
                className="p-2 rounded-2xl text-center text-sm bg-green-100 text-black"
              >
                <Image
                  className="mx-auto"
                  src={itemOptions[key].path}
                  width={30}
                  height={30}
                  alt={itemOptions[key].name}
                />
                {itemOptions[key].name}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <p>Dislikes: {selectedDislikes.length} items selected</p>
          <ul className="flex gap-2">
            {selectedDislikes.map((key) => (
              <li
                key={key}
                className="p-2 rounded-2xl text-center text-sm bg-green-100 text-black"
              >
                <Image
                  className="mx-auto"
                  src={itemOptions[key].path}
                  width={30}
                  height={30}
                  alt={itemOptions[key].name}
                />
                {itemOptions[key].name}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-5">
          Would you like to proceed to create the game with these item
          selections?
        </p>
      </div>

      <div
        className={`text-sm bg-red-200 text-black text-center px-3 py-1 rounded-lg ${
          errorMessage.length > 0 ? "visible" : "invisible"
        }`}
      >
        ⚠️{errorMessage}
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1/2 p-3 rounded-xl bg-green-700 hover:bg-green-800 hover:cursor-pointer disabled:cursor-not-allowed disabled:bg-green-900"
          disabled={currentStep <= 1}
          onClick={handlePrevClick}
        >
          Back
        </button>

        <button
          className="flex-1/2 p-3 rounded-xl bg-green-700 hover:bg-green-800 hover:cursor-pointer"
          onClick={handleNextClick}
        >
          {isLastStep ? "Create game" : "Next"}
        </button>
      </div>
    </>
  );
}

export default function NewGame({}: Props) {
  // const [gameId, setGameId] = useState<string | undefined>("2X1dWgwnao"); // initialised for testing
  const [gameId, setGameId] = useState<string | undefined>("");
  const [createdBy, setCreatedBy] = useState<string>("");

  return (
    <section className="flex flex-col justify-center gap-5 w-125 max-w-dvw h-auto overflow-y-scroll px-5 py-15 mx-auto">
      {gameId ? (
        <GameCreateSuccess uniqueId={gameId} nickname={createdBy} />
      ) : (
        <GameCreateSteps setGameId={setGameId} setCreatedBy={setCreatedBy} />
      )}
    </section>
  );
}
