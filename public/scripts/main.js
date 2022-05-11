// sockets
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameCode", setGameCode);
socket.on("turnChanged", handleTurnChanged);
socket.on("question", handleQuestion);

//game create
/*
 * when creating a game room, it makes a game/room code
 * and initializes the player(host)
 */

// initialize the player
function handleInit(client) {
  state = JSON.parse(client.state);
  player = state.players[client.playerNumber - 1];
  addPlayerToDOM(player.playerColor, state.players);
  if (player.playerColor !== PLAYER_COLOR.RED) {
    startBtn.classList.toggle("hide");
  }
}

//game join
function handleJoinGame(e) {
  const roomCode = document.getElementById("room-code").value;
  socket.emit("joinGame", roomCode);
  handleModal(e);
  modalQueue.classList.toggle("hide");
  gameCode.innerHTML = roomCode;
}

// start game
function handleStartGame(e) {
  if (player.playerColor === PLAYER_COLOR.RED) {
    console.log("room name", roomName);
    socket.emit("gameStart", roomName);
  }
}

//status change handler
function handleStatusChange(updatedState) {
  state = updatedState;

  if (state.status === GAME_STATE.QUEUE) {
    //queue
  } else if (state.status === GAME_STATE.START) {
    //game start
    playSound(SOUND.BG)
    modalQueue.classList.toggle("hide");
    if (state.turn !== player.playerColor) {
      showCurrentPlayerMoving(state.turn);
    }
    init();
  } else if (state.status === GAME_STATE.END) {
    //end
    displayWinner(state.winner); //display it on side
    showWinner(parseWinnerCode(state.winner)); //show in modal
  }
}

//this function initializes the game scene
function init() {
  //DOM
  gameSection.classList.toggle("hide");
  homeScreen.classList.toggle("hide");
  setTileNumbers();
  drawPlayers(state);

  //events
  socket.emit("getQuestion");

  //mechanics
  changePlayerTurnIndicator(state.turn, player.playerColor);
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

    playSound(SOUND.DICE);

    document.querySelector(
      "#cube-inner"
    ).style.transform = `rotateX(360deg) rotateY(360deg)`;
    await new Promise((resolve) => setTimeout(resolve, 500));
    document.querySelector("#cube-inner").style.transform = `rotateX(${
      values[diceNumber - 1][0]
    }deg) rotateY(${values[diceNumber - 1][1]}deg)`;
    await new Promise((resolve) => setTimeout(resolve, 500));
    document.querySelector("#cube-inner").style.transform = `rotateX(${
      values[diceNumber - 1][0]
    }deg) rotateY(${values[diceNumber - 1][1]}deg)`;
    await new Promise((resolve) => setTimeout(resolve, 500));
    document.querySelector("#cube-inner").style.transform = `rotateX(${
      values[diceNumber - 1][0]
    }deg) rotateY(${values[diceNumber - 1][1]}deg)`;
    await new Promise((resolve) => setTimeout(resolve, 500));
    resolve(diceNumber);
  });
}

function run(diceNumber) {
  let totalMargins = {
    marginLeft: marginLeft(),
    marginTop: marginTop(),
  };

  if (diceNumber !== 0) {
    for (let i = 1; i <= diceNumber; i++) {
      let direction = getDirection(totalMargins);
      console.log(direction);

      if (direction == DIRECTION.UP) {
        totalMargins.marginTop =
          Math.round((totalMargins.marginTop -= MARGIN) * 10) / 10;
      } else if (direction == DIRECTION.RIGHT) {
        totalMargins.marginLeft =
          Math.round((totalMargins.marginLeft += MARGIN) * 10) / 10;
      } else if (direction == DIRECTION.LEFT) {
        totalMargins.marginLeft =
          Math.round((totalMargins.marginLeft -= MARGIN) * 10) / 10;
      }
    }

    return totalMargins;
  } else {
    //don't do anything, don't move
    return { marginLeft: marginLeft(), marginTop: marginTop() };
  }
}

