/*
 * ============================================================================
 * FIRESTORE DATABASE UTILITIES - Saving and retrieving game data
 * ============================================================================
 *
 * This file handles all communication with the Firebase Firestore database.
 * Think of Firestore as a "cloud filing cabinet" where we store game data
 * so players can share games and see results even after closing their browser.
 *
 * DATABASE STRUCTURE:
 * Our data is organized like a filing cabinet:
 *
 *   games/ (main folder)
 *   ├── aB3x9Km2Qp/ (game code - like a folder name)
 *   │   ├── name: "John"
 *   │   ├── likes: ["ring", "bike", "tree"]
 *   │   ├── dislikes: ["poo", "coal"]
 *   │   └── results/ (subfolder with game results)
 *   │       ├── 1703123456789/  (timestamp ID)
 *   │       │   ├── player: "Sarah"
 *   │       │   └── score: 85
 *   │       └── 1703123789456/
 *   │           ├── player: "Mike"
 *   │           └── score: 92
 *   └── xY7bN4pQ8m/ (another game)
 *       └── ...
 *
 * WHY USE A DATABASE?
 * - Players can share game codes with friends
 * - Results persist even after closing the browser
 * - Multiple people can play the same game
 * - Real-time leaderboards with automatic sorting
 */

// Import Firebase Firestore functions
// These are like "tools" for working with the database
import {
  collection,  // Get a folder (like opening a filing cabinet drawer)
  query,       // Search for specific data (like looking for files)
  doc,         // Get a specific document (like pulling out one file)
  setDoc,      // Save data (like writing to a file)
  getDocs,     // Get multiple documents (like grabbing several files)
  getDoc,      // Get one document (like reading one file)
  Timestamp,   // Create timestamps (like a date stamp on documents)
  orderBy,     // Sort results (like organizing files alphabetically)
} from "firebase/firestore";

// Import our database connection (this connects us to the cloud database)
import { db as firebaseDB } from "../../firebase";

// Import TypeScript types (these define what our data should look like)
import { GameInformation, GameResult, CreateGameData } from "@/types/types";

/*
 * GAME CODE VALIDATION
 * ============================================================================
 * Regular expression (regex) to check if a game code is valid.
 * A valid code must be:
 *   - Exactly 10 characters long
 *   - Only letters (A-Z, a-z) and numbers (0-9)
 *   - No spaces, symbols, or special characters
 *
 * Examples:
 *   ✓ "aB3x9Km2Qp" - Valid (10 alphanumeric characters)
 *   ✓ "1234567890" - Valid (10 digits)
 *   ✗ "abc"        - Invalid (too short)
 *   ✗ "aB3x9Km2Q!" - Invalid (has special character !)
 */
const GAME_CODE_REGEX = /^[A-Za-z0-9]{10}$/;

/*
 * VALIDATE GAME CODE - Check if a game code is properly formatted
 * ============================================================================
 *
 * This function checks if a game code follows the correct format.
 * If the code is invalid, it throws an error (stops execution and shows error message).
 *
 * WHY WE VALIDATE:
 * - Prevent database queries with malformed codes (waste of resources)
 * - Give clear error messages to users ("Invalid code" vs generic database error)
 * - Security: Prevent injection attacks or weird characters
 *
 * Parameters:
 * @param gameCode - The game code to validate (e.g., "aB3x9Km2Qp")
 *
 * Returns:
 * Nothing if valid, throws error if invalid
 *
 * Example:
 *   validateGameCode("aB3x9Km2Qp") → Nothing (code is valid)
 *   validateGameCode("abc") → Throws error "Invalid game code format..."
 */
function validateGameCode(gameCode: string): void {
  // Test if the code matches our pattern (10 alphanumeric characters)
  if (!GAME_CODE_REGEX.test(gameCode)) {
    // Code is invalid - throw an error with a helpful message
    throw new Error("Invalid game code format. Must be 10 alphanumeric characters.");
  }
  // If we reach here, the code is valid (function ends normally)
}

