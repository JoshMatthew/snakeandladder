const socket = io("http://localhost:3000");

let turn = "red";

// sockets
socket.on("init", handleInit);
socket.on("gameState", handleGameState)
socket.on("gameCode", setGameCode);

// GLOBALS
let gameState = {
  turn: "",
  player: {
      marginLeft: 0,
      marginTop: 0
  },
  playerColor: '',
  dice: 1 
};

let stopEvent = false;
let playerColor = "";
let roomName = "";

function init() {
  gameSection.classList.toggle("hide");
  homeScreen.classList.toggle("hide");
  document.addEventListener("keydown", main);
  setTileNumbers();
  drawPlayer();
}

// elements
const modal = document.getElementById("--modal");
const modalQueue = document.getElementById("--modal-queue");
const tiles = document.querySelectorAll(".tile");
const gameSection = document.getElementById("gameSection");
const homeScreen = document.getElementById("homeScreen");
const gameCode = document.getElementById("game-code");

// btns
const joinRoomBtn = document.getElementById("join-room");
const createRoom = document.getElementById("create-room");
const enterRoom = document.getElementById("enter-room");
const closeModal = document.getElementById("close-modal");
const startBtn = document.getElementById("start");

// init functions
function setTileNumbers() {
  tiles.forEach((tile, i) => {
    if (
      String(i).length == 1 ||
      (String(i).length == 2 && Number(String(i)[0])) % 2 == 0
    ) {
      tile.innerHTML = 100 - i;
    } else {
      tile.innerHTML = Number(`${9 - Number(String(i)[0])}${String(i)[1]}`) + 1;
    }
  });
}

// event listeners
joinRoomBtn.addEventListener("click", handleJoinRoombtn);
closeModal.addEventListener("click", handleModal);
createRoom.addEventListener("click", handleCreateRoom);
enterRoom.addEventListener("click", handleJoinGame);
startBtn.addEventListener("click", handleStartGame);

//socket event handlers
function handleInit(pc) {
  playerColor = pc;
  console.log("My color is " + pc);
}

function setGameCode(gc) {
  console.log(gc);
  roomName = gc;

  gameCode.innerHTML = gc
}

// event handlers
function handleStartGame(e) {
  modalQueue.classList.toggle("hide");
  init();
}

function handleJoinGame(e) {
  const roomCode = document.getElementById("room-code").value;
  socket.emit("joinGame", roomCode);
  handleModal(e);
  modalQueue.classList.toggle("hide");
  gameCode.innerHTML = roomCode
}

async function main(e) {
  if (e.keyCode == "83" && !stopEvent) {
    stopEvent = true;
    let diceNumber = await roll();
    socket.emit('rollDice', diceNumber)
    let isOutOfRange = checkRange(diceNumber);
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!isOutOfRange) {
      await run(diceNumber);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    let wonBy = checkWin();
    if (wonBy == "none") {
      changeTurn();
      stopEvent = false;
    }
  }
}

function handleJoinRoombtn(e) {
  handleModal(e);
}

function handleCreateRoom(e) {
  modalQueue.classList.toggle("hide");
  socket.emit("newGame");
}

function handleModal(e) {
  modal.classList.toggle("hide");
}

// helper functions
function checkWin() {
  if (marginTop() == -88.2 && marginLeft() == 0) {
    document.querySelector("#p-turn").innerHTML = `${turn} player wins!`;
    return turn;
  } else {
    return "none";
  }
}

function roll() {
  return new Promise(async (resolve, reject) => {
    let diceNumber = Math.floor(Math.random() * 6) + 1;
    let values = [
      [0, -360],
      [-180, -360],
      [-180, 270],
      [0, -90],
      [270, 180],
      [90, 90],
    ];
    document.querySelector(
      "#cube-inner"
    ).style.transform = `rotateX(360deg) rotateY(360deg)`;
    await new Promise((resolve) => setTimeout(resolve, 750));
    document.querySelector("#cube-inner").style.transform = `rotateX(${
      values[diceNumber - 1][0]
    }deg) rotateY(${values[diceNumber - 1][1]}deg)`;
    await new Promise((resolve) => setTimeout(resolve, 750));
    resolve(diceNumber);
  });
}

function checkRange(diceNumber) {
  let isOutOfRange = false;
  if (
    marginTop() == -88.2 &&
    marginLeft() + Number((diceNumber * -9.8).toFixed(1)) < 0
  ) {
    isOutOfRange = true;
  }

  return isOutOfRange;
}

function marginLeft() {
  return Number(
    document.querySelector(`#${turn}`).style.marginLeft.split("v")[0]
  );
}

function marginTop() {
  return Number(
    document.querySelector(`#${turn}`).style.marginTop.split("v")[0]
  );
}

function run(diceNumber) {
  return new Promise(async (resolve, reject) => {
    for (i = 1; i <= diceNumber; i++) {
      let direction = getDirection();
      await move(direction);
    }
    await checkLaddersAndSnakes();
    resolve();
  });
}

function checkLaddersAndSnakes() {
  return new Promise(async (resolve, reject) => {
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

    const currentTurn = document.querySelector(`#${turn}`);

    for (let i = 0; i < tos.length; i++) {
      if (marginLeft() == froms[i][0] && marginTop() == froms[i][1]) {
        currentTurn.style.marginLeft = `${tos[i][0]}vmin`;
        currentTurn.style.marginTop = `${tos[i][1]}vmin`;
        await new Promise((resolve) => setTimeout(resolve, 400));
        break;
      }
    }
    resolve();
  });
}

function getDirection() {
  let direction;
  if (
    (marginLeft() == 88.2 && ((marginTop() * 10) % (-19.6 * 10)) / 10 == 0) ||
    (marginLeft() == 0 && ((marginTop() * 10) % (-19.6 * 10)) / 10 != 0)
  ) {
    direction = "up";
  } else if (((marginTop() * 10) % (-19.6 * 10)) / 10 == 0) {
    direction = "right";
  } else {
    direction = "left";
  }

  return direction;
}

function move(direction) {
  return new Promise(async (resolve, reject) => {
    const currentTurn = document.querySelector(`#${turn}`);

    if (direction == "up") {
      currentTurn.style.marginTop = String(marginTop() - 9.8) + "vmin";
    } else if (direction == "right") {
      currentTurn.style.marginLeft = String(marginLeft() + 9.8) + "vmin";
    } else if (direction == "left") {
      currentTurn.style.marginLeft = String(marginLeft() - 9.8) + "vmin";
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
    resolve();
  });
}

function changeTurn() {
  const playerTurn = document.querySelector("#p-turn");
  if (turn == "blue") {
    playerTurn.innerHTML = "Red player's turn";
    turn = "red";
  } else if (turn == "red") {
    playerTurn.innerHTML = "Blue player's turn";
    turn = "blue";
  }
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState)
}

function drawPlayer() {
    const player = document.createElement("div")
    console.log(playerColor)
    player.setAttribute('id', playerColor)
    player.setAttribute('class', 'players')
    player.style.marginLeft = `${gameState.player.marginLeft}vmin`;
    player.style.marginTop = `${gameState.player.marginTop}vmin`;

    document.querySelector("#board").prepend(player)
}