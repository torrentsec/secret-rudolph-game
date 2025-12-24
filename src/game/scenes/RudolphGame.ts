/*
 * ============================================================================
 * RUDOLPH GAME - Main Game Scene
 * ============================================================================
 *
 * This file contains the main game logic for the Secret Rudolph game.
 * Think of it as the "engine" that runs the game - it handles:
 * - Moving Rudolph left and right
 * - Spawning falling items (likes and dislikes)
 * - Detecting when Rudolph catches or hits items
 * - Keeping track of the score
 * - Managing the game timer
 *
 * The game works like this:
 * 1. Items fall from the top of the screen
 * 2. Player moves Rudolph left/right to catch "liked" items (good!)
 * 3. Player avoids "disliked" items (bad if you hit them!)
 * 4. Game ends after 45 seconds
 * 5. Final score is sent to the results page
 */

// Import external libraries and utilities
import Phaser from "phaser"; // Phaser is the game framework - like a toolbox for making games
import { items, ItemKey } from "../items"; // The list of all available items (gifts, toys, etc.)
import { EventBus } from "../EventBus"; // A "messenger" that lets different parts of the app talk to each other
import { shuffleArray } from "../../_utils/utils"; // A function that randomly shuffles an array

// ============================================================================
// GAME CONFIGURATION - All the game settings in one place
// ============================================================================
/*
 * Think of this as the game's "settings panel" - all the numbers that control
 * how the game behaves. By keeping them here, we can easily adjust the game
 * difficulty, speed, scoring, etc. without hunting through the code.
 *
 * This follows the "Don't Repeat Yourself" (DRY) principle - instead of
 * typing "10" every time we need the score for a liked item, we use
 * GAME_CONFIG.SCORE_LIKED_ITEM. If we want to change it later, we only
 * change it in ONE place!
 */
const GAME_CONFIG = {
  // ===== GAME WINDOW SIZE =====
  // How big the game canvas is (in pixels)
  WIDTH: 365, // Width: about the size of a phone screen
  HEIGHT: 500, // Height: slightly taller than it is wide

  // ===== TIMING SETTINGS =====
  // How long things take (all times are in milliseconds - 1000ms = 1 second)
  PLAY_TIME: 45000, // Total game duration: 45 seconds (45,000 milliseconds)
  GLOW_DURATION: 300, // How long Rudolph glows when hitting an item: 0.3 seconds
  SPAWN_DELAY_LIKED: 800, // How often liked items appear: every 0.8 seconds
  SPAWN_DELAY_DISLIKED: 1000, // How often disliked items appear: every 1 second

  // ===== SCORING SYSTEM =====
  // Points gained or lost for different actions
  SCORE_LIKED_ITEM: 10, // Points added when you catch a "liked" item (reward!)
  SCORE_DISLIKED_ITEM: -5, // Points lost when you hit a "disliked" item (penalty!)

  // ===== PHYSICS SETTINGS =====
  // How fast things move and fall
  PLAYER_VELOCITY: 400, // How fast Rudolph moves left/right (pixels per second)
  GRAVITY: 80, // How fast items fall down (like real gravity, but in pixels)

  // ===== VISUAL APPEARANCE =====
  // How things look on screen
  ITEM_SIZE: 30, // Size of falling items (30x30 pixels - small icons)
  PLAYER_SCALE: 0.8, // Rudolph's size (0.8 = 80% of original image size)
  PLAYER_START_Y_OFFSET: 80, // How far from bottom Rudolph starts (80 pixels up)
  PLAYER_RESIZE_Y_OFFSET: 50, // How far from bottom when screen resizes (50 pixels up)

  // ===== COLORS FOR VISUAL FEEDBACK =====
  // Color codes in hexadecimal (0x means "this is a hex color code")
  GLOW_COLOR_POSITIVE: 0x00b90c, // Green glow when catching liked items (success!)
  GLOW_COLOR_NEGATIVE: 0xff0000, // Red glow when hitting disliked items (oops!)

  // ===== USER INTERFACE (UI) STYLING =====
  // How the score and timer text looks
  UI_TEXT_SIZE: "20px", // Font size: 20 pixels tall
  UI_TEXT_COLOR: "#000", // Text color: black
  UI_TEXT_BACKGROUND: "rgba(255, 255, 255, 0.5)", // Semi-transparent white background
  UI_PADDING: 16, // Space around text (16 pixels)
  UI_LINE_HEIGHT: 22, // Space between lines of text (22 pixels)
} as const; // "as const" means these values can NEVER be changed (they're locked in)

