module.exports = {
    createGameState,
    initGame,
    createNewPlayer
}

/*
* sample player
* {
*   marginLeft: 0,
*   marginTop: 0,
*   playerColor: 'red'
* }
*/

function initGame() {
    const state = createGameState();
    return state
}

function createGameState() {
    return {
        turn: "red",
        players: [],
        dice: 1 ,
        status: 1,
        winner: -1,
        roomName: '',
        moving: false
      };
}

function createNewPlayer(playerNumber) {
    let color = ''

    switch(playerNumber) {
        case 1:
            color = 'red'
            break
        case 2:
            color = 'green'
            break
        case 3:
            color = 'yellow'
            break
        case 4:
            color = 'brown'
            break
        default:
            break
    }

    return {
        playerColor: color,
        marginLeft: 0,
        marginTop: 0
    }
}