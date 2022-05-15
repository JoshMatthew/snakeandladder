const socket = io();

// elements
const modal = document.getElementById("--modal");
const modalQueue = document.getElementById("--modal-queue");
const currentPlayerIndicatorModal = document.getElementById(
  "--modal-player-info"
);
const modalQuestion = document.getElementById("question");
const tiles = document.querySelectorAll(".tile");
const gameSection = document.getElementById("gameSection");
const homeScreen = document.getElementById("homeScreen");
const gameCode = document.getElementById("game-code");
const playerList = document.getElementById("players");
const playerCount = document.getElementById("player-count");
const playerTurnIndicator = document.getElementById("p-turn");
const playerTurnInstruction = document.getElementById("p-instruction");
const questionNormal = document.getElementById("question-normal");
const questionImg = document.getElementById("question-img");
const questionVid = document.getElementById("question-video");
const optionsList = document.getElementById("options-list");
const qIndicator = document.getElementById("q-indicator");
const soundImg = document.getElementById("sound-img");
const splash = document.querySelector(".splash");
const currentTurnIndicatorSpan = document.getElementById(
  "current-turn-indicator"
);

// btns
const joinRoomBtn = document.getElementById("join-room");
const createRoom = document.getElementById("create-room");
const enterRoom = document.getElementById("enter-room");
const closeModal = document.getElementById("close-modal");
const startBtn = document.getElementById("start");
const rollDiceBtn = document.getElementById("roll-dice-btn");
const soundBtn = document.getElementById("sound-btn");

let stopEvent = false;
let player = {};
let roomName = "";
let state = {};
let question = {};
let volume = 0.2;
let bgm = undefined;
///////
let questionAssets = [
  {
    id: "img-q1",
    var: (q1 = document.createElement("img")),
    file: "../assets/img/questions/1.png",
  },
  {
    id: "img-q2",
    var: (q2 = document.createElement("img")),
    file: "../assets/img/questions/2.png",
  },
  {
    id: "img-q3",
    var: (q3 = document.createElement("img")),
    file: "../assets/img/questions/3.png",
  },
  {
    id: "img-q4",
    var: (q4 = document.createElement("img")),
    file: "../assets/img/questions/4.png",
  },
  {
    id: "img-q5",
    var: (q5 = document.createElement("img")),
    file: "../assets/img/questions/5.png",
  },
  {
    id: "img-q6",
    var: (q6 = document.createElement("img")),
    file: "../assets/img/questions/6.png",
  },
  {
    id: "img-q7",
    var: (q7 = document.createElement("img")),
    file: "../assets/img/questions/7.png",
  },
  {
    id: "img-q8",
    var: (q8 = document.createElement("img")),
    file: "../assets/img/questions/8.png",
  },
  {
    id: "img-q9",
    var: (q9 = document.createElement("img")),
    file: "../assets/img/questions/9.png",
  },
  {
    id: "img-q10",
    var: (q10 = document.createElement("img")),
    file: "../assets/img/questions/10.png",
  },
  {
    id: "img-q11",
    var: (q11 = document.createElement("img")),
    file: "../assets/img/questions/11.png",
  },
  {
    id: "img-q12",
    var: (q12 = document.createElement("img")),
    file: "../assets/img/questions/12.png",
  },
  {
    id: "img-q13",
    var: (q13 = document.createElement("img")),
    file: "../assets/img/questions/13.png",
  },
  {
    id: "img-q14",
    var: (q14 = document.createElement("img")),
    file: "../assets/img/questions/14.png",
  },
  {
    id: "img-q15",
    var: (q15 = document.createElement("img")),
    file: "../assets/img/questions/15.png",
  },
  {
    id: "img-q16",
    var: (q16 = document.createElement("img")),
    file: "../assets/img/questions/16.png",
  },
];

let audioAssets = [
  {
    id: "aud-player-move",
    var: (pMove = document.createElement("audio")),
    file: "../assets/audio/move-sound.mp3",
  },
  {
    id: "aud-dice-roll",
    var: (dice = document.createElement("audio")),
    file: "../assets/audio/dice-roll.mp3",
  },
  {
    id: "aud-bg",
    var: (bgm = document.createElement("audio")),
    file: "../assets/audio/bgm.mp3",
  },
  {
    id: "aud-btn-hover",
    var: (hover = document.createElement("audio")),
    file: "../assets/audio/btn-hover.mp3",
  },
];

