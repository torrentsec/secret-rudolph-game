/*
 * ============================================================================
 * UTILITY FUNCTIONS - Helper functions with advanced algorithms
 * ============================================================================
 *
 * This file contains specialized utility functions that use advanced algorithms
 * to solve common problems in a mathematically correct and efficient way.
 */

/*
 * GENERATE UNIQUE HASH - Creates random game codes
 * ============================================================================
 *
 * PURPOSE:
 * Creates unpredictable, random game codes like "aB3x9Km2Qp" that players use
 * to share their games with friends. Each code must be:
 * - Unique (different every time)
 * - Unpredictable (can't guess what the next code will be)
 * - Fair (all characters have equal chance of appearing)
 *
 * THE PROBLEM - Modulo Bias:
 * ============================================================================
 * The naive (simple but wrong) way to generate random codes:
 *
 *   1. Get a random number (0-255)
 *   2. Divide by alphabet length (62 characters)
 *   3. Use the remainder to pick a character
 *
 * Example with 62 characters (A-Z, a-z, 0-9):
 *   - Random byte values: 0, 1, 2, ..., 255 (256 possible values)
 *   - 256 ÷ 62 = 4 with remainder 8
 *   - This means:
 *     • Values 0-247 map evenly (each character appears 4 times)
 *     • Values 248-255 map to first 8 characters (they appear 5 times!)
 *
 * RESULT: First 8 characters are ~12% more likely than others!
 * This creates a pattern that could theoretically be exploited.
 *
 * THE SOLUTION - Rejection Sampling:
 * ============================================================================
 * We REJECT any random values that would cause unfair distribution:
 *
 *   1. Calculate the "safe zone": 0-247 (values that distribute evenly)
 *   2. Get a random number (0-255)
 *   3. If it's in the safe zone (0-247): USE IT! ✓
 *   4. If it's outside (248-255): REJECT IT and try again ✗
 *
 * This ensures PERFECT uniform distribution - every character has exactly
 * the same probability of being chosen (1/62 = 1.613%).
 *
 * REAL-WORLD ANALOGY:
 * Imagine picking raffle tickets:
 * - BAD: Some tickets are duplicated (unfair, biased)
 * - GOOD: Throw away duplicates, ensure one ticket per person (fair)
 *
 * SECURITY BENEFIT:
 * - Uses crypto.getRandomValues() - cryptographically secure randomness
 * - No patterns = game codes can't be guessed or predicted
 * - Safe for generating codes that could affect user data
 *
 * Parameters:
 * @param length - How many characters long the code should be (default: 10)
 *
 * Returns:
 * @returns A random string like "aB3x9Km2Qp" with perfect uniform distribution
 *
 * Advanced Algorithm: Rejection Sampling for Unbiased Random Selection
 */
export function generateUniqueHash(length = 10): string {
  // STEP 1: Define our character set (alphabet)
  // These are all the characters we can use in the game code
  // 26 uppercase (A-Z) + 26 lowercase (a-z) + 10 digits (0-9) = 62 total characters
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = chars.length; // Store length (62) for calculations

  // STEP 2: Calculate the "safe zone" - values we can use without bias
  // Math explanation:
  //   - Random bytes give us values 0-255 (256 possible values)
  //   - 256 ÷ 62 = 4 remainder 8
  //   - Safe zone: 0 to 247 (256 - 8 = 248 values)
  //   - These 248 values divide evenly: 248 ÷ 62 = exactly 4 (no remainder!)
  //   - Values 248-255 would cause bias, so we reject them
  const maxValid = 256 - (256 % charsLength);
  // For 62 characters: maxValid = 248

  // STEP 3: Prepare variables for the generation loop
  let result = ""; // This will build up our final code, starting empty

  // Create a buffer (storage space) for random numbers
  // We request length * 2 bytes (extra, in case some get rejected)
  // Example: For a 10-character code, we request 20 random bytes
  const randomBytes = new Uint8Array(length * 2);

  // STEP 4: Generate the code character by character
  // Keep going until we have enough characters
  while (result.length < length) {
    // Get a fresh batch of cryptographically secure random numbers
    // This fills randomBytes array with random values (0-255 each)
    crypto.getRandomValues(randomBytes);

    // Look through each random byte we got
    for (let i = 0; i < randomBytes.length && result.length < length; i++) {
      // Get the byte value (TypeScript strict mode requires null check)
      const byte = randomBytes[i];
      if (byte === undefined) continue;

      // CHECK: Is this random value in the "safe zone"?
      if (byte < maxValid) {
        // ✓ YES - Safe to use! This won't cause bias

        // Convert the random number to a character index
        // Example: randomByte = 185, charsLength = 62
        //          185 % 62 = 61 → picks character at position 61 (last character '9')
        const charIndex = byte % charsLength;

        // Add the character to our result
        result += chars[charIndex];
      }
      // ✗ NO - Reject this value (it's 248-255)
      // We skip it and move to the next random value
      // This is the "rejection" part of "rejection sampling"
    }
  }

  // STEP 5: Return the finished code
  // Example result: "aB3x9Km2Qp" (exactly 10 random characters)
  return result;
}

/**
 * Generates a cryptographically secure random integer in the range [min, max] (inclusive).
 * Uses rejection sampling to eliminate modulo bias.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns A random integer in [min, max]
 *
 * Advanced Algorithm: Rejection sampling prevents modulo bias that occurs with
 * naive `randomByte % range` approach, ensuring true uniform distribution.
 */
