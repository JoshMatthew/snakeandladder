let path = require('path');
let express = require('express');
const { makeid } = require('./utils');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let { createGameState, initGame } = require('./game')

const state = {}
const clientRooms = {}

app.use(express.static(path.join(__dirname, '..', '..', 'client')))

app.get('/', (req, res) => {
  console.error('express connection');
  res.sendFile(path.join(__dirname, '..', '..', 'client/index.html'));
});

io.on('connection', client => {
  client.on('newGame', handleNewGame)
  client.on('joinGame', handleJoinGame)
  client.on('rollDice', handleRollDice)

  function handleRollDice(diceNumber) {

  }

  function handleJoinGame(roomName) {
    console.log("roomname " + roomName)
    const room = io.sockets.adapter.rooms[roomName]

    let allUsers;

    if(room) {
      allUsers = room.sockets
    }

    let numClients = 0
    if(allUsers) {
      numClients = Object.keys(allUsers).length
    }

    if(numClients === 0) {
      client.emit('unknownCode')
      return
    } else if (numClients > 3) {
      client.emit('tooManyPlayers')
      return
    }

    clientRooms[client.id] = roomName

    client.join(roomName)
    client.color = "green"
    client.emit('init', "green")
  }

  function handleNewGame() {
    let roomName = makeid(5)
    clientRooms[client.id] = roomName
    client.emit('gameCode', roomName)

    state[roomName] = initGame()

    console.log("room created - " + roomName)

    client.join(roomName)
    client.color = "red"
    client.emit('init', "red")
  }

  function endTurn() {

  }
});

http.listen(3000, () => console.error('listening on http://localhost:3000/'));
console.error('socket.io example');