let path = require("path");
let express = require("express");
const { makeid } = require("./utils");
let app = express();
let http = require("http").Server(app);
let io = require("socket.io")(http);

let { initGame, createNewPlayer} = require("./game");
let { getRandomQuestion } = require("./questions");

const state = {};
const clientRooms = {};

const PORT = process.env.PORT || 3000 

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  console.error("express connection");
  res.sendFile(path.join(__dirname, "..", "public/index.html"));
});

io.on("connection", (client) => {
  console.log("connection");
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
  client.on("rollDice", handleRollDice);
  client.on("gameStart", handleGameStart);
  client.on("winner", handleWinner);
  client.on("changeTurn", handleChangeTurn);
  client.on("moveDone", handleMoveDone);
  client.on("doneMoving", handleDoneMoving)
  client.on("getQuestion", handleGetQuestion)
  client.on("updateCurrentPlayerMargin", handleUpdateCurrentPlayerMargin)

  function handleUpdateCurrentPlayerMargin(data) {
    let currentState = state[data.roomName]

    for(let i = 0; i < currentState.players.length; i++) {
      if (i === data.currentPlayer) {
        currentState.players[i].marginLeft = data.updatedMargins.marginLeft
        currentState.players[i].marginTop = data.updatedMargins.marginTop
      }
    }

    state[data.roomName] = currentState
    io.to(data.roomName).emit("gameState", {type: "PLAYER_MOVED", state: JSON.stringify(currentState)});
  }

  function handleGetQuestion() {
    client.emit('question', getRandomQuestion())
  }

  function handleDoneMoving(roomName) {
    if(roomName) {
      let currentState = state[roomName]
      currentState.moving = false

      state[roomName] = currentState

      io.to(roomName).emit("canChangeTurn", JSON.stringify(currentState));
    }
  }

  function handleMoveDone(roomName) {
    if (roomName) {
      console.log("room name - " + roomName);
      console.log("states - " + JSON.stringify(state));
      let currentState = state[roomName];
      let currentTurn = currentState.turn;
      let newTurn = "red";
      currentState.moving = false

      if (currentState.players.length === 2) {
        switch (currentTurn) {
          case "red":
            newTurn = "green";
            break;
          case "green":
            newTurn = "red";
            break;
        }
      } else if (currentState.players.length === 3) {
        switch (currentTurn) {
          case "red":
            newTurn = "green";
            break;
          case "green":
            newTurn = "yellow";
            break;
          case "yellow":
            newTurn = "red";
            break;
        }
      } else if (currentState.players.length === 4) {
        switch (currentTurn) {
          case "red":
            newTurn = "green";
            break;
          case "green":
            newTurn = "yellow";
            break;
          case "yellow":
            newTurn = "brown";
            break;
          case "brown":
            newTurn = "red";
            break;
        }
      }

      state[roomName].turn = newTurn;

      console.log("new turn - ", newTurn);
      console.log("new state - ", state[roomName]);

      io.to(roomName).emit("gameState", {type: "TURN_CHANGED", state: JSON.stringify(currentState)});
    }
  }

  function handleChangeTurn(oldState) {
    let newState = state[oldState.roomName];
    console.log("changing turn...");
    if (oldState.players.length === 2) {
      switch (oldState.turn) {
        case "red":
          newState.turn = "green";
          break;
        case "green":
          newState.turn = "red";
          break;
      }
    } else if (oldState.players.length === 3) {
      switch (oldState.turn) {
        case "red":
          newState.turn = "green";
          break;
        case "green":
          newState.turn = "yellow";
          break;
        case "yellow":
          newState.turn = "red";
          break;
      }
    } else if (oldState.players.length === 4) {
      switch (oldState.turn) {
        case "red":
          newState.turn = "green";
          break;
        case "green":
          newState.turn = "yellow";
          break;
        case "yellow":
          newState.turn = "brown";
          break;
        case "brown":
          newState.turn = "red";
          break;
      }
    }

    io.to(oldState.roomName).emit("turnChanged", JSON.stringify(newState));
    state[oldState.roomName] = newState;
  }

  function handleWinner(payload) {
    const winner = payload.turn;
    const player = payload.color;
    const roomName = payload.roomName;
    let currentState = state[roomName];

    if (winner === player) {
      currentState.winner = parseWinnerCode(winner);
    }

    currentState.status = 3;

    io.to(roomName).emit("gameState", {type: "STATUS_CHANGED", state: JSON.stringify(currentState)});
    state[roomName] = currentState;
  }

  function handleGameStart(roomName) {
    state[roomName].status = 2;
    console.log("room " + roomName + " status changed: " + "2");
    io.to(roomName).emit("gameState", {type: "STATUS_CHANGED", state: JSON.stringify(state[roomName])});
  }

  function handleRollDice(roomName) {
    if(roomName) {
      console.log("dice being rolled...");
      const diceNumber = Math.floor(Math.random() * 6) + 1;
      let currentState = state[roomName];
      currentState.dice = diceNumber;
      currentState.moving = true
      state[roomName] = currentState;
      
      io.to(roomName).emit("move", JSON.stringify(currentState));
    }
  }

  function handleJoinGame(roomName) {
    console.log("roomname " + roomName);
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;

    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit("unknownCode", roomName);
      return;
    } else if (numClients > 3) {
      client.emit("tooManyPlayers");
      return;
    }

    if (state[roomName].status !== 1) {
      client.emit("invalidSession");
      return;
    }

    clientRooms[client.id] = roomName;

    let currentState = state[roomName];

    const newPlayer = createNewPlayer(numClients + 1);

    currentState.players.push(newPlayer);

    state[roomName] = currentState;

    console.log(`joined room: ${roomName}`);

    client.join(roomName);
    client.number = numClients + 1;
    client.emit("init", {
      playerNumber: numClients + 1,
      state: JSON.stringify(currentState),
    });
    client.broadcast.to(roomName).emit("gameState", {type: "PLAYER_JOINED", state: JSON.stringify(currentState)});
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    let newState = initGame();

    console.log("room created - " + roomName);

    client.join(roomName);
    client.number = 1;

    const newPlayer = createNewPlayer(1);
    newState.players.push(newPlayer);
    newState.roomName = roomName;

    state[roomName] = newState;
    console.log(`new room: ${roomName}`);
    client.emit("init", {
      playerNumber: 1,
      state: JSON.stringify(newState),
    });
  }

  function parseWinnerCode(color) {
    if (color === "red") {
      return 1;
    } else if (color === "green") {
      return 2;
    } else if (color === "yellow") {
      return 3;
    } else if (color === "brown") {
      return 4;
    }
  }
});

http.listen(PORT, () => console.error("listening on port "+PORT));
console.error("socket.io example");
