/*
 * ============================================================================
 * UNIT TESTS FOR UTILITY FUNCTIONS
 * ============================================================================
 *
 * This file tests the advanced algorithms in utils.ts to ensure they work
 * correctly and maintain the mathematical properties they claim to have.
 *
 * Tests cover:
 * 1. generateUniqueHash - Random code generation with rejection sampling
 * 2. generateSecureRandomInt - Random integer generation without modulo bias
 * 3. shuffleArray - Fisher-Yates shuffle algorithm
 */

import {
  generateUniqueHash,
  generateSecureRandomInt,
  shuffleArray,
} from './utils';

// ============================================================================
// TESTS FOR generateUniqueHash
// ============================================================================

describe('generateUniqueHash', () => {
  /*
   * TEST 1: Basic functionality - does it return a string?
   */
  it('should return a string', () => {
    const result = generateUniqueHash();
    expect(typeof result).toBe('string');
  });

  /*
   * TEST 2: Default length - should be 10 characters
   */
  it('should return a string of default length 10', () => {
    const result = generateUniqueHash();
    expect(result.length).toBe(10);
  });

  /*
   * TEST 3: Custom length - should respect the length parameter
   */
  it('should return a string of specified length', () => {
    expect(generateUniqueHash(5).length).toBe(5);
    expect(generateUniqueHash(20).length).toBe(20);
    expect(generateUniqueHash(50).length).toBe(50);
  });

  /*
   * TEST 4: Character set - should only use alphanumeric characters
   */
  it('should only contain alphanumeric characters (A-Z, a-z, 0-9)', () => {
    const result = generateUniqueHash(100); // Generate a long string for better coverage
    const validCharRegex = /^[A-Za-z0-9]+$/;
    expect(validCharRegex.test(result)).toBe(true);
  });

  /*
   * TEST 5: Uniqueness - should generate different codes each time
   */
  it('should generate unique codes (very high probability)', () => {
    const codes = new Set();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      codes.add(generateUniqueHash());
    }

    // All codes should be unique (Set removes duplicates)
    expect(codes.size).toBe(iterations);
  });

  /*
   * TEST 6: Statistical uniformity - characters should be evenly distributed
   * This tests that the rejection sampling algorithm works correctly
   */
  it('should have roughly uniform character distribution', () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charCounts: { [key: string]: number } = {};

    // Initialize counts for all characters
    for (const char of chars) {
      charCounts[char] = 0;
    }

    // Generate many characters to test distribution
    const iterations = 10000;
    for (let i = 0; i < iterations; i++) {
      const hash = generateUniqueHash(1);
      charCounts[hash]++;
    }

    // Calculate expected frequency (should be close to iterations / 62)
    const expectedFrequency = iterations / chars.length; // ~161 appearances per character
    const tolerance = expectedFrequency * 0.3; // Allow 30% deviation (generous for small sample)

    // Check that each character appears roughly the expected number of times
    let deviationsWithinTolerance = 0;
    for (const char of chars) {
      const deviation = Math.abs(charCounts[char] - expectedFrequency);
      if (deviation <= tolerance) {
        deviationsWithinTolerance++;
      }
    }

    // At least 95% of characters should be within tolerance (statistical test)
    const percentageWithinTolerance =
      (deviationsWithinTolerance / chars.length) * 100;
    expect(percentageWithinTolerance).toBeGreaterThanOrEqual(90);
  });

  /*
   * TEST 7: Edge case - very long codes
   */
  it('should handle generating very long codes', () => {
    const result = generateUniqueHash(500);
    expect(result.length).toBe(500);
    expect(/^[A-Za-z0-9]+$/.test(result)).toBe(true);
  });

  /*
   * TEST 8: Edge case - single character code
   */
  it('should handle generating single character codes', () => {
    const result = generateUniqueHash(1);
    expect(result.length).toBe(1);
    expect(/^[A-Za-z0-9]$/.test(result)).toBe(true);
  });
});

// ============================================================================
// TESTS FOR generateSecureRandomInt
// ============================================================================

