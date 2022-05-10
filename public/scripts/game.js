socket.on("move", mainGame);

rollDiceBtn.addEventListener("click", mainGameStarter);

async function mainGame(newState) {
  stopEvent = true
  state = JSON.parse(newState);

  if(state.status !== GAME_STATE.END){ //checks if this player is already finish
    const answer = await makeQuestion(checkLaddersAndSnakes());
    
    switch (answer.type) {
      case SNAKE:
        answer.isCorrect ? move(SNAKE, RUN_ONCE) : move(SNAKE, answer.index);
        break;
      case LADDER:
        answer.isCorrect ? move(LADDER, answer.index) : move(LADDER, RUN_ONCE);
        break;
      case NORMAL:
        answer.isCorrect
          ? move(NORMAL, NONE, await rollDice())
          : move(NORMAL, NONE);
        break;
      default:
        break;
    }
    moveDone();
  } else {
    gameDone()
  }
}

function mainGameStarter(e) {
  stopEvent = false; //to avoid spamming roll dice

  if (choosePlayer()) {
    socket.emit("rollDice", state.roomName); //starts the move
  } else {
    console.log(`It's ${state.turn}'s turn, please wait...`);
  }
}

function choosePlayer() {
  //only allow key press if this.player == currentTurn
  //only allow key press if it is the right key code

  console.log(
    `it is ${state.turn}'s turn and your color is ${player.playerColor}`
  );

  console.log("The current turn: " + state.turn)
  console.log("Your color: " + player.playerColor)

  console.log("Can I move my turn: " + (state.turn == player.playerColor && !stopEvent))
  if(state.turn == player.playerColor && !stopEvent) {
    return true
  } else {
    return false
  } 
}

function makeQuestion(questionType) {
  return new Promise(async (resolve, reject) => {
    if(player.playerColor === state.turn) {
      const consequence = questionType.type;
      const idx = questionType.index;
      const questionItself = question.question;
      const rightAns = question.ans;
      const options = question.options;
      let questionUsed = {};
  
      //DOM
      if (consequence === SNAKE) {
        qIndicator.innerHTML =
          "Answer the question correctly to escape the snake!";
      } else if (consequence === LADDER) {
        qIndicator.innerHTML =
          "Answer the question correctly to climb the ladder!";
      } else {
        qIndicator.innerHTML = "Answer the question correctly to move!";
      }
  
      optionsList.innerHTML = "";
      questionNormal.innerHTML = "";
      questionImg.innerHTML = "";
      questionVid.innerHTML = "";
  
      questionUsed = initQuestionDOM(options, questionItself);
  
      optionsList.addEventListener(
        "click",
        (f = async (e) => {
          if (e.target.id !== "options-list") {
            const ans = getOptionLetterFromIdx(e.target.id);
  
            if (consequence === SNAKE) {
              if (ans === rightAns) {
                alert("Right answer! You evaded the snake!");
                resolve({ isCorrect: true, type: SNAKE, index: idx });
                handleQuestionModal();
              } else {
                resolve({ isCorrect: false, type: SNAKE, index: idx });
                handleQuestionModal();
              }
            } else if (consequence === LADDER) {
              if (ans === rightAns) {
                alert("Right answer! Climbing now...");
                resolve({ isCorrect: true, type: LADDER, index: idx });
                handleQuestionModal();
              } else {
                alert("Wrong answer! Let's not use the ladder...");
                resolve({ isCorrect: false, type: LADDER, index: idx });
                handleQuestionModal();
              }
            } else {
              if (ans === rightAns) {
                alert("Right answer! Will move...");
                resolve({ isCorrect: true, type: NORMAL, index: idx });
                handleQuestionModal();
              } else {
                alert("Wrong answer! Let's just sit here for now...");
                resolve({ isCorrect: false, type: NORMAL, index: idx });
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

    }
  });
}

function move(type, index, diceNumber = 0) {
  let marginForCurrentTurn = {}
  if(!checkRange(diceNumber)) {
    if (type !== NORMAL) {
      if(index === RUN_ONCE) {
        marginForCurrentTurn = run(1)
      } else {
        marginForCurrentTurn = {
          marginLeft: tos[index][0],
          marginTop: tos[index][1]
        }
      }
    } else {
      marginForCurrentTurn = run(diceNumber);
    }
  } else {
    //dice number is greater than the remaining tile to finish line
    marginForCurrentTurn = run(0)
  }

  //update all players in the room with the new margin of the current player
  const data = {
    currentPlayer: getPlayerIndexByPlayerColor(player.playerColor),
    updatedMargins: marginForCurrentTurn,
    roomName: state.roomName
  }
  socket.emit('updateCurrentPlayerMargin', data)
}

async function rollDice() {
  return await roll(state.dice);
}

function moveDone() {
  console.log("Move done");
  socket.emit("moveDone", state.roomName);
  socket.emit("getQuestion");
}

//helper functions
function handleQuestionOptionLists(options) {
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

function initQuestionDOM(options, questionItself) {
  if (question.type == "1") {
    handleQuestionModal();
    const theSpan = document.createElement("span");
    theSpan.innerHTML = questionItself;

    questionNormal.append(theSpan);

    questionNormal.classList.toggle("hide");

    handleQuestionOptionLists(options);
    return questionNormal;
  } else if (question.type == "2") {
    handleQuestionModal();
    const img = document.createElement("img");
    img.setAttribute("src", questionItself);
    img.setAttribute("alt", "");

    questionImg.append(img);

    questionImg.classList.toggle("hide");

    handleQuestionOptionLists(options);
    return questionImg;
  } else if (question.type == "3") {
    handleQuestionModal();
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", questionItself);
    iframe.setAttribute("allow", "autoplay");

    questionVid.append(iframe);
    questionVid.classList.toggle("hide");

    handleQuestionOptionLists(options);
    return questionVid;
  }
}

function gameDone() {

}