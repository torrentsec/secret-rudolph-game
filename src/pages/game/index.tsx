import dynamic from "next/dynamic";

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function GameApp() {
  //  References to the PhaserGame component (game and scene are exposed)

  return <AppWithoutSSR />;
}
