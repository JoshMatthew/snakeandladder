
//returns proper color according to the given index
function getPlayerColor(playerNumber) {
  switch (playerNumber) {
    case 1:
      return PLAYER_COLOR.RED;
    case 2:
      return PLAYER_COLOR.GREEN;
    case 3:
      return PLAYER_COLOR.YELLOW;
    case 4:
      return PLAYER_COLOR.BROWN;
    default:
      break;
  }
}

//returns the player index according to the player color
function getPlayerIndexByPlayerColor(color) {
  if (color === PLAYER_COLOR.RED) {
    return 0
  }
  if (color === PLAYER_COLOR.GREEN) {
    return 1
  }
  if (color === PLAYER_COLOR.YELLOW) {
    return 2
  }
  if (color === PLAYER_COLOR.BROWN) {
    return 3
  }
}

// checks if the rolled dice is > finish line
function checkRange(diceNumber) {
  let isOutOfRange = false;
  if (
    marginTop() == BOARD_TOP_MOST &&
    marginLeft() + Number((diceNumber * -MARGIN).toFixed(1)) < 0
  ) {
    isOutOfRange = true;
  }

  return isOutOfRange;
}

//returns current player's left margin
function marginLeft() {
  return Number(
    document.querySelector(`#${state.turn}`).style.marginLeft.split("v")[0]
  );
}

//returns current player's right margin
function marginTop() {
  return Number(
    document.querySelector(`#${state.turn}`).style.marginTop.split("v")[0]
  );
}

//returns the winner
function parseWinnerCode(code) {
  if (code === 5) {
    return player.playerColor;
  }

  if (code === 1) {
    return PLAYER_COLOR.RED;
  }

  if (code === 2) {
    return PLAYER_COLOR.RED;
  }

  if (code === 3) {
    return PLAYER_COLOR.YELLOW;
  }

  if (code === 4) {
    return PLAYER_COLOR.BROWN;
  }
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