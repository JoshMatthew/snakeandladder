const fourpics = require("./questions/fourpics.json");
const simple = require("./questions/simple.json");
const video = require("./questions/video.json");

module.exports = {
    getRandomQuestion
};

function getRandomQuestion() {
  return getRandomQuestionFromType(Math.floor(Math.random() * (4 - 1)) + 1)
}

function getRandomQuestionFromType(type) {
  let questions = {};
  let questionTypes = [simple, fourpics, video];

  if (type === 1) {
    questions = Object.keys(simple.questions);
  }

  if (type === 2) {
    questions = Object.keys(fourpics.questions);
  }

  if (type === 3) {
    questions = Object.keys(video.questions);
  }

  const randomQuestion = Math.floor(Math.random() * (questions.length)) + 1;

  return JSON.stringify(
    questionTypes[type - 1].questions[randomQuestion.toString()]
  );
}
