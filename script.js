let quizData = {};
let currentQuestionIndex = 0;
let score = 0;
let timer;
const timeLimit = 30;
let timeRemaining = timeLimit;
let selectedCategory = 'science';
let selectedDifficulty = 'easy';
let userAnswers = [];
let incorrectAnswers = [];

// DOM Elements
const quizContainer = document.getElementById('quiz');
const nextBtn = document.getElementById('next-btn');
const scoreContainer = document.getElementById('score');
const progressBar = document.getElementById('progress-bar');
const timerContainer = document.getElementById('timer');
const categorySelect = document.getElementById('category-select');
const difficultySelect = document.getElementById('difficulty-select');

// Fetch quiz data and initialize quiz
fetch('quizzData.json')
  .then(response => response.json())
  .then(data => {
    quizData = data;
    initializeQuiz();
  })
  .catch(error => console.error('Error loading quiz data:', error));

// Event listener for next button
nextBtn.addEventListener('click', nextQuestion);

// Shuffle questions and limit to 10
function shuffleQuestions() {
  const questions = quizData[selectedCategory][selectedDifficulty];
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions.slice(0, 10);
}

// Update progress bar
function updateProgressBar() {
  const progress = ((currentQuestionIndex + 1) / quizData[selectedCategory][selectedDifficulty].length) * 100;
  progressBar.style.width = `${progress}%`;
}

// Start timer for each question
function startTimer() {
  timeRemaining = timeLimit;
  timerContainer.innerText = `Time: ${timeRemaining}s`;
  clearInterval(timer);

  timer = setInterval(() => {
    timeRemaining--;
    timerContainer.innerText = `Time: ${timeRemaining}s`;

    if (timeRemaining <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

// Stop the timer when an answer is selected
function stopTimer() {
  clearInterval(timer);
}

// Handle answer selection
function selectAnswer(selectedOption) {
  stopTimer();
  const currentQuestion = quizData[selectedCategory][selectedDifficulty][currentQuestionIndex];
  const buttons = document.querySelectorAll('.option-btn');

  buttons.forEach(button => {
    button.disabled = true;
    if (button.innerText === currentQuestion.answer) {
      button.classList.add('correct');
    } else if (button.innerText === selectedOption) {
      button.classList.add('incorrect');
    }
  });

  if (selectedOption === currentQuestion.answer) {
    score++;
    scoreContainer.innerText = `Score: ${score}`;
  } else {
    incorrectAnswers.push(currentQuestion);
  }

  nextBtn.disabled = false;
}

// Load the current question
function loadQuestion() {
  const currentQuestion = quizData[selectedCategory][selectedDifficulty][currentQuestionIndex];

  if (!currentQuestion) {
    showResults();
    return;
  }

  quizContainer.innerHTML = `
    <h2>${currentQuestion.question}</h2>
    <div class="options">
      ${currentQuestion.options.map(option =>
        `<button class="option-btn" onclick="selectAnswer('${option}')">${option}</button>`
      ).join('')}
    </div>
  `;

  updateProgressBar();
  startTimer();
  nextBtn.disabled = true;
}

// Move to the next question
function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < quizData[selectedCategory][selectedDifficulty].length) {
    loadQuestion();
  } else {
    showResults();
  }
}

// Show results and restart options
function showResults() {
  saveHighScore(score);
  quizContainer.innerHTML = `
    <h2>Your Score: ${score}/${quizData[selectedCategory][selectedDifficulty].length}</h2>
    <button onclick="restartQuiz()">Restart Quiz</button>
    <button onclick="showIncorrectAnswers()">Review Incorrect Answers</button>
  `;
  stopTimer();
}

// Display incorrect answers
function showIncorrectAnswers() {
  const reviewHtml = incorrectAnswers.map((question) => `
    <p>${question.question} - Correct Answer: ${question.answer}</p>
  `).join('');

  quizContainer.innerHTML = `
    <h2>Incorrect Answers</h2>
    ${reviewHtml}
    <button onclick="restartQuiz()">Restart Quiz</button>
  `;
}

// Restart the quiz
function restartQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  userAnswers = [];
  incorrectAnswers = [];
  loadQuestion();
  scoreContainer.innerText = `Score: 0`;
  nextBtn.disabled = true;
  progressBar.style.width = '0%';
  displayHighScores();
}

// Save high scores to localStorage
function saveHighScore(newScore) {
  let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScores.push(newScore);
  highScores.sort((a, b) => b - a);
  highScores = highScores.slice(0, 5);
  localStorage.setItem('highScores', JSON.stringify(highScores));
  displayHighScores();
}

// Display high scores
function displayHighScores() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const highScoresContainer = document.getElementById('high-scores');
  highScoresContainer.innerHTML = `
    <h2>High Scores</h2>
    <ul>
      ${highScores.map(score => `<li>${score}</li>`).join('')}
    </ul>
  `;
}

// Initialize the quiz based on selected category and difficulty
function initializeQuiz() {
  selectedCategory = categorySelect.value;
  selectedDifficulty = difficultySelect.value;
  currentQuestionIndex = 0;
  score = 0;
  incorrectAnswers = [];
  quizData[selectedCategory][selectedDifficulty] = shuffleQuestions();
  loadQuestion();
}

// Event listeners for category and difficulty changes
categorySelect.addEventListener('change', initializeQuiz);
difficultySelect.addEventListener('change', initializeQuiz);

// Display high scores on page load
displayHighScores();
