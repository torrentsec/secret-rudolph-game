import Image from "next/image";
import Link from "next/link";

function Header() {
  return (
    <nav>
      <Link href="/">
        <Image src="/favicon.png" alt="Secret Rudolph" width={30} height={30} />
        <span>Secret Rudolph</span>
      </Link>
    </nav>
  );
}

export default Header;
