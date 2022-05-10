let stopEvent = false;
let player = {};
let roomName = "";
let state = {};
let question = {};

let froms = [
  [9.8, 0],
  [49, -9.8],
  [0, -49],
  [58.8, -58.8],
  [39.2, -19.6],
  [78.4, -29.4],
  [88.2, -49],
  [29.4, -68.6],
  [19.6, -49],
  [88.2, -9.8],
  [68.6, -58.8],
  [9.8, -49],
  [39.2, -68.6],
  [29.4, -19.6],
  [58.8, -88.2],
  [9.8, -88.2],
  [78.4, -88.2],
  [88.2, -39.2],
];

let tos = [
  [19.6, -19.6],
  [58.8, -29.4],
  [9.8, -68.6],
  [68.6, -78.4],
  [29.4, -39.2],
  [68.6, -49],
  [78.4, -68.6],
  [19.6, -88.2],
  [39.2, -58.8],
  [68.6, -19.6],
  [39.2, -29.4],
  [19.6, -29.4],
  [49, -58.8],
  [49, 0],
  [49, -68.6],
  [19.6, -68.6],
  [88.2, -68.6],
  [88.2, -19.6],
];

const MARGIN = 9.8
const BOARD_LEFT_MOST = 0
const BOARD_RIGHT_MOST = 88.2
const BOARD_BOTTOM_MOST = 0
const BOARD_TOP_MOST = -88.2

const LADDER = "ladder"
const SNAKE = "snake"
const NORMAL = "normal"

const RUN_ONCE = -2
const NONE = -1

const GAME_STATE = {
  PLAYER_JOINED: "PLAYER_JOINED",
  STATUS_CHANGED: "STATUS_CHANGED",
  PLAYER_MOVED: "PLAYER_MOVED",
  TURN_CHANGED: "TURN_CHANGED",
  QUEUE: 1,
  START: 2,
  END: 3,
}

const DIRECTION = {
  UP: "up",
  RIGHT: "right",
  LEFT: "left",
}

const PLAYER_COLOR = {
  RED: "red",
  GREEN: "green",
  YELLOW: "yellow",
  BROWN: "brown"
}