/*
 * CREATE GAME - Save a new game to the database
 * ============================================================================
 *
 * PURPOSE:
 * When a player creates a new game (fills out what they like/dislike),
 * this function saves all that information to the cloud database with a unique code.
 *
 * HOW IT WORKS:
 * 1. Validate the game code format
 * 2. Create a "document" (like a file) in the database
 * 3. Write all the game data to that document
 * 4. Return the game code (so the user can share it)
 *
 * REAL-WORLD ANALOGY:
 * Like creating a new file in Google Drive:
 * - File name: The game code (e.g., "aB3x9Km2Qp")
 * - File contents: Name, likes, dislikes
 * - Location: In the "games" folder
 *
 * Parameters:
 * @param gameCode - The unique code for this game (10 characters)
 * @param data - All the game information:
 *   - name: Player's nickname (e.g., "John")
 *   - likes: Array of liked items (e.g., ["ring", "bike"])
 *   - dislikes: Array of disliked items (e.g., ["poo"])
 *   - results: Empty array (no one has played yet)
 *   - creationDate: When the game was created
 *
 * Returns:
 * @returns The game code (so it can be displayed to the user)
 *
 * Error Handling:
 * - If code is invalid → Error: "Invalid game code format"
 * - If database save fails → Error: "Game creation failed: [reason]"
 */
const createGame = async ({
  gameCode,
  data,
}: {
  gameCode: string;
  data: CreateGameData;
}): Promise<string> => {
  try {
    // STEP 1: Validate the game code format
    // This ensures the code is exactly 10 alphanumeric characters
    validateGameCode(gameCode);

    // STEP 2: Create a reference to where we'll store this game
    // Think of this as saying "I want to create a file at games/aB3x9Km2Qp"
    const gameDocRef = doc(firebaseDB, "games", gameCode);

    // STEP 3: Save the game data to the database
    // The 'await' keyword means "wait for this to finish before continuing"
    // (Saving to the cloud takes time, like uploading a file)
    await setDoc(gameDocRef, data);

    // STEP 4: Return the game code (so the UI can show it to the user)
    return gameCode;

  } catch (error) {
    // ERROR HANDLING: Something went wrong!
    // Could be: invalid code, network failure, database permissions, etc.

    // Extract a readable error message (if error is an Error object)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Log the error to the console (for debugging)
    console.error(`Failed to create game with code ${gameCode}:`, error);

    // Throw a new error with context (so calling code knows what happened)
    throw new Error(`Game creation failed: ${errorMessage}`);
  }
};

/*
 * FETCH GAME - Retrieve game information from the database
 * ============================================================================
 *
 * PURPOSE:
 * When a player enters a game code to play, this function retrieves
 * all the information about that game (who created it, what they like/dislike).
 *
 * HOW IT WORKS:
 * 1. Validate the game code
 * 2. Look up the game in the database
 * 3. Check if it exists
 * 4. Validate the data structure (make sure it has all required fields)
 * 5. Return the game information
 *
 * REAL-WORLD ANALOGY:
 * Like looking up a file in Google Drive by its name:
 * - Search for file "aB3x9Km2Qp" in the "games" folder
 * - If found → Read its contents and return them
 * - If not found → Error "File doesn't exist"
 *
 * Parameters:
 * @param gameCode - The game code to look up (e.g., "aB3x9Km2Qp")
 *
 * Returns:
 * @returns GameInformation object containing:
 *   - name: Creator's nickname
 *   - likes: Array of liked items
 *   - dislikes: Array of disliked items
 *   - results: Empty array (use fetchGameWithResults for leaderboard)
 *   - creationDate: When the game was created
 *
 * Error Handling:
 * - If code is invalid → Error: "Invalid game code format"
 * - If game doesn't exist → Error: "Game with code XXX not found"
 * - If data is corrupted → Error: "Invalid game data structure"
 */
