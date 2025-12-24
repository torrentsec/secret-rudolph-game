import { Luckiest_Guy, Sansita_Swashed } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const luckiest_guy = Luckiest_Guy({
  subsets: ["latin"],
  weight: "400",
  display: "swap", // Shows fallback font immediately while loading
  fallback: ["Impact", "Arial Black", "sans-serif"], // System fonts similar to Luckiest Guy
});

const sansita_swashed = Sansita_Swashed({
  subsets: ["latin"],
  weight: "600",
  display: "swap", // Shows fallback font immediately while loading
  fallback: ["Georgia", "serif"], // System fonts similar to Sansita Swashed
});

function Header() {
  return (
    <nav className="w-full h-16 text-green-600 border-b border-gray-400 flex items-center justify-center px-5 sm:px-10">
      <Link href="/" className="inline-flex gap-2 ">
        <Image src="/favicon.png" alt="Secret Rudolph" width={30} height={30} />
        <span className={`${sansita_swashed.className} text-xl md:text-2xl`}>
          Secret Rudolph
        </span>
      </Link>
    </nav>
  );
}

export default Header;
