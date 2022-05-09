const socket = io();

// sockets
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameCode", setGameCode);
// socket.on("userJoined", handleUserJoin);
// socket.on("statusChanged", handleStatusChange);
socket.on("turnChanged", handleTurnChanged);
socket.on("canChangeTurn", handleWillTurnChange);
socket.on("question", handleQuestion);

socket.on("unknownCode", unknownRoom);
socket.on("tooManyPlayers", tooManyPlayers);
socket.on("invalidSession", invalidSession);

let stopEvent = false;
let canRoll = true;
let player = {};
let roomName = "";
let state = {};
let animationsDone = false;
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
  if (player.playerColor !== "red") {
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
  if (player.playerColor === "red") {
    console.log("room name", roomName);
    socket.emit("gameStart", roomName);
  }
}

//status change handler
function handleStatusChange(updatedState) {
  state = updatedState;

  if (state.status === 1) {
    //queue
  } else if (state.status === 2) {
    //game start
    modalQueue.classList.toggle("hide");
    if(state.turn !== player.playerColor) {
      showCurrentPlayerMoving(state.turn)
    }
    init();
  } else if (state.status === 3) {
    //game
    displayWinner(state.winner); //display it on side
    showWinner(parseWinnerCode(state.winner)) //show in modal
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

async function main(e) {
  console.log("state", state);
  console.log("from 34");
  // changePlayerTurnIndicator(state.turn, player.playerColor);
  console.log(
    "state turn: " + state.turn + " player Color: " + player.playerColor
  );
  if (e.keyCode == "83" && !stopEvent && state.turn === player.playerColor) {
    await checkLaddersAndSnakes();
    console.log("triggered" + ` stopEv: ${stopEvent} and canRoll: ${canRoll}`);
    if (canMove) {
      console.log("In");
      console.log("player: " + player);
      stopEvent = true;
      socket.emit("rollDice", roomName);
      socket.emit("getQuestion");
    }

    socket.emit("getQuestion");
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
  let totalMargins = {
    marginLeft: marginLeft(),
    marginTop: marginTop(),
  }

  if (diceNumber !== 0) {
    for(let i = 1; i <= diceNumber; i++) {
      let direction = getDirection(totalMargins);
      console.log(direction)

      if (direction == "up") {
        totalMargins.marginTop = Math.round((totalMargins.marginTop -= 9.8) * 10) / 10;
      } else if (direction == "right") {
        totalMargins.marginLeft = Math.round((totalMargins.marginLeft += 9.8) * 10) / 10;
      } else if (direction == "left") {
        totalMargins.marginLeft = Math.round((totalMargins.marginLeft -= 9.8) * 10) / 10;
      }
    }

    console.log('position: ', totalMargins)
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
  if (marginTop() == -88.2 && marginLeft() == 0) {
    socket.emit("winner", {
      turn: state.turn,
      color: player.playerColor,
      roomName: state.roomName,
    });

    return true
  } else {
    return false
  }
}

function handleTurnChanged(newState) {
  if (!newState.moving) {
    changePlayerTurnIndicator(newState.turn, player.playerColor);
    stopEvent = false;
    console.log("TURN DONE. NEW STATE - ", newState);
  }
}

function changeTurn() {
  console.log("changing turn");
  //   socket.once("changeTurn", state);
}

function getDirection(totalMargins) {
  const marginLeft = totalMargins.marginLeft
  const marginTop = totalMargins.marginTop
  let direction;
  if (
    (marginLeft == 88.2 && ((marginTop * 10) % (-19.6 * 10)) / 10 == 0) ||
    (marginLeft == 0 && ((marginTop * 10) % (-19.6 * 10)) / 10 != 0)
  ) {
    direction = "up";
  } else if (((marginTop * 10) % (-19.6 * 10)) / 10 == 0) {
    direction = "right";
  } else {
    direction = "left";
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
        return { type: "ladder", index: i };
      } else if (froms[i][1] < tos[i][1]) {
        didHitImportantTile = true;
        return { type: "snake", index: i };
      }
    } else {
      if (!didHitImportantTile && i === tos.length - 1) {
        return { type: "normal", index: 0 };
      }
    }
  }
}

// function checkLaddersAndSnakes(when = "before") {
//   return new Promise(async (resolve, reject) => {
//     canMove = true;
//     let didHitImportantTile = false;

//     for (let i = 0; i < tos.length; i++) {
//       if (marginLeft() == froms[i][0] && marginTop() == froms[i][1]) {
//         if (froms[i][1] > tos[i][1]) {
//           await showQuestion("ladder", i);
//           didHitImportantTile = true;
//           break;
//         } else if (froms[i][1] < tos[i][1]) {
//           await showQuestion("snake", i);
//           didHitImportantTile = true;
//           break;
//         }
//       }
//     }

//     if (when !== "after") {
//       if (!didHitImportantTile) {
//         canMove = await showQuestion("normal", 0);
//       }
//     }

//     resolve();
//   });
// }

function showQuestion(consequence, idx) {
  return new Promise(async (resolve, reject) => {
    const questionItself = question.question;
    const rightAns = question.ans;
    const options = question.options;
    let questionUsed = {};

    if (consequence === "snake") {
      qIndicator.innerHTML =
        "Answer the question correctly to escape the snake!";
    } else if (consequence === "ladder") {
      qIndicator.innerHTML =
        "Answer the question correctly to climb the ladder!";
    } else {
      qIndicator.innerHTML = "Answer the question correctly to move!";
    }

    console.log("QUestion", questionItself);
    console.log("type", question.type);

    optionsList.innerHTML = "";
    questionNormal.innerHTML = "";
    questionImg.innerHTML = "";
    questionVid.innerHTML = "";

    if (question.type == "1") {
      handleQuestionModal();
      const theSpan = document.createElement("span");
      theSpan.innerHTML = questionItself;

      questionNormal.append(theSpan);

      console.log("Hey", question.type);
      questionNormal.classList.toggle("hide");
      questionUsed = questionNormal;

      for (let i = 0; i < options.length; i++) {
        let option = document.createElement("li");
        let content = document.createElement("a");
        let letter = "A. ";

        content.setAttribute("class", "proxy");
        content.setAttribute("href", "#");
        content.setAttribute("id", i);

        if (i === 0) {
          letter = "A. ";
        } else if (i === 1) {
          letter = "B. ";
        } else if (i === 2) {
          letter = "C. ";
        } else if (i === 3) {
          letter = "D. ";
        }

        content.innerHTML = `${letter}${options[i]}`;
        option.append(content);
        optionsList.append(option);
      }
    } else if (question.type == "2") {
      handleQuestionModal();
      const img = document.createElement("img");
      img.setAttribute("src", questionItself);
      img.setAttribute("alt", "");

      questionImg.append(img);

      console.log("Hey", question.type);
      questionImg.classList.toggle("hide");
      questionUsed = questionImg;

      for (let i = 0; i < options.length; i++) {
        let option = document.createElement("li");
        let content = document.createElement("a");
        let letter = "A. ";

        content.setAttribute("class", "proxy");
        content.setAttribute("href", "#");
        content.setAttribute("id", i);

        if (i === 0) {
          letter = "A. ";
        } else if (i === 1) {
          letter = "B. ";
        } else if (i === 2) {
          letter = "C. ";
        } else if (i === 3) {
          letter = "D. ";
        }

        content.innerHTML = `${letter}${options[i]}`;
        option.append(content);
        optionsList.append(option);
      }
    } else if (question.type == "3") {
      handleQuestionModal();
      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", questionItself);
      iframe.setAttribute("allow", "autoplay");

      questionVid.append(iframe);
      console.log("Hey", question.type);
      questionVid.classList.toggle("hide");
      questionUsed = questionVid;

      for (let i = 0; i < options.length; i++) {
        let option = document.createElement("li");
        let content = document.createElement("a");
        let letter = "A. ";

        content.setAttribute("class", "proxy");
        content.setAttribute("href", "#");
        content.setAttribute("id", i);

        if (i === 0) {
          letter = "A. ";
        } else if (i === 1) {
          letter = "B. ";
        } else if (i === 2) {
          letter = "C. ";
        } else if (i === 3) {
          letter = "D. ";
        }

        content.innerHTML = `${letter}${options[i]}`;
        option.append(content);
        optionsList.append(option);
      }
    }

    optionsList.addEventListener(
      "click",
      (f = async (e) => {
        if (e.target.id !== "options-list") {
          const ans = getOptionLetterFromIdx(e.target.id);
          console.log(ans, rightAns);

          if (consequence === "snake") {
            if (ans === rightAns) {
              console.log("right");
              alert("Right answer! You evaded the snake!");
              await move(getDirection());
              resolve();
              handleQuestionModal();
            } else {
              console.log("wrong");
              alert("Wrong answer! The snake swallowed you...");
              const currentTurn = document.querySelector(`#${state.turn}`);
              currentTurn.style.marginLeft = `${tos[idx][0]}vmin`;
              currentTurn.style.marginTop = `${tos[idx][1]}vmin`;
              await new Promise((resolve) => setTimeout(resolve, 400));
              resolve();
              handleQuestionModal();
            }
          } else if (consequence === "ladder") {
            if (ans === rightAns) {
              console.log("right");
              alert("Right answer! Climbing now...");
              const currentTurn = document.querySelector(`#${state.turn}`);
              currentTurn.style.marginLeft = `${tos[idx][0]}vmin`;
              currentTurn.style.marginTop = `${tos[idx][1]}vmin`;
              await new Promise((resolve) => setTimeout(resolve, 400));
              resolve();
              handleQuestionModal();
            } else {
              console.log("wrong");
              alert("Wrong answer! Let's not use the ladder...");
              await move(getDirection());
              resolve();
              handleQuestionModal();
            }
          } else {
            if (ans === rightAns) {
              console.log("right");
              alert("Right answer! Will move...");
              resolve(true);
              console.log("Resolving true");
              handleQuestionModal();
            } else {
              console.log("wrong");
              alert("Wrong answer! Let's just sit here for now...");
              resolve(false);
              handleQuestionModal();
            }
          }

          questionUsed.classList.toggle("hide");
          optionsList.removeEventListener("click", f);
          socket.emit("getQuestion");
        }
      }),
      f
    );
  });
}

function getOptionLetterFromIdx(idx) {
  if (idx == 0) {
    return "a";
  }
  if (idx == 1) {
    return "b";
  }
  if (idx == 2) {
    return "c";
  }
  if (idx == 3) {
    return "d";
  }
}

//event listeners
enterRoom.addEventListener("click", handleJoinGame);
startBtn.addEventListener("click", handleStartGame);

//event handlers
function handleQuestion(questionFromServer) {
  const theQuestion = JSON.parse(questionFromServer);
  question = theQuestion;
}

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
      socket.emit("doneMoving", roomName);
    }
  }
}

function handleWillTurnChange(updatedState) {
  state = JSON.parse(updatedState);
  socket.emit("moveDone", roomName);
  // handleTurnChanged(newState)
  stopEvent = false;
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
    case "PLAYER_JOINED":
      addPlayerToDOM(player.playerColor, newState.players);
      break;
    /*
     * notifies this player and all players
     * in this room when game status has changed
     */
    case "STATUS_CHANGED":
      handleStatusChange(newState);
      break;
    /*
     * notifies all players
     * in this room when a player moves
     */
    case "PLAYER_MOVED":
      movePlayersByMargin(newState);
      checkWin()
      break;
    /*
     * notifies all players
     * in this room when the turn has changed
     */
    case "TURN_CHANGED":
      handleTurnChanged(newState);
      if(newState.turn !== player.playerColor) {
        showCurrentPlayerMoving(newState.turn)
      } else {
        currentPlayerIndicatorModal.classList.add('hide')
      }
      break;
    default:
      break;
  }

  state = newState;
}