const fetchGame = async (gameCode: string): Promise<GameInformation> => {
  try {
    // STEP 1: Validate the game code
    validateGameCode(gameCode);

    // STEP 2: Create a reference to the game document
    // Like saying "I want to read the file at games/aB3x9Km2Qp"
    const docRef = doc(firebaseDB, "games", gameCode);

    // STEP 3: Fetch the game data from the database
    // The 'await' means "wait for the database to respond"
    const docSnap = await getDoc(docRef);

    // STEP 4: Check if the game exists
    if (!docSnap.exists()) {
      // Game not found - maybe the code was typed wrong?
      throw new Error(`Game with code ${gameCode} not found`);
    }

    // STEP 5: Extract the data from the database response
    const data = docSnap.data();

    // STEP 6: Validate the data structure
    // Make sure it has all the required fields (name, likes, dislikes)
    // This prevents crashes if the database data is corrupted or incomplete
    if (!data.name || !Array.isArray(data.likes) || !Array.isArray(data.dislikes)) {
      throw new Error("Invalid game data structure");
    }

    // STEP 7: Return the game information in the correct format
    // 'as GameInformation' tells TypeScript "trust me, this matches the type"
    return {
      name: data.name,
      likes: data.likes,
      dislikes: data.dislikes,
      results: data.results || [],  // Default to empty array if no results
      creationDate: data.creationDate,
    } as GameInformation;

  } catch (error) {
    // ERROR HANDLING
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to fetch game ${gameCode}:`, error);
    throw new Error(`Failed to fetch game: ${errorMessage}`);
  }
};

/*
 * ADD GAME RESULT - Save a player's score to the leaderboard
 * ============================================================================
 *
 * PURPOSE:
 * After a player finishes playing a game, this function saves their
 * score to the database so it appears on the leaderboard.
 *
 * HOW IT WORKS:
 * 1. Validate the game code
 * 2. Validate the result data (player name and score)
 * 3. Create a unique ID using current timestamp
 * 4. Save the result to the results subcollection
 *
 * DATABASE PATH:
 * Results are saved in a subcollection:
 *   games/aB3x9Km2Qp/results/1703123456789
 *   ├── player: "Sarah"
 *   └── score: 85
 *
 * WHY USE TIMESTAMP AS ID?
 * - Guaranteed to be unique (unless two results saved in same millisecond)
 * - Natural ordering (newer results have higher IDs)
 * - Simple and efficient
 *
 * REAL-WORLD ANALOGY:
 * Like adding a new row to a Google Sheets leaderboard:
 * - Row ID: Timestamp
 * - Column A: Player name
 * - Column B: Score
 *
 * Parameters:
 * @param gameCode - Which game this result belongs to
 * @param data - The result data:
 *   - player: Player's name (e.g., "Sarah")
 *   - score: Final score (e.g., 85)
 *
 * Returns:
 * Nothing (void) - just saves to database
 *
 * Error Handling:
 * - If code is invalid → Error: "Invalid game code format"
 * - If player name missing → Error: "Invalid result data"
 * - If score is not a number → Error: "Invalid result data"
 */
const addGameResult = async ({
  gameCode,
  data,
}: {
  gameCode: string;
  data: Omit<GameResult, "id">;
}): Promise<void> => {
  // Note: Omit<GameResult, "id"> means "exclude the 'id' field from GameResult type"
  // This is because the 'id' field is auto-generated by the function, not provided by the caller

  try {
    // STEP 1: Validate the game code
    validateGameCode(gameCode);

    // STEP 2: Validate the result data
    // Make sure player name exists and score is a number
    if (!data.player || typeof data.score !== "number") {
      throw new Error("Invalid result data: player and score are required");
    }

    // STEP 3: Create a unique ID using current timestamp
    // Timestamp.now().toMillis() returns milliseconds since Jan 1, 1970
    // Example: 1703123456789
    // .toString() converts the number to a string (database IDs must be strings)
    const resultId = Timestamp.now().toMillis().toString();

    // STEP 4: Create a reference to where we'll save this result
    // Path: games/aB3x9Km2Qp/results/1703123456789
    const resultsRef = doc(firebaseDB, "games", gameCode, "results", resultId);

    // STEP 5: Save the result to the database
    await setDoc(resultsRef, data);

    // No return value - function just saves and exits

  } catch (error) {
    // ERROR HANDLING
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to add result for game ${gameCode}:`, error);
    throw new Error(`Failed to save game result: ${errorMessage}`);
  }
};

