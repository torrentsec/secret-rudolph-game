import {
  collection,
  query,
  doc,
  setDoc,
  getDocs,
  getDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db as firebaseDB } from "../../firebase";
import { GameInformation, GameResult, CreateGameData } from "@/types/types";

// Validation regex for game codes
const GAME_CODE_REGEX = /^[A-Za-z0-9]{10}$/;

/**
 * Validates game code format
 */
function validateGameCode(gameCode: string): void {
  if (!GAME_CODE_REGEX.test(gameCode)) {
    throw new Error("Invalid game code format. Must be 10 alphanumeric characters.");
  }
}

/**
 * Creates a new game in Firestore
 *
 * @param gameCode - 10-character alphanumeric game code
 * @param data - Game data including name, likes, dislikes
 * @returns The game code for sharing
 */
const createGame = async ({
  gameCode,
  data,
}: {
  gameCode: string;
  data: CreateGameData;
}): Promise<string> => {
  try {
    validateGameCode(gameCode);

    const gameDocRef = doc(firebaseDB, "games", gameCode);
    await setDoc(gameDocRef, data);

    return gameCode;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to create game with code ${gameCode}:`, error);
    throw new Error(`Game creation failed: ${errorMessage}`);
  }
};

/**
 * Fetches a game by its code
 *
 * @param gameCode - 10-character alphanumeric game code
 * @returns Game information without results
 */
const fetchGame = async (gameCode: string): Promise<GameInformation> => {
  try {
    validateGameCode(gameCode);

    const docRef = doc(firebaseDB, "games", gameCode);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Game with code ${gameCode} not found`);
    }

    const data = docSnap.data();

    // Type assertion with validation
    if (!data.name || !Array.isArray(data.likes) || !Array.isArray(data.dislikes)) {
      throw new Error("Invalid game data structure");
    }

    return {
      name: data.name,
      likes: data.likes,
      dislikes: data.dislikes,
      results: data.results || [],
      creationDate: data.creationDate,
    } as GameInformation;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to fetch game ${gameCode}:`, error);
    throw new Error(`Failed to fetch game: ${errorMessage}`);
  }
};

/**
 * Adds a game result to the results subcollection
 *
 * @param gameCode - 10-character alphanumeric game code
 * @param data - Result data containing player name and score
 */
const addGameResult = async ({
  gameCode,
  data,
}: {
  gameCode: string;
  data: Omit<GameResult, "id">;
}): Promise<void> => {
  try {
    validateGameCode(gameCode);

    // Validate result data
    if (!data.player || typeof data.score !== "number") {
      throw new Error("Invalid result data: player and score are required");
    }

    // Use timestamp as document ID for uniqueness and ordering
    const resultId = Timestamp.now().toMillis().toString();
    const resultsRef = doc(firebaseDB, "games", gameCode, "results", resultId);

    await setDoc(resultsRef, data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to add result for game ${gameCode}:`, error);
    throw new Error(`Failed to save game result: ${errorMessage}`);
  }
};

/**
 * Fetches a game with all its results, ordered by score descending
 *
 * @param gameCode - 10-character alphanumeric game code
 * @returns Complete game information including sorted results
 */
const fetchGameWithResults = async (gameCode: string): Promise<GameInformation> => {
  try {
    validateGameCode(gameCode);

    // Fetch game data
    const gameRef = doc(firebaseDB, "games", gameCode);
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
      throw new Error(`Game with code ${gameCode} not found`);
    }

    const gameData = gameSnap.data();

    // Validate game data structure
    if (!gameData.name || !Array.isArray(gameData.likes) || !Array.isArray(gameData.dislikes)) {
      throw new Error("Invalid game data structure");
    }

    // Fetch results subcollection
    const resultsRef = collection(firebaseDB, "games", gameCode, "results");
    const resultsQuery = query(resultsRef, orderBy("score", "desc"));
    const resultsSnap = await getDocs(resultsQuery);

    const results: GameResult[] = [];
    resultsSnap.forEach((resultDoc) => {
      const resultData = resultDoc.data();
      results.push({
        id: resultDoc.id,
        player: resultData.player,
        score: resultData.score,
      });
    });

    // Combine game data with results
    return {
      name: gameData.name,
      likes: gameData.likes,
      dislikes: gameData.dislikes,
      results,
      creationDate: gameData.creationDate,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to fetch game with results ${gameCode}:`, error);
    throw new Error(`Failed to fetch game data: ${errorMessage}`);
  }
};

export { createGame, fetchGame, addGameResult, fetchGameWithResults };
