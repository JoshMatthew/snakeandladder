module.exports = {
    createGameState,
    gameLoop,
    initGame
}

// sample player
// {
//     marginLeft: 0,
//     marginRight: 0,
//     color: 'red'
// }

function initGame() {
    const state = createGameState();
    return state
}

function createGameState() {
    return {
        turn: "",
        players: [],
        playerColor: '',
        dice: 1 
      };
}

function gameLoop(state) {
    if(!state) {
        return
    }

    if(state.turn !== state.playerColor) {
        return
    }


}