/*
 * FETCH GAME WITH RESULTS - Get game info AND leaderboard
 * ============================================================================
 *
 * PURPOSE:
 * Retrieve complete game information including the sorted leaderboard.
 * Used on the results page to show who created the game and all player scores.
 *
 * HOW IT WORKS:
 * 1. Fetch the main game document (name, likes, dislikes)
 * 2. Fetch the results subcollection (all player scores)
 * 3. Sort results by score (highest first)
 * 4. Combine everything into one object
 * 5. Return the complete data
 *
 * SORTING:
 * Results are automatically sorted from highest to lowest score:
 *   1st place: 95 points
 *   2nd place: 85 points
 *   3rd place: 70 points
 *   etc.
 *
 * REAL-WORLD ANALOGY:
 * Like opening a folder with two things inside:
 * - README file (game info)
 * - Leaderboard spreadsheet (sorted by score)
 * We read both and combine them into one report
 *
 * Parameters:
 * @param gameCode - The game code to look up
 *
 * Returns:
 * @returns Complete GameInformation with sorted results:
 *   - name: Creator's nickname
 *   - likes: Liked items
 *   - dislikes: Disliked items
 *   - results: Array of {player, score} sorted by score descending
 *   - creationDate: When game was created
 *
 * Error Handling:
 * - If code is invalid → Error: "Invalid game code format"
 * - If game doesn't exist → Error: "Game not found"
 * - If data is corrupted → Error: "Invalid game data structure"
 */
const fetchGameWithResults = async (gameCode: string): Promise<GameInformation> => {
  try {
    // STEP 1: Validate the game code
    validateGameCode(gameCode);

    // ===== PART A: Fetch the main game data =====

    // Create a reference to the game document
    const gameRef = doc(firebaseDB, "games", gameCode);

    // Fetch the game data
    const gameSnap = await getDoc(gameRef);

    // Check if game exists
    if (!gameSnap.exists()) {
      throw new Error(`Game with code ${gameCode} not found`);
    }

    // Extract the data
    const gameData = gameSnap.data();

    // Validate data structure
    if (!gameData.name || !Array.isArray(gameData.likes) || !Array.isArray(gameData.dislikes)) {
      throw new Error("Invalid game data structure");
    }

    // ===== PART B: Fetch all results =====

    // Create a reference to the results subcollection
    // Like opening the "results" folder inside the game folder
    const resultsRef = collection(firebaseDB, "games", gameCode, "results");

    // Create a query to get results sorted by score (highest first)
    // orderBy("score", "desc") means "sort by score, descending (high to low)"
    const resultsQuery = query(resultsRef, orderBy("score", "desc"));

    // Execute the query and get all results
    const resultsSnap = await getDocs(resultsQuery);

    // ===== PART C: Process the results =====

    // Create an empty array to store results
    const results: GameResult[] = [];

    // Loop through each result document
    // .forEach runs the function for each item in the collection
    resultsSnap.forEach((resultDoc) => {
      const resultData = resultDoc.data();

      // Add this result to our array
      results.push({
        id: resultDoc.id,        // Document ID (the timestamp)
        player: resultData.player,  // Player name
        score: resultData.score,    // Player score
      });
    });

    // ===== PART D: Combine and return =====

    // Return an object with all game data plus sorted results
    return {
      name: gameData.name,
      likes: gameData.likes,
      dislikes: gameData.dislikes,
      results,  // Already sorted by the orderBy query!
      creationDate: gameData.creationDate,
    };

  } catch (error) {
    // ERROR HANDLING
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to fetch game with results ${gameCode}:`, error);
    throw new Error(`Failed to fetch game data: ${errorMessage}`);
  }
};

// Export all functions so other files can use them
// Think of this as "making the functions available to the rest of the app"
export { createGame, fetchGame, addGameResult, fetchGameWithResults };
