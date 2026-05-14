const questionText = document.getElementById('questionText');
const optionsList = document.getElementById('optionsList');
const questionNumber = document.getElementById('questionNumber');
const answeredCountLabel = document.getElementById('answeredCount');
const totalCountLabel = document.getElementById('totalCount');
const progressGrid = document.getElementById('progressGrid');
const feedbackArea = document.getElementById('feedbackArea');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const finishButton = document.getElementById('finishButton');

let questions = [];
let currentIndex = 0;
let state = [];

function fetchQuestions() {
  return fetch('questions.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to load questions.json');
      }
      return response.json();
    });
}

function initialize(questionData) {
  questions = questionData;
  state = questions.map(() => ({ correct: false, attempts: 0, wrongLetters: [] }));
  totalCountLabel.textContent = questions.length;
  renderQuestion();
  renderProgress();
  updateNavigation();
}

function renderQuestion() {
  const question = questions[currentIndex];
  const questionState = state[currentIndex];

  questionNumber.textContent = currentIndex + 1;
  questionText.textContent = question.text;
  feedbackArea.className = 'feedback-area';
  feedbackArea.textContent = questionState.correct
    ? `Correct! ${question.options.find((option) => option.correct).explain}`
    : 'Choose the answer you think is right. If it is wrong, keep trying until you find it.';

  optionsList.innerHTML = '';

  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-button';
    button.dataset.state = option.correct ? 'default' : 'default';
    button.disabled = questionState.correct || questionState.wrongLetters.includes(option.letter);

    if (questionState.correct && option.correct) {
      button.dataset.state = 'correct';
    }
    if (!questionState.correct && questionState.wrongLetters.includes(option.letter)) {
      button.dataset.state = 'wrong';
    }

    button.innerHTML = `
      <span class="option-header">${option.letter}</span>
      <span class="option-text">${option.text}</span>
    `;

    button.addEventListener('click', () => handleOptionClick(index));
    optionsList.appendChild(button);
  });
}

function handleOptionClick(optionIndex) {
  const question = questions[currentIndex];
  const option = question.options[optionIndex];
  const currentState = state[currentIndex];

  if (currentState.correct) {
    return;
  }

  if (option.correct) {
    currentState.correct = true;
    currentState.attempts += 1;
    feedbackArea.classList.add('success');
    feedbackArea.textContent = `Correct. ${option.explain}`;
  } else {
    currentState.wrongLetters.push(option.letter);
    currentState.attempts += 1;
    feedbackArea.classList.add('warning');
    feedbackArea.textContent = `That answer is not correct. Try again.`;
  }

  renderQuestion();
  renderProgress();
  updateNavigation();
}

function renderProgress() {
  const answeredCount = state.filter((item) => item.correct).length;
  answeredCountLabel.textContent = String(answeredCount).padStart(1, '0');

  progressGrid.innerHTML = '';
  questions.forEach((question, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'progress-dot';
    dot.textContent = index + 1;
    dot.setAttribute('aria-label', `Question ${index + 1}`);

    if (state[index].correct) {
      dot.classList.add('completed');
    }
    if (index === currentIndex) {
      dot.classList.add('current');
    }

    dot.addEventListener('click', () => {
      currentIndex = index;
      renderQuestion();
      renderProgress();
      updateNavigation();
    });
    progressGrid.appendChild(dot);
  });
}

function updateNavigation() {
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === questions.length - 1;
}

prevButton.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
    renderProgress();
    updateNavigation();
  }
});

nextButton.addEventListener('click', () => {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    renderProgress();
    updateNavigation();
  }
});

finishButton.addEventListener('click', () => {
  const answeredCount = state.filter((item) => item.correct).length;
  const total = questions.length;
  const message = `You found ${answeredCount} correct answer${answeredCount === 1 ? '' : 's'} out of ${total}. Continue practicing to improve your score.`;
  feedbackArea.className = 'feedback-area success';
  feedbackArea.textContent = message;
});

fetchQuestions().then(initialize).catch((error) => {
  questionText.textContent = 'Unable to load the practice questions.';
  feedbackArea.textContent = error.message;
});
