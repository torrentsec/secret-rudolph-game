import React from "react";
import GithubIcon from "@/components/icons/GithubIcon";
import LinkedIn from "@/components/icons/LinkedIn";
import Email from "@/components/icons/Email";

function Footer() {
  return (
    <footer className="text-sm border-t border-gray-300 w-full mx-auto py-5 px-5 sm:px-10 flex flex-row justify-between">
      <div>
        <p>© 2025 Secret Rudolph Game</p>
        <p>
          Created with ❤️ by{" "}
          <a href="https://www.linkedin.com/in/jiho-bok/" target="_blank">
            Jiho Bok
          </a>
        </p>
      </div>

      <address className="mt-1 flex flex-row sm:items-center gap-2">
        <p className="hidden sm:block">Report bugs or issue at</p>
        <a
          className="hover:cursor-pointer border-2 border-white rounded-lg p-2 text-white w-10 h-10 hover:opacity-80"
          href="https://github.com/Jiho31/secret-rudolph-game/issues"
          target="_blank"
        >
          <GithubIcon />
        </a>
        <p className="hidden sm:block">Contact me at</p>
        <a
          className="hover:cursor-pointer border-2 border-white rounded-lg p-2 text-white w-10 h-10 hover:opacity-80"
          href="mailto:bok.jiho@gmail.com"
        >
          <Email />
        </a>
        <a
          className="hover:cursor-pointer border-2 border-white rounded-lg p-2 text-white w-10 h-10 hover:opacity-80"
          href="https://www.linkedin.com/in/jiho-bok/"
          target="_blank"
        >
          <LinkedIn />
        </a>
        {/* <span> | </span>
        <li className="underline semibold">
          <Link href="https://www.linkedin.com/in/jiho-bok/" target="_blank">
            LinkedIn
          </Link>
        </li> */}
      </address>
    </footer>
  );
}

export default Footer;
