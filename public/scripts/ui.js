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

    if (
      !(
        player.style.marginLeft === String(players[i].marginLeft) + "vmin" &&
        player.style.marginTop === String(players[i].marginTop) + "vmin"
      )
    ) {
      playSound(SOUND.MOVE);
      player.style.marginLeft = String(players[i].marginLeft) + "vmin";
      player.style.marginTop = String(players[i].marginTop) + "vmin";
    }
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
    playerTurnInstruction.innerHTML = "Press the button to start moving";
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
soundBtn.addEventListener("click", toggleSound);
quitBtn.addEventListener("click", handleQuit);

// event handlers
function handleQuit() {
//show the quit button if and only if the user is 
//the host aka red
  if(player.playerColor === PLAYER_COLOR.RED) {
   let isExecuted = confirm("Are you sure to quit the current game session?"); 
   if(isExecuted) {
     socket.emit('quit-game', {roomName: state.roomName})
   }
  } else {
    alert("Only the host can quit the game.")
  }
}

function toggleSound(e) {
  const imgSrc = volume === 0 ? "../assets/img/sound-on.png" : "../assets/img/sound-off.png";

  if (volume === 0) {
    volume = 0.2;
    // for bgm;
    bgm.play();
  } else {
    volume = 0;
    bgm.pause();
  }
  soundImg.style.background = `url(${imgSrc})`;
}

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

socket.on("unknownCode", unknownRoom);
socket.on("tooManyPlayers", tooManyPlayers);
socket.on("invalidSession", invalidSession);

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

function toggleScreen(screen) {
  screen.classList.toggle("hide")
}

function playSound(sound) {
  const audio = new Audio();
  audio.volume = volume;

  switch (sound) {
    case SOUND.DICE:
      audio.src = window.gui.getAsset("aud-dice-roll").src;
      audio.play();
      break;
    case SOUND.MOVE:
      audio.src = window.gui.getAsset("aud-player-move").src;
      audio.play();
      break;
    case SOUND.BG:
      audio.src = window.gui.getAsset("aud-bg").src;
      audio.loop = true;
      audio.play();
      bgm = audio;
      break;
    case SOUND.HOVER:
      audio.src = window.gui.getAsset("aud-btn-hover").src;
      audio.play();
      break;
    default:
      break;
  }
}
