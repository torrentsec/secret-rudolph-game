import { Luckiest_Guy, Sansita_Swashed } from "next/font/google";
import Link from "next/link";

const luckiest_guy = Luckiest_Guy({ subsets: ["latin"], weight: "400" });
const sansita_swashed = Sansita_Swashed({ subsets: ["latin"], weight: "700" });

function MainPage() {
  return (
    <section className="flex flex-col justify-center gap-5 w-9/10 sm:max-w-125 h-dvh overflow-y-scroll py-10 mx-auto text-center">
      {/* Secret Rudolph 𐂂𐂂 */}
      {/* <h1 className={`${sansita_swashed.className} text-5xl text-green-600`}>
        Secret Rudolph
      </h1> */}
      <p className="font-semibold text-xl">Hohoho it's holiday seasons! </p>
      <p className="text-3xl">🎄🎅☃️</p>
      <p>
        What would you like for Christmas? Make a customised game with your
        wishlist and share with your friends.
      </p>
      <p>Also, find out what your loved ones would like to get for Christmas</p>

      <p>Let's get started!</p>

      <div className="sm:mt-5 flex flex-col w-4/5 sm:w-full sm:flex-row gap-4 justify-center mx-auto">
        <Link
          href="/new-game"
          className="sm:flex-1 p-5 rounded-2xl font-semibold bg-white hover:bg-green-200 border-2 text-green-800 border-green-600 hover:cursor-pointer"
        >
          <div className="text-xl">Create new game</div>
          <div className="font-medium mt-2 text-sm">
            {/* Pick your likes & dislikes of what you want for Christmas and share
            the link to your friends! */}
            Select items you would like or dislike for Christmas. Your friends
            will then try to guess your wishlist by playing the game.
          </div>
        </Link>

        <Link
          href="/results"
          className="sm:flex-1 p-5 rounded-2xl font-semibold bg-green-700 hover:bg-green-800 hover:cursor-pointer"
        >
          <div className="text-xl">Check results</div>
          <div className="font-medium mt-2 text-sm">
            Checkout the score board of your game! <br />
            Find out who knows you more
          </div>
        </Link>
      </div>
    </section>
  );
}

export default MainPage;