function displayWinner(code) {
  document.querySelector("#p-turn").innerHTML = `${parseWinnerCode(
    code
  )} player wins!`;
}

function checkWin() {
  if (marginTop() == BOARD_TOP_MOST && marginLeft() == BOARD_LEFT_MOST) {
    socket.emit("winner", {
      turn: state.turn,
      color: player.playerColor,
      roomName: state.roomName,
    });

    return true;
  } else {
    return false;
  }
}

function getDirection(totalMargins) {
  const marginLeft = totalMargins.marginLeft;
  const marginTop = totalMargins.marginTop;
  let direction;
  if (
    (marginLeft == BOARD_RIGHT_MOST &&
      ((marginTop * 10) % (-19.6 * 10)) / 10 == 0) ||
    (marginLeft == BOARD_LEFT_MOST &&
      ((marginTop * 10) % (-19.6 * 10)) / 10 != 0)
  ) {
    direction = DIRECTION.UP;
  } else if (((marginTop * 10) % (-19.6 * 10)) / 10 == 0) {
    direction = DIRECTION.RIGHT;
  } else {
    direction = DIRECTION.LEFT;
  }

  return direction;
}

function checkLaddersAndSnakes() {
  canMove = true;
  let didHitImportantTile = false;

  for (let i = 0; i < tos.length; i++) {
    if (marginLeft() == froms[i][0] && marginTop() == froms[i][1]) {
      if (froms[i][1] > tos[i][1]) {
        didHitImportantTile = true;
        return { type: LADDER, index: i };
      } else if (froms[i][1] < tos[i][1]) {
        didHitImportantTile = true;
        return { type: SNAKE, index: i };
      }
    } else {
      if (!didHitImportantTile && i === tos.length - 1) {
        return { type: NORMAL, index: 0 };
      }
    }
  }
}

//event listeners
enterRoom.addEventListener("click", handleJoinGame);
startBtn.addEventListener("click", handleStartGame);
const buttons = document.querySelectorAll("a")

for(let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", e => {
    playSound(SOUND.HOVER)
  });
}

window.addEventListener("DOMContentLoaded", (e) => {
  setTimeout(() => {
    splash.classList.add("hide-splash");
  }, 2000);
});

//event handlers
function handleTurnChanged(newState) {
  if (!newState.moving) {
    changePlayerTurnIndicator(newState.turn, player.playerColor);
    stopEvent = false;
    console.log("TURN DONE. NEW STATE - ", newState);
  }
}

function handleQuestion(questionFromServer) {
  const theQuestion = JSON.parse(questionFromServer);
  question = theQuestion;
}

function setGameCode(gc) {
  roomName = gc;

  gameCode.innerHTML = gc;
}

function handleGameState(payload) {
  const newState = JSON.parse(payload.state);
  const type = payload.type;

  switch (type) {
    /*
     * notifies this player if
     * another player has joined this room
     */
    case GAME_STATE.PLAYER_JOINED:
      addPlayerToDOM(player.playerColor, newState.players);
      break;
    /*
     * notifies this player and all players
     * in this room when game status has changed
     */
    case GAME_STATE.STATUS_CHANGED:
      handleStatusChange(newState);
      break;
    /*
     * notifies all players
     * in this room when a player moves
     */
    case GAME_STATE.PLAYER_MOVED:
      movePlayersByMargin(newState);
      checkWin();
      break;
    /*
     * notifies all players
     * in this room when the turn has changed
     */
    case GAME_STATE.TURN_CHANGED:
      handleTurnChanged(newState);
      if (newState.turn !== player.playerColor) {
        showCurrentPlayerMoving(newState.turn);
      } else {
        currentPlayerIndicatorModal.classList.add("hide");
      }
      break;
    default:
      break;
  }

  state = newState;
}
