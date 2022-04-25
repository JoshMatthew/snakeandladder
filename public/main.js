const socket = io();

// sockets
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameCode", setGameCode);
socket.on("userJoined", handleUserJoin);
socket.on("statusChanged", handleStatusChange);
socket.on("move", handleMove);
socket.on("turnChanged", handleTurnChanged);
socket.on("canChangeTurn", handleWillTurnChange);

socket.on("unknownCode", unknownRoom);
socket.on("tooManyPlayers", tooManyPlayers);
socket.on("invalidSession", invalidSession);

let stopEvent = false;
let canRoll = true;
let player = {};
let roomName = "";
let state = {};
let animationsDone = false;

function init() {
  gameSection.classList.toggle("hide");
  homeScreen.classList.toggle("hide");

  document.addEventListener("keydown", main);
  setTileNumbers();
  drawPlayer(state);
  console.log("from 29");
  changePlayerTurnIndicator(state.turn, player.playerColor);
}

function main(e) {
  console.log("state", state);
  console.log("from 34");
    // changePlayerTurnIndicator(state.turn, player.playerColor);
  console.log(
    "state turn: " + state.turn + " player Color: " + player.playerColor
  );
  console.log("triggered" + ` stopEv: ${stopEvent} and canRoll: ${canRoll}`);
  if (e.keyCode == "83" && !stopEvent && state.turn === player.playerColor) {
    console.log("In");
    console.log("player: " + player);
    stopEvent = true;
    socket.emit("rollDice", roomName);
  }
}

function getPlayerColor(playerNumber) {
  switch (playerNumber) {
    case 1:
      return "red";
    case 2:
      return "green";
    case 3:
      return "yellow";
    case 4:
      return "brown";
    default:
      break;
  }
}

function roll(diceNumber) {
  return new Promise(async (resolve, reject) => {
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
    document.querySelector(`#${state.turn}`).style.marginLeft.split("v")[0]
  );
}

function marginTop() {
  return Number(
    document.querySelector(`#${state.turn}`).style.marginTop.split("v")[0]
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

function displayWinner(code) {
  document.querySelector("#p-turn").innerHTML = `${parseWinnerCode(
    code
  )} player wins!`;
}

function parseWinnerCode(code) {
  if (code === 5) {
    return player.playerColor;
  }

  if (code === 1) {
    return "red";
  }

  if (code === 2) {
    return "green";
  }

  if (code === 3) {
    return "yellow";
  }

  if (code === 4) {
    return "brown";
  }
}

function checkWin() {
  console.log("check win");
  if (marginTop() == -88.2 && marginLeft() == 0) {
    document.querySelector("#p-turn").innerHTML = `${state.turn} player wins!`;
    socket.emit("winner", {
      turn: state.turn,
      color: player.playerColor,
      roomName,
    });
    return state.turn;
  } else {
    return "none";
  }
}

function handleTurnChanged(newState) {
  if(!state.moving) {
    state = JSON.parse(newState)
    changePlayerTurnIndicator(state.turn, player.playerColor)
    stopEvent = false;
  
    console.log("TURN DONE. NEW STATE - ", state)
  }
}

function changeTurn() {
  console.log("changing turn");
  //   socket.once("changeTurn", state);
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
    const currentTurn = document.querySelector(`#${state.turn}`);

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

    const currentTurn = document.querySelector(`#${state.turn}`);

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

//event listeners
enterRoom.addEventListener("click", handleJoinGame);
startBtn.addEventListener("click", handleStartGame);

//event handlers
async function handleMove(newState) {
  state = JSON.parse(newState);
  
  console.log("Handle dice roll: ", state);
  const diceNumber = state.dice;

  console.log("pp:-- rolling dice...");

  await roll(diceNumber);
  let isOutOfRange = checkRange(diceNumber);
  await new Promise((resolve) => setTimeout(resolve, 400));
  console.log("pp:-- dice rolled...");
  if (!isOutOfRange) {
    console.log("pp:-- not out of range running...");
    await run(diceNumber);
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.log("pp:-- done running, checking win...");
  }
  let wonBy = checkWin();
  if (wonBy == "none") {
    console.log("pp:-- done checking none won...");
    if (state.turn === player.playerColor) {
      socket.emit('doneMoving', roomName)
    }
  }
}

function handleWillTurnChange(updatedState) {
  state = JSON.parse(updatedState)
  socket.emit("moveDone", roomName);
  // handleTurnChanged(newState)
  stopEvent = false;
}

function handleStatusChange(updatedState) {
  state = JSON.parse(updatedState);

  if (state.status === 1) {
    //queue
  } else if (state.status === 2) {
    if (player.playerColor !== "red") {
      modalQueue.classList.toggle("hide");
      init();
    }
  } else if (state.status === 3) {
    displayWinner(state.winner);
  }
}

function handleUserJoin(newState) {
  state = JSON.parse(newState);
  addMyPlayer(player.playerColor, state.players);
}

function setGameCode(gc) {
  roomName = gc;

  gameCode.innerHTML = gc;
}

function handleInit(client) {
  state = JSON.parse(client.state);
  player = state.players[client.playerNumber - 1];
  console.log("new player: " + player);
  console.log("My color is " + player.playerColor);
  addMyPlayer(player.playerColor, state.players);
  if (player.playerColor !== "red") {
    startBtn.classList.toggle("hide");
  }
}

function handleJoinGame(e) {
  const roomCode = document.getElementById("room-code").value;
  socket.emit("joinGame", roomCode);
  handleModal(e);
  modalQueue.classList.toggle("hide");
  gameCode.innerHTML = roomCode;
}

function handleStartGame(e) {
  if (player.playerColor === "red") {
    modalQueue.classList.toggle("hide");
    console.log("room name", roomName);
    socket.emit("gameStart", roomName);
    init();
  }
}

function handleGameState(gameState) {
  state = JSON.parse(gameState);
}
