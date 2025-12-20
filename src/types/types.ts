import { ItemKey } from "@/game/items";

type GameInformation = {
  name: string;
  likes: ItemKey[];
  dislikes: ItemKey[];
  result: Array<{ player: string; score: number }>;
};

export { type GameInformation };
