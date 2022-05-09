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

function showWinner(winner) {
  currentTurnIndicatorSpan.innerHTML = `Player ${toUpperCaseColor(
    winner
  )} wins!!!`;
  currentPlayerIndicatorModal.classList.remove("hide");
}

function showCurrentPlayerMoving(currentTurn) {
  currentTurnIndicatorSpan.innerHTML = `Player ${toUpperCaseColor(
    currentTurn
  )} is making a move...`;
  currentPlayerIndicatorModal.classList.remove("hide");
}

function movePlayersByMargin(state) {
  const players = state.players;

  for (let i = 0; i < players.length; i++) {
    const player = document.querySelector(`#${players[i].playerColor}`);

    player.style.marginLeft = String(players[i].marginLeft) + "vmin";
    player.style.marginTop = String(players[i].marginTop) + "vmin";
  }
}

function drawPlayers(state) {
  const players = state.players;

  console.log("Players in room: " + state.roomName + " is " + players.length);

  for (let i = 0; i < players.length; i++) {
    const player = document.createElement("div");
    player.setAttribute("id", players[i].playerColor);
    player.setAttribute("class", "players");

    player.style.marginLeft = `${players[i].marginLeft}vmin`;
    player.style.marginTop = `${players[i].marginTop}vmin`;

    document.querySelector("#board").append(player);
  }
}

function changePlayerTurnIndicator(turn, playerColor) {
  if (turn !== playerColor) {
    playerTurnIndicator.innerHTML = `${toUpperCaseColor(turn)}'s turn...`;
    playerTurnInstruction.innerHTML = "Cannot roll yet";
    rollDiceBtn.classList.add("hide");
    canRoll = false;
  } else {
    camRoll = true;
    playerTurnIndicator.innerHTML = `Your turn!`;
    playerTurnInstruction.innerHTML = "Your turn";
    rollDiceBtn.classList.remove("hide");
  }
}

function addPlayerToDOM(color, players) {
  playerCount.innerHTML = `${players.length} /4`;
  playerList.innerHTML = "";
  for (let i = 0; i < players.length; i++) {
    const newPlayer = document.createElement("li");
    if (color !== players[i].playerColor) {
      newPlayer.innerHTML = toUpperCaseColor(players[i].playerColor);
      playerList.append(newPlayer);
    } else {
      newPlayer.innerHTML = toUpperCaseColor(color) + " (You)";
      playerList.append(newPlayer);
    }
  }
}

function toUpperCaseColor(color) {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

// event listeners
joinRoomBtn.addEventListener("click", handleJoinRoombtn);
closeModal.addEventListener("click", handleModal);
createRoom.addEventListener("click", handleCreateRoom);

// event handlers
function handleJoinRoombtn(e) {
  handleModal(e);
}

function handleModal(e) {
  modal.classList.toggle("hide");
}

function handleQuestionModal() {
  modalQuestion.classList.toggle("hide");
}

function handleCreateRoom(e) {
  modalQueue.classList.toggle("hide");
  socket.emit("newGame");
}

// error handlers
function invalidSession() {
  alert("Can't join game. The game has already started or finished.");
  window.location.reload();
}

function tooManyPlayers() {
  alert("Can't join game. The game is full.");
  window.location.reload();
}

function unknownRoom(roomCode) {
  alert("The room [" + roomCode + "] does not exist.");
  window.location.reload();
}