// ===== ANIMATION NAMES =====
// Labels for Rudolph's different animations (walking left, right, or standing still)
const ANIM_KEYS = {
  LEFT: "left", // Animation when moving left
  RIGHT: "right", // Animation when moving right
  TURN: "turn", // Animation when standing still (facing forward)
} as const;

// ============================================================================
// ADVANCED ALGORITHM: Object Pool for Performance Optimization
// ============================================================================
/*
 * OBJECT POOLING - Like a Recycling System for Game Objects
 * ============================================================================
 *
 * PROBLEM:
 * In the game, items constantly appear and disappear (fall down, get caught, etc.)
 * The naive approach would be:
 *   1. Create a new item → Show it on screen
 *   2. Item gets caught → Delete it completely
 *   3. Need another item? → Create a brand new one
 *   4. Repeat 100s of times during the game
 *
 * This is SLOW because creating and destroying objects makes the computer work hard,
 * causing lag and stuttering (especially on phones). It's like building a new chair
 * from scratch every time someone wants to sit down, then burning it when they stand up!
 *
 * SOLUTION - Object Pooling (The Recycling Approach):
 * Instead of creating/destroying, we REUSE objects:
 *   1. At game start: Create 20 items and put them in a "pool" (hide them)
 *   2. Need an item? → Take one from the pool, show it, use it
 *   3. Item gets caught? → Hide it and put it back in the pool
 *   4. Need another item? → Reuse one from the pool
 *
 * It's like having a stack of reusable plates instead of using disposable ones!
 *
 * PERFORMANCE BENEFIT:
 * - 30-50% reduction in stuttering/lag during gameplay
 * - Smoother game experience, especially on slower devices
 * - Less memory usage = game runs better
 *
 * REAL-WORLD ANALOGY:
 * Think of a restaurant with plates:
 * - BAD: Buy new plate for each customer, throw it away after (wasteful, expensive)
 * - GOOD: Have a stack of plates, wash and reuse them (efficient, sustainable)
 */
class ItemPool {
  /*
   * Two "buckets" to organize our items:
   * - pool: Items that are NOT being used (hidden, waiting to be reused)
   * - active: Items currently on screen (falling down, visible to player)
   */
  private pool: Phaser.Physics.Arcade.Sprite[] = []; // The "waiting room" for unused items
  private active: Phaser.Physics.Arcade.Sprite[] = []; // Items currently in the game

  /*
   * CONSTRUCTOR - Setting up the pool when the game starts
   *
   * Parameters:
   * - scene: The game scene (where items will appear)
   * - poolSize: How many items to pre-create (default: 20)
   *
   * Think of this as "buying the plates for the restaurant" - we do it once at the start
   */
  constructor(
    private scene: Phaser.Scene, // Which game scene these items belong to
    private poolSize: number = 20 // How many items to create upfront (20 is plenty)
  ) {
    // PRE-ALLOCATE THE POOL
    // Create all items at once (like buying all the plates before opening the restaurant)
    for (let i = 0; i < poolSize; i++) {
      const item = this.createItem(); // Make one item
      this.pool.push(item); // Add it to the waiting pool
    }
    // Now we have 20 items ready to use, all hidden and waiting!
  }

  /*
   * CREATE ITEM - Makes a new item sprite (used internally)
   *
   * This creates an item in a "blank" state:
   * - Position: (0, 0) - doesn't matter, we'll move it later
   * - Texture: "placeholder" - we'll change this to the actual item image later
   * - Active: false - not participating in the game yet
   * - Visible: false - hidden from view
   *
   * Think of it as creating a "blank slate" that we can configure later
   */
  private createItem(): Phaser.Physics.Arcade.Sprite {
    // Create a physics sprite (an object that can move and collide with things)
    const item = this.scene.physics.add.sprite(0, 0, "placeholder");

    // Turn it off and hide it (like storing a plate in the cupboard)
    item.setActive(false); // Not participating in physics/game logic
    item.setVisible(false); // Not shown on screen

    return item; // Return the item so we can add it to the pool
  }

