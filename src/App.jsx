import { useEffect, useMemo, useState } from 'react';
import questionsData from '../questions.json';

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
    <path d="M8 2h8a2 2 0 0 1 2 2v2H6V4a2 2 0 0 1 2-2Z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState(
    questionsData.map(() => ({ correct: false, attempts: 0, wrongLetters: [] }))
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (!copyStatus) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopyStatus(''), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const [showSummary, setShowSummary] = useState(false);
  const currentQuestion = questionsData[currentIndex];
  const currentState = state[currentIndex];
  const answeredCount = state.filter((item) => item.correct).length;
  const attemptedCount = state.filter((item) => item.correct || item.wrongLetters.length > 0).length;
  const wrongCount = attemptedCount - answeredCount;
  const passingPercentage = 0.72;
  const passingScore = Math.round(passingPercentage * 100);
  const scorePercent = Math.round((answeredCount / questionsData.length) * 100);
  const didPass = scorePercent >= passingScore;

  const progressItems = useMemo(
    () =>
      questionsData.map((question, index) => ({
        index,
        completed: state[index].correct,
        wrong: !state[index].correct && state[index].wrongLetters.length > 0,
        current: index === currentIndex,
      })),
    [currentIndex, state]
  );

  function startTest() {
    setHasStarted(true);
    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resumeTimer() {
    setIsRunning(true);
  }

  function ensureStarted() {
    if (!hasStarted) {
      startTest();
    }
  }

  function handleOptionClick(option) {
    if (currentState.correct) return;
    ensureStarted();

    setState((current) => {
      const next = [...current];
      const entry = { ...next[currentIndex] };
      entry.attempts += 1;

      if (option.correct) {
        entry.correct = true;
      } else if (!entry.wrongLetters.includes(option.letter)) {
        entry.wrongLetters = [...entry.wrongLetters, option.letter];
      }

      next[currentIndex] = entry;
      return next;
    });
  }

  function goTo(index) {
    ensureStarted();
    setCurrentIndex(index);
  }

  function goPrev() {
    ensureStarted();
    setCurrentIndex((value) => Math.max(0, value - 1));
  }

  function goNext() {
    ensureStarted();
    setCurrentIndex((value) => Math.min(questionsData.length - 1, value + 1));
  }

  function resetQuiz() {
    setCurrentIndex(0);
    setState(questionsData.map(() => ({ correct: false, attempts: 0, wrongLetters: [] })));
    setElapsedSeconds(0);
    setShowSummary(false);
    setHasStarted(false);
    setIsRunning(false);
    setCopyStatus('');
  }

  function finishScore() {
    setShowSummary(true);
    setIsRunning(false);
  }

  function handleCopyQuestion() {
    const text = currentQuestion.text;
    if (!navigator.clipboard) {
      setCopyStatus('Copy not supported');
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => setCopyStatus('Question copied'))
      .catch(() => setCopyStatus('Copy failed'));
  }

  function closeSummary() {
    setShowSummary(false);
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return (
    <div className="app-shell">
      <header className="page-header">
        <div className="brand">
          <img src="/image.png" alt="logo" className="brand-mark" />
          <div>
            <p className="brand-label">CCAF Practice</p>
            <h1>Mock Test Drill</h1>
          </div>
        </div>

        <div className="status-pill">
          <span>{answeredCount}</span> / <span>{questionsData.length}</span> answered
        </div>
        <div className="status-pill timer-pill">
          <span>Time: {formatTime(elapsedSeconds)}</span>
          {!hasStarted ? (
            <button className="timer-control timer-start" type="button" onClick={startTest} aria-label="Start timer">
              <PlayIcon /> Start
            </button>
          ) : (
            <button className="timer-control" type="button" onClick={isRunning ? pauseTimer : resumeTimer} aria-label={isRunning ? 'Pause timer' : 'Resume timer'}>
              {isRunning ? <PauseIcon /> : <PlayIcon />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
          )}
        </div>
      </header>
      <main className="page-grid">
        <section className="question-panel card">
          <div className="question-header">
            <div>
              <span className="question-badge">QUESTION {currentIndex + 1}</span>
            </div>
            <div className="question-actions">
              <button className="copy-button" type="button" onClick={handleCopyQuestion}>
                <ClipboardIcon />
                Copy question
              </button>
              {copyStatus && <span className="copy-status">{copyStatus}</span>}
            </div>
          </div>

          <article className="question-card">
            <p className="question-text">{currentQuestion.text}</p>
          </article>

          <div className="options-list">
            {currentQuestion.options.map((option) => {
              const isWrong = !currentState.correct && currentState.wrongLetters.includes(option.letter);
              const isCorrect = currentState.correct && option.correct;
              return (
                <button
                  key={option.letter}
                  type="button"
                  className={`option-button ${isWrong ? 'wrong' : ''} ${isCorrect ? 'correct' : ''}`}
                  disabled={currentState.correct || isWrong}
                  onClick={() => handleOptionClick(option)}
                >
                  <span className="option-header">{option.letter}</span>
                  <span className="option-text">{option.text}</span>
                </button>
              );
            })}
          </div>

          <div className="controls-row">
            {currentIndex > 0 && (
              <button className="nav-button" type="button" onClick={goPrev}>
                ← Prev
              </button>
            )}
            <button className="nav-button primary" type="button" onClick={goNext} disabled={currentIndex === questionsData.length - 1}>
              Next →
            </button>
          </div>

          <div className={`feedback-area ${currentState.correct ? 'success' : currentState.wrongLetters.length ? 'warning' : ''}`}>
            {currentState.correct
              ? `Correct. ${currentQuestion.options.find((item) => item.correct).explain}`
              : currentState.wrongLetters.length
              ? 'That answer is not correct. Try again.'
              : ''}
          </div>
        </section>

        <aside className="progress-panel card">
          <div className="progress-top">
            <h2>Question Palette</h2>
            <p className="progress-subtitle">Tap any dot to jump directly to that question.</p>
          </div>
          <div className="progress-grid">
            {progressItems.map((item) => (
              <button
                key={item.index}
                type="button"
                className={`progress-dot ${item.completed ? 'completed' : item.wrong ? 'wrong' : ''} ${item.current ? 'current' : ''}`}
                onClick={() => goTo(item.index)}
                aria-label={`Question ${item.index + 1}`}
              >
                {item.index + 1}
              </button>
            ))}
          </div>
          <div className="legend-row">
            <span>
              <span className="legend-dot legend-marked"></span> answered
            </span>
            <span>
              <span className="legend-dot"></span> unanswered
            </span>
          </div>
          <button className="finish-button" type="button" onClick={finishScore}>
            Finish & score
          </button>
          {!hasStarted ? (
            <button className="start-button" type="button" onClick={startTest}>
              Start Test
            </button>
          ) : (
            <button className="reset-button" type="button" onClick={resetQuiz}>
              Reset test
            </button>
          )}
        </aside>
      </main>

      {showSummary && (
        <div className="summary-overlay" role="dialog" aria-modal="true">
          <div className="summary-card">
            <div className="summary-hero">
              <p className="summary-label">Review complete</p>
              <h2>Score report</h2>
              <p className={`summary-status ${didPass ? 'summary-pass' : 'summary-fail'}`}>
                {didPass ? 'Passed' : 'Below passing'} • {scorePercent}% score • Passing threshold {passingScore}%
              </p>
            </div>
            <div className="summary-grid">
              <div className="summary-metric">
                <span className="summary-value">{answeredCount}</span>
                <span className="summary-key">Correct</span>
              </div>
              <div className="summary-metric">
                <span className="summary-value">{wrongCount}</span>
                <span className="summary-key">Wrong attempts</span>
              </div>
              <div className="summary-metric">
                <span className="summary-value">{attemptedCount}</span>
                <span className="summary-key">Attempted</span>
              </div>
              <div className="summary-metric">
                <span className="summary-value">{formatTime(elapsedSeconds)}</span>
                <span className="summary-key">Elapsed</span>
              </div>
            </div>
            <p className="summary-copy">
              You answered <strong>{answeredCount}</strong> out of <strong>{questionsData.length}</strong> questions correctly, which is <strong>{scorePercent}%</strong>.
              {didPass ? ' Nice work — you passed the 72% threshold.' : ' Keep practicing until you reach 72% to pass.'}
            </p>
            <div className="summary-actions">
              <button className="nav-button" type="button" onClick={closeSummary}>
                Continue practice
              </button>
              <button className="finish-button" type="button" onClick={resetQuiz}>
                Retry test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