export function generateSecureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValid = 256 ** bytesNeeded - (256 ** bytesNeeded % range);

  let randomValue: number;
  const randomBytes = new Uint8Array(bytesNeeded);

  do {
    crypto.getRandomValues(randomBytes);
    randomValue = randomBytes.reduce((acc, byte, i) => acc + byte * 256 ** i, 0);
  } while (randomValue >= maxValid);

  return min + (randomValue % range);
}

/*
 * FISHER-YATES SHUFFLE - Randomly shuffle an array
 * ============================================================================
 *
 * PURPOSE:
 * Randomly shuffle the order of items in an array, like shuffling a deck of cards.
 * Used in the game to randomize which items appear, preventing predictable patterns.
 *
 * WHY THIS MATTERS FOR THE GAME:
 * Without shuffling, items would appear in the same order every time:
 *   - Boring! Players would memorize the pattern
 *   - Unfair! Some items might appear more/less than others
 *
 * With shuffling, items appear in random order:
 *   - Exciting! Every game feels different
 *   - Fair! All items have equal chance of appearing next
 *
 * THE ALGORITHM - Fisher-Yates (invented in 1938, still the best!)
 * ============================================================================
 *
 * WRONG WAY (Common mistake):
 *   - Pick two random positions
 *   - Swap them
 *   - Repeat many times
 *   - Problem: This creates bias! Some arrangements are more likely than others
 *
 * RIGHT WAY (Fisher-Yates):
 *   - Start from the end of the array
 *   - For each position:
 *     1. Pick a random position from 0 to current position
 *     2. Swap current position with the randomly chosen one
 *     3. Move to previous position
 *   - Continue until you reach the beginning
 *
 * VISUAL EXAMPLE with [A, B, C, D]:
 *   Step 1: Pick random from [A, B, C, D] → say C → swap D with C → [A, B, D, C]
 *   Step 2: Pick random from [A, B, D] → say A → swap D with A → [D, B, A, C]
 *   Step 3: Pick random from [D, B] → say B → swap B with B → [D, B, A, C]
 *   Done! Result: [D, B, A, C]
 *
 * MATHEMATICAL PROOF OF FAIRNESS:
 *   - For N items, there are N! (N factorial) possible arrangements
 *   - Example: 4 items = 4! = 4 × 3 × 2 × 1 = 24 possible arrangements
 *   - Fisher-Yates gives EVERY arrangement exactly 1/24 probability
 *   - Perfect uniform distribution - no bias!
 *
 * WHY IT'S EFFICIENT:
 *   - Time Complexity: O(n) - goes through array once, very fast
 *   - Space Complexity: O(n) - creates one copy of the array
 *   - Can't be faster! You must touch every element at least once
 *
 * REAL-WORLD ANALOGY:
 * Imagine shuffling a deck of cards:
 * - BAD: Randomly swap cards many times (slow, might still have patterns)
 * - GOOD: Go through deck once, picking random cards (fast, perfect shuffle)
 *
 * GAME USAGE EXAMPLE:
 * Input:  ["ring", "bike", "tree", "cake"]
 * Output: ["tree", "ring", "cake", "bike"] (random order, different each time)
 *
 * Parameters:
 * @param array - Array to shuffle (original is NOT modified - we make a copy)
 *
 * Returns:
 * @returns A new array with the same items in random order
 *
 * Advanced Algorithm: Fisher-Yates (Knuth) Shuffle - O(n) Perfect Uniform Shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  // STEP 1: Make a copy of the original array
  // The spread operator [...array] creates a new array with same items
  // This ensures we DON'T modify the original (good programming practice!)
  const shuffled = [...array];

  // STEP 2: Shuffle by working backwards through the array
  // Start at the last position (length - 1) and work down to position 1
  // We stop at 1 because when there's only one item left, it's already in place!
  for (let i = shuffled.length - 1; i > 0; i--) {
    // STEP 3: Pick a random position from 0 to current position (inclusive)
    // Math.random() gives us a decimal between 0 and 1 (like 0.7382941)
    // Multiply by (i + 1) to get a range from 0 to i
    // Math.floor() rounds down to get a whole number (integer)
    //
    // Example when i = 3:
    //   Math.random() = 0.8 (random)
    //   0.8 * 4 = 3.2
    //   Math.floor(3.2) = 3
    //   j = 3 (picked position 3)
    const j = Math.floor(Math.random() * (i + 1));

    // STEP 4: Swap the items at positions i and j
    // This fancy syntax is called "destructuring assignment"
    // It swaps two values in one line (very elegant!)
    //
    // Traditional way (3 lines):
    //   const temp = shuffled[i];
    //   shuffled[i] = shuffled[j];
    //   shuffled[j] = temp;
    //
    // Modern way (1 line) - with strict null checks:
    const valueI = shuffled[i];
    const valueJ = shuffled[j];
    if (valueI !== undefined && valueJ !== undefined) {
      [shuffled[i], shuffled[j]] = [valueJ, valueI];
    }
    // What this does:
    //   - Creates temporary array [shuffled[j], shuffled[i]] (swapped order)
    //   - Assigns first value to shuffled[i]
    //   - Assigns second value to shuffled[j]
    //   - Result: values are swapped!
  }

  // STEP 5: Return the shuffled array
  // The original array is unchanged, we return the shuffled copy
  return shuffled;
}
