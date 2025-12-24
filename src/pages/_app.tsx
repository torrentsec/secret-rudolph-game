import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Luckiest_Guy, Montserrat, Open_Sans, Roboto } from "next/font/google";
import Head from "next/head";

// const open_sans = Open_Sans({ subsets: ["latin"], weight: "400" });
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap", // Shows fallback font immediately while loading
  fallback: ["Arial", "Helvetica", "sans-serif"], // System fonts to use if Google Fonts fail
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Secret Rudolph</title>
        <meta
          name="description"
          content="Play Secret Rudolph Game to find out what you're friends & families want for Christmas"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <main
        className={`${montserrat.className} h-auto min-h-[calc(100dvh-64px)] flex flex-col justify-center`}
      >
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  );
}