let assets = [
  {
    id: "img-bg1",
    var: (bg1 = document.createElement("img")),
    file: "../assets/img/bg1.png",
  },
  {
    id: "img-bg2",
    var: (bg2 = document.createElement("img")),
    file: "../assets/img/bg2.png",
  },
  {
    id: "img-bg3",
    var: (bg3 = document.createElement("img")),
    file: "../assets/img/bg3.png",
  },
  {
    id: "img-dice1",
    var: (dice1 = document.createElement("img")),
    file: "../assets/img/1.png",
  },
  {
    id: "img-dice2",
    var: (dice2 = document.createElement("img")),
    file: "../assets/img/2.png",
  },
  {
    id: "img-dice3",
    var: (dice3 = document.createElement("img")),
    file: "../assets/img/3.png",
  },
  {
    id: "img-dice4",
    var: (dice4 = document.createElement("img")),
    file: "../assets/img/4.png",
  },
  {
    id: "img-dice5",
    var: (dice5 = document.createElement("img")),
    file: "../assets/img/5.png",
  },
  {
    id: "img-dice6",
    var: (dice6 = document.createElement("img")),
    file: "../assets/img/6.png",
  },
  {
    id: "img-board",
    var: (board = document.createElement("img")),
    file: "../assets/img/board.png",
  },
  {
    id: "img-ladder1",
    var: (ladder1 = document.createElement("img")),
    file: "../assets/img/ladder.png",
  },
  {
    id: "img-ladder2",
    var: (ladder2 = document.createElement("img")),
    file: "../assets/img/ladder2.png",
  },
  {
    id: "img-snake1",
    var: (snake1 = document.createElement("img")),
    file: "../assets/img/s1.png",
  },
  {
    id: "img-snake2",
    var: (snake2 = document.createElement("img")),
    file: "../assets/img/s2.png",
  },
  {
    id: "img-snake3",
    var: (snake3 = document.createElement("img")),
    file: "../assets/img/s3.png",
  },
  {
    id: "img-snake4",
    var: (snake4 = document.createElement("img")),
    file: "../assets/img/s4.png",
  },
  {
    id: "img-snake5",
    var: (snake5 = document.createElement("img")),
    file: "../assets/img/s5.png",
  },
  {
    id: "img-snake6",
    var: (snake6 = document.createElement("img")),
    file: "../assets/img/s6.png",
  },
  {
    id: "img-snake7",
    var: (snake7 = document.createElement("img")),
    file: "../assets/img/s7.png",
  },
  {
    id: "img-snake8",
    var: (snake8 = document.createElement("img")),
    file: "../assets/img/s8.png",
  },
  {
    id: "img-audio-on",
    var: (audioOn = document.createElement("img")),
    file: "../assets/img/sound-on.png",
  },
  {
    id: "img-audio-off",
    var: (audioOff = document.createElement("img")),
    file: "../assets/img/sound-off.png",
  },
  ...questionAssets,
  ...audioAssets,
];
// assets loader
class Gui {
  assets = [];
  assetsToLoad = 0;

  getAsset(id) {
    return this.assets.filter((a) => a.id === id)[0].var;
  }
  getAssets() {
    return this.assets;
  }

  load(assets) {
    this.assets = assets;
    if (!this.assets || this.assets.length === 0) {
      setTimeout(() => {
        splash.classList.add("hide-splash");
        return;
      }, 2000);
    }

    if (this.assets) {
      this.assetsToLoad = this.assets.length;

      for (let i = 0; i < this.assets.length; i++) {
        if (this.assets[i].var !== undefined) {
          if (this.assets[i].var.nodeName === "IMG") {
            this.beginLoadingImage(this.assets[i].var, this.assets[i].file);
          }

          if (this.assets[i].var.nodeName === "AUDIO") {
            this.beginLoadinAudio(this.assets[i].var, this.assets[i].file);
          }
        }
      }
    }
  }

  launchIfReady() {
    this.assetsToLoad--;

    if (this.assetsToLoad === 0) {
      setTimeout(() => {
        splash.classList.add("hide-splash");
      }, 2000);
    }
  }

  beginLoadingImage(imgVar, fileName) {
    imgVar.onload = () => this.launchIfReady();
    imgVar.src = fileName;
  }

  beginLoadinAudio(audioVar, fileName) {
    audioVar.src = fileName;
    audioVar.addEventListener("canplay", () => this.launchIfReady());
  }
}

window.gui = new Gui();

window.onload = function () {
  gui.load(assets);
};

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

const MARGIN = 9.8;
const BOARD_LEFT_MOST = 0;
const BOARD_RIGHT_MOST = 88.2;
const BOARD_BOTTOM_MOST = 0;
const BOARD_TOP_MOST = -88.2;

const LADDER = "ladder";
const SNAKE = "snake";
const NORMAL = "normal";

const RUN_ONCE = -2;
const NONE = -1;

const GAME_STATE = {
  PLAYER_JOINED: "PLAYER_JOINED",
  STATUS_CHANGED: "STATUS_CHANGED",
  PLAYER_MOVED: "PLAYER_MOVED",
  TURN_CHANGED: "TURN_CHANGED",
  QUEUE: 1,
  START: 2,
  END: 3,
};

const DIRECTION = {
  UP: "up",
  RIGHT: "right",
  LEFT: "left",
};

const PLAYER_COLOR = {
  RED: "red",
  GREEN: "green",
  YELLOW: "yellow",
  BROWN: "brown",
};

const SOUND = {
  DICE: "dice",
  MOVE: "player-move",
  BG: "bg",
  HOVER: "hover",
};
