import { generateUniqueHash } from "@/_utils/utils";
import { type Items, type ItemKey, items, Item } from "@/game/items";
import Image from "next/image";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

type Props = { setGameId: Dispatch<SetStateAction<string | undefined>> };

const MIN_LIKES_COUNT = 1;
const MAX_LIKES_COUNT = 5;
const MIN_DISLIKES_COUNT = 1;
const MAX_DISLIKES_COUNT = 5;

function GameCreateSuccess({ uniqueId }: { uniqueId: string }) {
  return (
    <div>
      <p>
        Game has been successfully created! <br />
        Your code: {uniqueId}
        <button className="bg-green-500">Copy code</button>
        <br />
        Share the link with your friends to find out how well they guess your
        wishlist by playing the game. <br />
      </p>
      <p>
        Please keep in mind you will need to save the link or code to check the
        game results.
      </p>
      <div>
        <button>Share </button>
        <button>Copy code</button>
      </div>
    </div>
  );
}

function GameCreateSteps({ setGameId }: Props) {
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const isLastStep = useMemo(() => currentStep === totalSteps, [currentStep]);
  const [itemOptions, setItemOptions] = useState(items);
  const [selectedLikes, setSelectedLikes] = useState<ItemKey[]>([]);
  const [selectedDislikes, setSelectedDislikes] = useState<ItemKey[]>([]);
  const dislikeOptions: Partial<Items> = useMemo(() => {
    const entries = Object.entries(itemOptions).filter(
      ([key, _]) => !selectedLikes.includes(key as ItemKey)
    );
    return Object.fromEntries(entries);
  }, [selectedLikes, itemOptions]);

  const [errorMessage, setErrorMessage] = useState("");

  const handlePrevClick = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleNextClick = () => {
    if (isLastStep) {
      handleCreateGame();
      return;
    }

    if (
      (currentStep === 1 && selectedLikes.length < 1) ||
      (currentStep === 2 && selectedDislikes.length < 1)
    ) {
      console.log("Select at least 1 item");
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleCreateGame = () => {
    //create hash
    const uniqueId = generateUniqueHash();
    const newGameData = {
      name: "owner", // owner name
      likes: selectedLikes,
      dislikes: selectedDislikes,
      result: [], // { player: 'anonymous', score: 5 }
    };

    // @todo save to db
    localStorage.setItem(uniqueId, JSON.stringify(newGameData));
    console.log("saved!@@@@@", uniqueId, newGameData);
    setGameId(uniqueId);
  };

  const handleItemClick = (
    e: React.MouseEvent<HTMLLIElement>,
    itemKey: ItemKey
  ) => {
    if (currentStep === 1) {
      if (selectedLikes.includes(itemKey)) {
        setSelectedLikes((likedList) =>
          likedList.filter((key) => key !== itemKey)
        );
      } else {
        if (MAX_LIKES_COUNT === selectedLikes.length) {
          console.log("Cannot select more! Reached maximum selections");
          return;
        }
        setSelectedLikes((likedList) => [...likedList, itemKey]);
      }
    } else if (currentStep === 2) {
      if (selectedDislikes.includes(itemKey)) {
        setSelectedDislikes((dislikedList) =>
          dislikedList.filter((key) => key !== itemKey)
        );
      } else {
        if (MAX_DISLIKES_COUNT === selectedDislikes.length) {
          console.log("Cannot select more! Reached maximum selections");
          return;
        }
        setSelectedDislikes((dislikedList) => [...dislikedList, itemKey]);
      }
    }
  };

  const isSelected = (key: ItemKey) => {
    if (currentStep === 1) {
      return selectedLikes.includes(key);
    } else if (currentStep === 2) {
      return selectedDislikes.includes(key);
    }
  };

  return (
    <>
      <h1>
        If Santa were to get you presents, what would you like or dislike for
        Christmas?
      </h1>
      <h2>
        Step {currentStep} / {totalSteps}
      </h2>

      <div className={currentStep === 1 ? "block" : "hidden"}>
        <div>I would like.. {selectedLikes.length} selected</div>
        <p>
          Select {MIN_LIKES_COUNT} to {MAX_LIKES_COUNT} items
        </p>
        <ul className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
          {Object.entries(itemOptions).map(([itemKey, itemData]) => {
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

      <div className={currentStep === 2 ? "block" : "hidden"}>
        <div>I would NOT like.. {selectedDislikes.length} selected</div>
        <p>
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

      <div className={`${currentStep === 3 ? "block" : "hidden"}`}>
        <h3>Selected items: </h3>
        <div className="flex flex-col gap-2">
          <p>Likes: {selectedLikes.length} items selected</p>
          <ul className="flex gap-2">
            {selectedLikes.map((key) => (
              <li className="p-2 rounded-2xl text-sm bg-green-100 text-black">
                <Image
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
              <li className="p-2 rounded-2xl text-sm bg-green-100 text-black">
                <Image
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
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1/2 p-3 rounded-xl bg-green-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:bg-green-900"
          disabled={currentStep <= 1}
          onClick={handlePrevClick}
        >
          Prev
        </button>

        <button
          className="flex-1/2 p-3 rounded-xl bg-green-700 hover:cursor-pointer"
          onClick={handleNextClick}
        >
          {isLastStep ? "Create game" : "Next"}
        </button>
      </div>
    </>
  );
}

export default function NewGame({}: Props) {
  const [gameId, setGameId] = useState<string | undefined>("068Duw7BoV"); // initialised for testing

  return (
    <section className="flex flex-col justify-center gap-5 w-[500px] max-w-dvw h-auto p-5 mx-auto">
      {gameId ? (
        <GameCreateSuccess uniqueId={gameId} />
      ) : (
        <GameCreateSteps setGameId={setGameId} />
      )}
    </section>
  );
}
