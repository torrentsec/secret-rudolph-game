import { ItemKey } from "@/game/items";

export type GameResult = {
  id?: string;
  player: string;
  score: number;
};

export type GameInformation = {
  name: string;
  likes: ItemKey[];
  dislikes: ItemKey[];
  results: GameResult[];
  creationDate?: string;
};

export type CreateGameData = {
  name: string;
  likes: ItemKey[];
  dislikes: ItemKey[];
  results: GameResult[];
  creationDate: string;
};