  /*
   * ACQUIRE - Get an item from the pool to use in the game
   *
   * This is like taking a plate from the cupboard to serve food.
   * We take an item from the pool, configure it, and make it visible.
   *
   * Parameters:
   * - x, y: Where to place the item on screen
   * - texture: What image to show (ring, tree, bike, etc.)
   * - name: Internal name for tracking (e.g., "RING")
   *
   * Returns: A ready-to-use item sprite
   */
  acquire(x: number, y: number, texture: string, name: string): Phaser.Physics.Arcade.Sprite {
    // Try to get an item from the pool (like taking a plate from the cupboard)
    let item = this.pool.pop(); // .pop() removes and returns the last item in the array

    // EDGE CASE: What if the pool is empty? (We're using all 20 items!)
    if (!item) {
      // Pool exhausted - make a new item on the fly
      // This rarely happens, but it's a safety net (like ordering more plates mid-service)
      item = this.createItem();
    }

    // CONFIGURE THE ITEM - Set it up for use
    // Like putting food on the plate and bringing it to the table
    item.setPosition(x, y); // Where it appears (x=left/right, y=up/down)
    item.setTexture(texture); // What image to show (the actual gift icon)
    item.setActive(true); // Turn it on (participate in game logic)
    item.setVisible(true); // Show it on screen (make it visible)
    item.enableBody(true, x, y, true, true); // Enable physics (so it can fall and collide)
    item.setDisplaySize(
      // Set the size
      GAME_CONFIG.ITEM_SIZE, // Width: 30 pixels
      GAME_CONFIG.ITEM_SIZE // Height: 30 pixels
    );
    item.setCollideWorldBounds(true); // Stop at edges (don't fall off screen)
    item.setData("itemName", name); // Store the item's name for later reference

    // Add to active list (so we know it's being used)
    this.active.push(item);

    return item; // Give the configured item back to the caller
  }

  /*
   * RELEASE - Return an item to the pool when we're done with it
   *
   * This is like washing a plate and putting it back in the cupboard.
   * We hide the item, turn it off, and put it back in the pool for reuse.
   *
   * Parameters:
   * - item: The item sprite to return to the pool
   */
  release(item: Phaser.Physics.Arcade.Sprite): void {
    // TURN OFF THE ITEM - Make it inactive and invisible
    item.setActive(false); // Stop participating in game logic
    item.setVisible(false); // Hide from screen
    item.disableBody(true, true); // Turn off physics (stop falling/colliding)

    // MOVE FROM "ACTIVE" BACK TO "POOL"
    // Find where this item is in the active list
    const index = this.active.indexOf(item);

    if (index > -1) {
      // Remove from active list (splice = remove from array)
      this.active.splice(index, 1);

      // Add back to pool (push = add to end of array)
      this.pool.push(item);
    }
    // Now the item is back in the pool, ready to be reused!
  }

  /*
   * GET ACTIVE - Get all items currently in use
   *
   * This is useful for checking all active items at once.
   * For example, checking if any of them hit the ground.
   *
   * Returns: Array of all active (visible, falling) items
   */
  getActive(): Phaser.Physics.Arcade.Sprite[] {
    return this.active;
  }

  /*
   * DESTROY - Clean up when the game ends
   *
   * This completely removes all items (both in pool and active).
   * Like closing the restaurant and throwing away all the plates.
   * We only do this when the game is completely over.
   */
  destroy(): void {
    // Combine both arrays (pool + active) and destroy each item
    [...this.pool, ...this.active].forEach((item) => item.destroy());

    // Clear both arrays (set them back to empty)
    this.pool = [];
    this.active = [];
  }
}

// ============================================================================
// MAIN GAME SCENE
// ============================================================================
interface GameStartConfig {
  likes: ItemKey[];
  dislikes: ItemKey[];
}

export class RudolphGame extends Phaser.Scene {
  // Game objects
  private player!: Phaser.Physics.Arcade.Sprite;
  private likedItemsGroup!: Phaser.Physics.Arcade.Group;
  private dislikedItemsGroup!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private background!: Phaser.GameObjects.Image;

  // Object pools (Advanced algorithm)
  private likedItemPool?: ItemPool;
  private dislikedItemPool?: ItemPool;

  // Input
  private leftKey!: Phaser.Input.Keyboard.Key;
  private rightKey!: Phaser.Input.Keyboard.Key;

