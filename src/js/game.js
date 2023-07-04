'use strict';

const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

fetch(
  'https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple'
)
  .then(res => res.json())
  .then(loadedQuestions => {
    console.log(loadedQuestions.results);

    questions = loadedQuestions.results.map(loadedQuestion => {
      const formattedQuestion = {
        question: loadedQuestion.question,
      };

      const answerChoices = [...loadedQuestion.incorrect_answers];

      formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;

      console.log(formattedQuestion.answer);

      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.correct_answer
      );

      answerChoices.forEach((choice, index) => {
        formattedQuestion['choice' + (index + 1)] = choice;
      });

      console.log(formattedQuestion);
      return formattedQuestion;
    });

    startGame();
  })
  .catch(error => {
    // console.error('Error fetching JSON:', error);
  });

const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 3;

const incrementScore = function (num) {
  score += num;
  scoreText.innerHTML = score;
};

const startGame = function () {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
  game.classList.remove('hidden');
  loader.classList.add('hidden');
};

const getNewQuestion = function () {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    //
    localStorage.setItem('mostRecentScore', score);

    // Go to end page
    return window.location.assign('/end.html');
  }

  // Increment question
  questionCounter++;
  progressText.innerHTML = `Question ${questionCounter}/${MAX_QUESTIONS}`;

  // Update progress bar
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  //
  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerHTML = currentQuestion.question;

  //
  choices.forEach(choice => {
    const number = choice.dataset['number'];
    choice.textContent = currentQuestion['choice' + number];
  });

  availableQuestions.splice(questionIndex, 1);

  acceptingAnswers = true;
};

choices.forEach(choice => {
  choice.addEventListener('click', e => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;

    const selectedChoice = e.target;
    const selectedAnswer = parseInt(selectedChoice.dataset['number']);
    console.log(selectedChoice);

    const classToApply =
      selectedAnswer === currentQuestion.answer ? 'correct' : 'incorrect';

    if (classToApply === 'correct') {
      incrementScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);
    console.log(choice.parentElement);

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});