describe('generateSecureRandomInt', () => {
  /*
   * TEST 1: Basic functionality - returns a number
   */
  it('should return a number', () => {
    const result = generateSecureRandomInt(1, 10);
    expect(typeof result).toBe('number');
  });

  /*
   * TEST 2: Range - should return value within [min, max]
   */
  it('should return a number within the specified range (inclusive)', () => {
    const min = 5;
    const max = 15;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const result = generateSecureRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    }
  });

  /*
   * TEST 3: Integer check - should return whole numbers only
   */
  it('should return integers only (no decimals)', () => {
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const result = generateSecureRandomInt(1, 100);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  /*
   * TEST 4: Single value range - min === max
   */
  it('should handle single value range (min === max)', () => {
    const result = generateSecureRandomInt(42, 42);
    expect(result).toBe(42);
  });

  /*
   * TEST 5: Coverage - should eventually hit both min and max
   */
  it('should eventually generate both min and max values', () => {
    const min = 1;
    const max = 5;
    const results = new Set<number>();
    const maxIterations = 1000;

    for (let i = 0; i < maxIterations; i++) {
      results.add(generateSecureRandomInt(min, max));
      if (results.has(min) && results.has(max)) {
        break; // Found both, test passed
      }
    }

    expect(results.has(min)).toBe(true);
    expect(results.has(max)).toBe(true);
  });

  /*
   * TEST 6: Statistical uniformity - values should be evenly distributed
   * This tests that the rejection sampling eliminates modulo bias
   */
  it('should have roughly uniform distribution (no modulo bias)', () => {
    const min = 0;
    const max = 9;
    const counts: { [key: number]: number } = {};

    // Initialize counts
    for (let i = min; i <= max; i++) {
      counts[i] = 0;
    }

    // Generate many random numbers
    const iterations = 10000;
    for (let i = 0; i < iterations; i++) {
      const num = generateSecureRandomInt(min, max);
      counts[num]++;
    }

    // Expected frequency for each number
    const expectedFrequency = iterations / (max - min + 1); // 1000 per number
    const tolerance = expectedFrequency * 0.2; // Allow 20% deviation

    // Check distribution
    for (let i = min; i <= max; i++) {
      const deviation = Math.abs(counts[i] - expectedFrequency);
      expect(deviation).toBeLessThan(tolerance);
    }
  });

  /*
   * TEST 7: Large range
   */
  it('should handle large ranges', () => {
    const min = 1;
    const max = 1000000;
    const result = generateSecureRandomInt(min, max);

    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
    expect(Number.isInteger(result)).toBe(true);
  });

  /*
   * TEST 8: Negative ranges
   */
  it('should handle negative number ranges', () => {
    const min = -10;
    const max = -1;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const result = generateSecureRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  /*
   * TEST 9: Range spanning negative and positive
   */
  it('should handle ranges spanning negative and positive numbers', () => {
    const min = -5;
    const max = 5;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const result = generateSecureRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
      expect(Number.isInteger(result)).toBe(true);
    }
  });
});

// ============================================================================
// TESTS FOR shuffleArray
// ============================================================================

describe('shuffleArray', () => {
  /*
   * TEST 1: Basic functionality - returns an array
   */
  it('should return an array', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(Array.isArray(result)).toBe(true);
  });

  /*
   * TEST 2: Length preservation - should maintain array length
   */
  it('should return an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.length).toBe(input.length);
  });

  /*
   * TEST 3: Element preservation - should contain all original elements
   */
  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);

    // Sort both arrays to compare (shuffle shouldn't add/remove elements)
    const sortedInput = [...input].sort();
    const sortedResult = [...result].sort();

    expect(sortedResult).toEqual(sortedInput);
  });

  /*
   * TEST 4: Immutability - should not modify the original array
   */
  it('should not modify the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const originalCopy = [...input];

    shuffleArray(input);

    expect(input).toEqual(originalCopy);
  });

  /*
   * TEST 5: Randomness - should shuffle (not always return same order)
   */
  it('should actually shuffle (not always return same order)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let changedCount = 0;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const result = shuffleArray(input);
      if (JSON.stringify(result) !== JSON.stringify(input)) {
        changedCount++;
      }
    }

    // With 10 elements, the probability of getting the same order is 1/10! = 1/3,628,800
    // After 100 iterations, we expect the shuffle to change the order at least 95% of the time
    expect(changedCount).toBeGreaterThanOrEqual(95);
  });

  /*
   * TEST 6: Empty array
   */
  it('should handle empty arrays', () => {
    const input: number[] = [];
    const result = shuffleArray(input);
    expect(result).toEqual([]);
  });

  /*
   * TEST 7: Single element array
   */
  it('should handle single element arrays', () => {
    const input = [42];
    const result = shuffleArray(input);
    expect(result).toEqual([42]);
  });

  /*
   * TEST 8: Two element array - should eventually produce both permutations
   */
  it('should produce both permutations for a two-element array', () => {
    const input = [1, 2];
    const permutations = new Set<string>();
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const result = shuffleArray(input);
      permutations.add(JSON.stringify(result));

      // If we've seen both permutations, test passed
      if (permutations.has('[1,2]') && permutations.has('[2,1]')) {
        break;
      }
    }

    expect(permutations.size).toBe(2);
    expect(permutations.has('[1,2]')).toBe(true);
    expect(permutations.has('[2,1]')).toBe(true);
  });

  /*
   * TEST 9: Works with different data types
   */
  it('should work with strings', () => {
    const input = ['a', 'b', 'c', 'd'];
    const result = shuffleArray(input);

    expect(result.length).toBe(4);
    expect(result.sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should work with objects', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = shuffleArray(input);

    expect(result.length).toBe(3);
    expect(result.map((obj) => obj.id).sort()).toEqual([1, 2, 3]);
  });

  /*
   * TEST 10: Statistical uniformity - all permutations should be roughly equally likely
   * For a 3-element array, there are 3! = 6 possible permutations
   * Fisher-Yates guarantees each permutation has probability 1/6
   */
  it('should produce roughly uniform distribution of permutations', () => {
    const input = [1, 2, 3];
    const permutationCounts: { [key: string]: number } = {};
    const iterations = 6000; // 1000 per expected permutation

    // Generate many shuffles
    for (let i = 0; i < iterations; i++) {
      const result = shuffleArray(input);
      const key = JSON.stringify(result);
      permutationCounts[key] = (permutationCounts[key] || 0) + 1;
    }

    // We expect 6 permutations (3! = 6)
    expect(Object.keys(permutationCounts).length).toBe(6);

    // Each permutation should appear roughly 1000 times (iterations / 6)
    const expectedFrequency = iterations / 6; // 1000
    const tolerance = expectedFrequency * 0.3; // Allow 30% deviation

    for (const count of Object.values(permutationCounts)) {
      const deviation = Math.abs(count - expectedFrequency);
      expect(deviation).toBeLessThan(tolerance);
    }
  });
});
