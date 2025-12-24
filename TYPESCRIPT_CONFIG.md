# TypeScript Configuration

This document explains the TypeScript configuration for the Secret Rudolph Game project.

## Current Configuration

### Strict Mode ✅

The project uses TypeScript's `strict` mode, which enables the following checks:

- **`strictNullChecks`**: Prevents `null` and `undefined` from being valid values for most types
- **`strictFunctionTypes`**: Enforces stricter checking of function types
- **`strictBindCallApply`**: Checks that `bind`, `call`, and `apply` methods are invoked with correct arguments
- **`strictPropertyInitialization`**: Requires class properties to be initialized in the constructor
- **`noImplicitThis`**: Raises error when `this` has an implicit `any` type
- **`alwaysStrict`**: Emits `"use strict"` in JavaScript output
- **`noImplicitAny`**: Raises error on expressions and declarations with an implied `any` type

### Additional Safety Checks ✅

- **`noUncheckedIndexedAccess`**: Adds `undefined` to array/object access types
  - Example: `array[0]` has type `T | undefined` instead of just `T`
  - Prevents runtime errors from accessing non-existent array indices

- **`noFallthroughCasesInSwitch`**: Prevents fall-through in switch statements
  - Requires explicit `break` or `return` in each case

- **`forceConsistentCasingInFileNames`**: Prevents case-sensitivity issues across OSes
  - Ensures `import './File'` fails if actual filename is `file.ts`

## Future Improvements

These strict checks are documented but not yet enabled due to existing code issues:

### `noImplicitOverride` (Planned)

**What it does**: Requires `override` keyword when overriding base class methods

**Current blockers**:
- Phaser Scene classes override methods without `override` keyword
- Affects ~5 files (Game.ts, GameOver.ts, MainMenu.ts, RudolphGame.ts, Preloader.ts)

**Example fix needed**:
```typescript
// Current (error with noImplicitOverride)
class RudolphGame extends Phaser.Scene {
  create() { // ❌ Missing 'override'
    // ...
  }
}

// Fixed
class RudolphGame extends Phaser.Scene {
  override create() { // ✅ Explicit override
    // ...
  }
}
```

### `noUnusedLocals` (Planned)

**What it does**: Errors on unused local variables

**Current blockers**:
- ~10 unused variables across the codebase
- Examples: `luckiest_guy`, `poolSize`, `Item`, `fetchGame`

**Example fix needed**:
```typescript
// Current (error with noUnusedLocals)
import { Item } from './items'; // ❌ Unused

// Fixed - remove import
// Or prefix with underscore if intentionally unused
import { Item as _Item } from './items'; // ✅
```

### `noUnusedParameters` (Planned)

**What it does**: Errors on unused function parameters

**Current blockers**:
- Event handlers with unused parameters (e.g., `player`, `platform`, `e`)

**Example fix needed**:
```typescript
// Current (error with noUnusedParameters)
private collectLikedItem(player, item) { // ❌ player unused
  const sprite = item as Sprite;
}

// Fixed - prefix with underscore
private collectLikedItem(_player, item) { // ✅ Explicitly unused
  const sprite = item as Sprite;
}
```

### `exactOptionalPropertyTypes` (Planned)

**What it does**: Disallows assigning `undefined` to optional properties

**Current blockers**:
- Optional properties in types that explicitly accept `undefined`

**Example**:
```typescript
type User = {
  name?: string; // Accepts only 'string' or absent, NOT undefined
}

// With exactOptionalPropertyTypes:
const user: User = { name: undefined }; // ❌ Error
const user: User = {}; // ✅ OK
```

## Recommended Path Forward

To gradually improve type safety:

1. **Phase 1** (Current): Keep current configuration
   - Strict mode ✅
   - noUncheckedIndexedAccess ✅
   - noFallthroughCasesInSwitch ✅

2. **Phase 2**: Fix unused code warnings
   - Enable `noUnusedLocals`
   - Enable `noUnusedParameters`
   - Clean up ~10-15 occurrences

3. **Phase 3**: Add override keywords
   - Enable `noImplicitOverride`
   - Add `override` to all Phaser scene methods (~20 methods)

4. **Phase 4**: Strictest type checking
   - Enable `exactOptionalPropertyTypes`
   - Fix optional property usage

## Benefits of Current Configuration

✅ **Array Safety**: `noUncheckedIndexedAccess` catches array out-of-bounds errors
✅ **Null Safety**: Strict mode prevents null/undefined bugs
✅ **Type Safety**: No implicit `any` types allowed
✅ **Cross-platform**: Consistent file casing prevents bugs
✅ **Switch Safety**: No accidental fall-through in switch statements

## Build Commands

```bash
# Type check only (no build)
npx tsc --noEmit

# Build with Next.js (includes type checking)
npm run build

# Development mode (type checking in watch mode)
npm run dev
```

## Further Reading

- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
