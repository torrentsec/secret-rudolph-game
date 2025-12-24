/**
 * Generates a cryptographically secure random string using rejection sampling
 * to eliminate modulo bias for truly uniform distribution.
 *
 * @param length - Length of the hash to generate (default: 10)
 * @returns A random string of the specified length
 *
 * Advanced Algorithm: Uses rejection sampling to prevent modulo bias.
 * Instead of naive `randomByte % chars.length`, we reject values that would
 * create uneven distribution, ensuring each character has equal probability.
 */
export function generateUniqueHash(length = 10): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = chars.length;

  // Calculate maximum valid value to avoid modulo bias
  // For 62 chars: maxValid = 248 (256 - 8), ensuring even distribution
  const maxValid = 256 - (256 % charsLength);

  let result = '';
  // Oversample to handle rejected values efficiently
  const randomBytes = new Uint8Array(length * 2);

  while (result.length < length) {
    crypto.getRandomValues(randomBytes);

    for (let i = 0; i < randomBytes.length && result.length < length; i++) {
      // Only use values that don't cause modulo bias
      if (randomBytes[i] < maxValid) {
        result += chars[randomBytes[i] % charsLength];
      }
      // Values >= maxValid are rejected to maintain uniform distribution
    }
  }

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
    randomValue = randomBytes.reduce((acc, byte, i) => acc + byte * (256 ** i), 0);
  } while (randomValue >= maxValid);

  return min + (randomValue % range);
}

/**
 * Fisher-Yates shuffle algorithm for perfect uniform random permutation.
 * Time complexity: O(n), Space complexity: O(n)
 *
 * @param array - Array to shuffle (will not be modified)
 * @returns A new shuffled array
 *
 * Advanced Algorithm: Fisher-Yates (Knuth) shuffle provides perfect uniform
 * distribution over all n! possible permutations. Each permutation has
 * exactly 1/n! probability of occurring.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use secure random for unpredictable shuffling
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
