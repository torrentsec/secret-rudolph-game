/**
 * path
 * name
 */

const PATH = "assets/items/";

export const itemKeys = {
  RING: "ring",
  CASH: "cash",
  TREE: "tree",
  AIRPLANE: "airplane",
  BEER: "beer",
  BIKE: "bike",
  BOOKS: "books",
  BEACH: "beach",
  CAKE: "cake",
  CAMERA: "camera",
  CAROUSEL_HORSE: "carousel_horse",
  CAT: "cat",
  CHOCOLATE: "chocolate",
  CLOVER: "clover",
  DOG: "dog",
  COMPUTER: "computer",
  FLOWERS: "flowers",
  HOT_CHOCOLATE: "hot_chocolate",
  KICK_SCOOTER: "kick_scooter",
  KISS: "kiss",
  LIPSTICK: "lipstick",
  LETTER: "letter",
  MOBILE_PHONE: "mobile_phone",
  NAIL_POLISH: "nail_polish",
  SCARF: "scarf",
  SNOWFLAKE: "snowflake",
  // SNOWMAN: "snowman",
  TEDDY_BEAR: "teddy_bear",
  TELEVISION: "television",
  VACATION: "vacation",
  VIDEO_GAME: "video_game",
  WINE: "wine",
  GIFT: "gift",
} as const;

export type ItemKey = (typeof itemKeys)[keyof typeof itemKeys];

export interface Item {
  path: string;
  name: string;
}

export type Items = {
  [K in ItemKey]: Item;
};

export const items: Items = {
  [itemKeys.RING]: {
    path: `${PATH}ring.svg`,
    name: "ring",
  },
  [itemKeys.CASH]: {
    path: `${PATH}cash.svg`,
    name: "money",
  },
  [itemKeys.TREE]: {
    path: `${PATH}tree.svg`,
    name: "tree",
  },
  [itemKeys.AIRPLANE]: {
    path: `${PATH}airplane.svg`,
    name: "airplane",
  },
  [itemKeys.BEER]: {
    path: `${PATH}beer.svg`,
    name: "beer",
  },
  [itemKeys.BIKE]: {
    path: `${PATH}bike.svg`,
    name: "bicycle",
  },
  [itemKeys.BOOKS]: {
    path: `${PATH}books.svg`,
    name: "books",
  },
  [itemKeys.BEACH]: {
    path: `${PATH}beach.svg`,
    name: "beach",
  },
  [itemKeys.CAKE]: {
    path: `${PATH}cake.svg`,
    name: "cake",
  },
  [itemKeys.CAMERA]: {
    path: `${PATH}camera.svg`,
    name: "camera",
  },
  [itemKeys.CAROUSEL_HORSE]: {
    path: `${PATH}carousel-horse.svg`,
    name: "amusement park",
  },
  [itemKeys.CAT]: {
    path: `${PATH}cat.svg`,
    name: "cat",
  },
  [itemKeys.CHOCOLATE]: {
    path: `${PATH}chocolate.svg`,
    name: "chocolate",
  },
  [itemKeys.CLOVER]: {
    path: `${PATH}clover.svg`,
    name: "clover",
  },
  [itemKeys.DOG]: {
    path: `${PATH}dog.svg`,
    name: "dog",
  },
  [itemKeys.COMPUTER]: {
    path: `${PATH}computer.svg`,
    name: "computer",
  },
  [itemKeys.FLOWERS]: {
    path: `${PATH}flowers.svg`,
    name: "flowers",
  },
  [itemKeys.HOT_CHOCOLATE]: {
    path: `${PATH}hot-chocolate.svg`,
    name: "hot chocolate",
  },
  [itemKeys.KICK_SCOOTER]: {
    path: `${PATH}kick-scooter.svg`,
    name: "kick scooter",
  },
  [itemKeys.KISS]: {
    path: `${PATH}kiss.svg`,
    name: "kiss",
  },
  [itemKeys.LIPSTICK]: {
    path: `${PATH}lipstick.svg`,
    name: "lipstick",
  },
  [itemKeys.LETTER]: {
    path: `${PATH}love-letter.svg`,
    name: "letter",
  },
  [itemKeys.MOBILE_PHONE]: {
    path: `${PATH}mobile-phone.svg`,
    name: "mobile phone",
  },
  [itemKeys.NAIL_POLISH]: {
    path: `${PATH}nail-polish.svg`,
    name: "nail polish",
  },
  [itemKeys.SCARF]: {
    path: `${PATH}scarf.svg`,
    name: "scarf",
  },
  [itemKeys.SNOWFLAKE]: {
    path: `${PATH}snowflake.svg`,
    name: "snowflake",
  },
  // [itemKeys.SNOWMAN]: {
  //   path: `${PATH}snowman.svg`,
  //   name: "snowman",
  // },
  [itemKeys.TEDDY_BEAR]: {
    path: `${PATH}teddy-bear.svg`,
    name: "teddy bear",
  },
  [itemKeys.TELEVISION]: {
    path: `${PATH}television.svg`,
    name: "television",
  },
  [itemKeys.VACATION]: {
    path: `${PATH}travel.svg`,
    name: "vacation",
  },
  [itemKeys.VIDEO_GAME]: {
    path: `${PATH}video-game.svg`,
    name: "video game",
  },
  [itemKeys.WINE]: {
    path: `${PATH}wine-glass.svg`,
    name: "wine",
  },
  [itemKeys.GIFT]: {
    path: `${PATH}wrapped-gift.svg`,
    name: "gift",
  },
};

export const tempItems = {
  [itemKeys.RING]: {
    path: `${PATH}ring.svg`,
    name: "ring",
  },
  [itemKeys.CASH]: {
    path: `${PATH}cash.svg`,
    name: "money",
  },
  [itemKeys.BEER]: {
    path: `${PATH}beer.svg`,
    name: "beer",
  },
  [itemKeys.BIKE]: {
    path: `${PATH}bike.svg`,
    name: "bicycle",
  },
  [itemKeys.CAT]: {
    path: `${PATH}cat.svg`,
    name: "cat",
  },
};