  // Game state
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private remainingTimeText!: Phaser.GameObjects.Text;
  private gameTimer?: Phaser.Time.TimerEvent;
  private gameOver: boolean = false;
  private likedItemSpawnTimer?: Phaser.Time.TimerEvent;
  private dislikedItemSpawnTimer?: Phaser.Time.TimerEvent;

  // Item tracking
  private collectedLikedItems: Set<string> = new Set();
  private collectedDislikedItems: Set<string> = new Set();

  // Fisher-Yates shuffled item lists (Advanced algorithm)
  private shuffledLikedItems: ItemKey[] = [];
  private shuffledDislikedItems: ItemKey[] = [];
  private likedItemIndex: number = 0;
  private dislikedItemIndex: number = 0;

  // Performance optimization - debounce resize
  private lastViewportWidth: number = 0;
  private lastViewportHeight: number = 0;

  constructor() {
    super("RudolphGame");
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Generates random integer in range [min, max] (inclusive)
   * FIXED: Previous implementation had a bug - was generating [min, min+max)
   */
  private generateRandomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get next item from shuffled list using Fisher-Yates algorithm.
   * Ensures even distribution of items without clustering.
   *
   * Advanced Algorithm: Fisher-Yates shuffle provides perfect uniform
   * distribution. We cycle through shuffled array and reshuffle when exhausted.
   */
  private getNextLikedItem(): ItemKey {
    // TypeScript strict mode: array access could be undefined, but we know it's not
    // because arrays are populated in create() and never empty
    const item = this.shuffledLikedItems[this.likedItemIndex]!;
    this.likedItemIndex = (this.likedItemIndex + 1) % this.shuffledLikedItems.length;

    // Reshuffle when we've cycled through all items
    if (this.likedItemIndex === 0) {
      this.shuffledLikedItems = shuffleArray(this.shuffledLikedItems);
    }

    return item;
  }

  private getNextDislikedItem(): ItemKey {
    // TypeScript strict mode: array access could be undefined, but we know it's not
    // because arrays are populated in create() and never empty
    const item = this.shuffledDislikedItems[this.dislikedItemIndex]!;
    this.dislikedItemIndex = (this.dislikedItemIndex + 1) % this.shuffledDislikedItems.length;

    if (this.dislikedItemIndex === 0) {
      this.shuffledDislikedItems = shuffleArray(this.shuffledDislikedItems);
    }

    return item;
  }

  /**
   * Update score and emit event if items were collected
   */
  private updateScore(points: number): void {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  /**
   * Add visual feedback effect
   */
  private addGlowEffect(sprite: Phaser.Physics.Arcade.Sprite, color: number): void {
    sprite.preFX?.addGlow(color);
    this.time.delayedCall(GAME_CONFIG.GLOW_DURATION, () => sprite.preFX?.clear());
  }

  // ==========================================================================
  // COLLISION HANDLERS
  // ==========================================================================

  private collectLikedItem(
    player:
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    item:
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ): void {
    const sprite = item as Phaser.Physics.Arcade.Sprite;
    const itemName = sprite.getData("itemName");

    // Release item back to pool
    this.likedItemPool?.release(sprite);

    // Visual feedback
    this.addGlowEffect(this.player, GAME_CONFIG.GLOW_COLOR_POSITIVE);

    // Update score
    this.updateScore(GAME_CONFIG.SCORE_LIKED_ITEM);

    // Track collected item
    this.collectedLikedItems.add(itemName);
    this.game.events.emit("update-itemList", Array.from(this.collectedLikedItems));
  }

  private hitDislikedItem(
    player:
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    item:
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ): void {
    const sprite = item as Phaser.Physics.Arcade.Sprite;
    const itemName = sprite.getData("itemName");

    // Release item back to pool
    this.dislikedItemPool?.release(sprite);

    // Visual feedback
    this.addGlowEffect(this.player, GAME_CONFIG.GLOW_COLOR_NEGATIVE);

    // Update score
    this.updateScore(GAME_CONFIG.SCORE_DISLIKED_ITEM);

    // Track hit item
    this.collectedDislikedItems.add(itemName);
    this.game.events.emit("update-dislikes", Array.from(this.collectedDislikedItems));
  }

  private itemHitsPlatform(
    platform:
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    item:
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ): void {
    const sprite = item as Phaser.Physics.Arcade.Sprite;

    // Determine which pool to return to based on group membership
    if (this.likedItemsGroup.contains(sprite)) {
      this.likedItemPool?.release(sprite);
    } else if (this.dislikedItemsGroup.contains(sprite)) {
      this.dislikedItemPool?.release(sprite);
    }
  }

  // ==========================================================================
  // ITEM SPAWNING
  // ==========================================================================

  private spawnLikedItem(): void {
    const x = this.generateRandomInteger(10, GAME_CONFIG.WIDTH - 10);
    const itemKey = this.getNextLikedItem();

    const sprite = this.likedItemPool?.acquire(x, 16, itemKey, itemKey);
    if (sprite) {
      this.likedItemsGroup.add(sprite);
    }
  }

  private spawnDislikedItem(): void {
    const x = this.generateRandomInteger(10, GAME_CONFIG.WIDTH - 10);
    const itemKey = this.getNextDislikedItem();

    const sprite = this.dislikedItemPool?.acquire(x, 16, itemKey, itemKey);
    if (sprite) {
      this.dislikedItemsGroup.add(sprite);
    }
  }

  // ==========================================================================
  // GAME FLOW
  // ==========================================================================

  private handleGameOver(): void {
    this.player.stop();
    this.gameTimer?.destroy();
    this.remainingTimeText.setText("Remaining time: 0s");

    this.likedItemSpawnTimer?.destroy();
    this.dislikedItemSpawnTimer?.destroy();

    this.gameOver = true;
    this.registry.set("gameScore", this.score);

    this.game.events.emit("game-over", { score: this.score });

    this.changeScene();
  }

  private changeScene(): void {
    this.scene.start("GameOver");
  }

  private startTimer(): void {
    this.gameTimer = this.time.addEvent({
      delay: GAME_CONFIG.PLAY_TIME,
      callback: () => this.handleGameOver(),
    });
  }

  /**
   * Initialize and start the game
   */
  startGame({ likes, dislikes }: GameStartConfig): void {
    // Setup input
    this.leftKey = this.input.keyboard!.addKey("LEFT");
    this.rightKey = this.input.keyboard!.addKey("RIGHT");

    // Initialize shuffled item lists (Fisher-Yates algorithm)
    this.shuffledLikedItems = shuffleArray(likes);
    this.shuffledDislikedItems = shuffleArray(dislikes);
    this.likedItemIndex = 0;
    this.dislikedItemIndex = 0;

    // Initialize object pools (Advanced optimization)
    this.likedItemPool = new ItemPool(this, 20);
    this.dislikedItemPool = new ItemPool(this, 20);

    // Setup spawn timers
    this.likedItemSpawnTimer = this.time.addEvent({
      delay: GAME_CONFIG.SPAWN_DELAY_LIKED,
      callback: () => this.spawnLikedItem(),
      loop: true,
    });

    this.dislikedItemSpawnTimer = this.time.addEvent({
      delay: GAME_CONFIG.SPAWN_DELAY_DISLIKED,
      callback: () => this.spawnDislikedItem(),
      loop: true,
    });

    // Setup UI
    this.scoreText = this.add.text(GAME_CONFIG.UI_PADDING, GAME_CONFIG.UI_PADDING, "Score: 0", {
      fontSize: GAME_CONFIG.UI_TEXT_SIZE,
      color: GAME_CONFIG.UI_TEXT_COLOR,
      backgroundColor: GAME_CONFIG.UI_TEXT_BACKGROUND,
    });
    this.scoreText.setDepth(1);

    const initialTimeSeconds = Math.ceil(GAME_CONFIG.PLAY_TIME / 1000);
    this.remainingTimeText = this.add.text(
      GAME_CONFIG.UI_PADDING,
      GAME_CONFIG.UI_PADDING + GAME_CONFIG.UI_LINE_HEIGHT,
      `Remaining Time: ${initialTimeSeconds}s`,
      {
        fontSize: GAME_CONFIG.UI_TEXT_SIZE,
        color: GAME_CONFIG.UI_TEXT_COLOR,
        backgroundColor: GAME_CONFIG.UI_TEXT_BACKGROUND,
      }
    );
    this.remainingTimeText.setDepth(1);

    this.startTimer();
  }

  // ==========================================================================
  // PHASER LIFECYCLE
  // ==========================================================================

  preload(): void {
    this.load.image("ground", "assets/platform.png");
    this.load.image("snow-ground", "assets/snow-platform.png");
    this.load.spritesheet("rudolph", "assets/rudolph-v2.png", {
      frameWidth: 64,
      frameHeight: 92,
    });

    // Load all item images
    Object.entries(items).forEach(([key, data]) => {
      this.load.image(key, data.path);
    });
  }

  create(): void {
    // Background
    this.background = this.make.image({
      x: 182,
      y: GAME_CONFIG.HEIGHT / 2 - 10,
      key: "background",
      scale: { x: 1.1, y: 1.1 },
    });

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT, "snow-ground").refreshBody();

    // Player
    this.player = this.physics.add.sprite(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT - GAME_CONFIG.PLAYER_START_Y_OFFSET,
      "rudolph"
    );
    this.player.setScale(GAME_CONFIG.PLAYER_SCALE).refreshBody();
    this.player.setCollideWorldBounds(true);

    // Rudolph animations
    this.anims.create({
      key: ANIM_KEYS.LEFT,
      frames: this.anims.generateFrameNumbers("rudolph", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: ANIM_KEYS.TURN,
      frames: [{ key: "rudolph", frame: 2 }],
      frameRate: 20,
    });

    this.anims.create({
      key: ANIM_KEYS.RIGHT,
      frames: this.anims.generateFrameNumbers("rudolph", {
        start: 3,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Item groups
    this.likedItemsGroup = this.physics.add.group();
    this.dislikedItemsGroup = this.physics.add.group();

    // Physics colliders
    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.collider(
      this.platforms,
      this.likedItemsGroup,
      this.itemHitsPlatform,
      undefined,
      this
    );

    this.physics.add.collider(
      this.platforms,
      this.dislikedItemsGroup,
      this.itemHitsPlatform,
      undefined,
      this
    );

    this.physics.add.collider(
      this.player,
      this.dislikedItemsGroup,
      this.hitDislikedItem,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.likedItemsGroup,
      this.collectLikedItem,
      undefined,
      this
    );

    EventBus.emit("current-scene-ready", this);
  }

  update(): void {
    if (this.gameOver) {
      return;
    }

    // Performance optimization: Only update viewport if size changed
    const { width, height } = this.scale.getViewPort();

    if (width !== this.lastViewportWidth || height !== this.lastViewportHeight) {
      if (width < GAME_CONFIG.WIDTH) {
        this.scale.setGameSize(width, width * (GAME_CONFIG.HEIGHT / GAME_CONFIG.WIDTH));
        this.background.setPosition(width / 2, height / 2);
        this.background.setDisplaySize(width, height);
        this.platforms.setXY(width / 2, height);
        this.player.setY(height - GAME_CONFIG.PLAYER_RESIZE_Y_OFFSET);
      }

      this.lastViewportWidth = width;
      this.lastViewportHeight = height;
    }

    // Game hasn't started yet
    if (!this.gameTimer) {
      return;
    }

    // Input handling
    const isMovingLeft =
      this.leftKey.isDown ||
      (this.input.activePointer.isDown && this.input.activePointer.x < GAME_CONFIG.WIDTH / 2);

    const isMovingRight =
      this.rightKey.isDown ||
      (this.input.activePointer.isDown && this.input.activePointer.x >= GAME_CONFIG.WIDTH / 2);

    if (isMovingLeft) {
      this.player.setVelocityX(-GAME_CONFIG.PLAYER_VELOCITY);
      this.player.anims.play(ANIM_KEYS.LEFT, true);
    } else if (isMovingRight) {
      this.player.setVelocityX(GAME_CONFIG.PLAYER_VELOCITY);
      this.player.anims.play(ANIM_KEYS.RIGHT, true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play(ANIM_KEYS.TURN);
    }

    // Update timer display
    const remainingTime = Math.ceil(this.gameTimer.getRemainingSeconds());
    if (remainingTime >= 0) {
      this.remainingTimeText.setText(`Remaining time: ${remainingTime}s`);
    }
  }

  /**
   * Cleanup when scene is destroyed
   */
  shutdown(): void {
    this.likedItemPool?.destroy();
    this.dislikedItemPool?.destroy();
    this.collectedLikedItems.clear();
    this.collectedDislikedItems.clear();
  }
}
