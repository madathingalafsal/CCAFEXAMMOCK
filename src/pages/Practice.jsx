import { useEffect, useState } from 'react';
import questionsData from '../../questions.json';
import { ClipboardIcon, PauseIcon, PlayIcon } from '../components/Icons';
import { formatTime } from '../utils';

const LOGO = import.meta.env.BASE_URL + 'image.png';

function initState() {
  return questionsData.map(() => ({ correct: false, attempts: 0, wrongLetters: [] }));
}

export default function Practice({ onHome }) {
  const [index, setIndex] = useState(0);
  const [state, setState] = useState(initState);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [summary, setSummary] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!copyStatus) return;
    const id = setTimeout(() => setCopyStatus(''), 2000);
    return () => clearTimeout(id);
  }, [copyStatus]);

  const question = questionsData[index];
  const current = state[index];
  const answered = state.filter(s => s.correct).length;
  const attempted = state.filter(s => s.correct || s.wrongLetters.length > 0).length;
  const scorePercent = Math.round((answered / questionsData.length) * 100);
  const didPass = scorePercent >= 72;

  function ensureStarted() {
    if (!started) { setStarted(true); setRunning(true); }
  }

  function handleOption(option) {
    if (current.correct) return;
    ensureStarted();
    setState(cur => {
      const next = [...cur];
      const entry = { ...next[index] };
      entry.attempts += 1;
      if (option.correct) entry.correct = true;
      else if (!entry.wrongLetters.includes(option.letter))
        entry.wrongLetters = [...entry.wrongLetters, option.letter];
      next[index] = entry;
      return next;
    });
  }

  function reset() {
    setIndex(0); setState(initState()); setElapsed(0);
    setRunning(false); setStarted(false); setSummary(false); setCopyStatus('');
  }

  function handleCopy() {
    if (!navigator.clipboard) { setCopyStatus('Not supported'); return; }
    navigator.clipboard.writeText(question.text)
      .then(() => setCopyStatus('Copied'))
      .catch(() => setCopyStatus('Failed'));
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-4">
          <img src={LOGO} alt="logo" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-xs tracking-widest uppercase text-muted font-semibold m-0">CCAF Practice</p>
            <h1 className="text-2xl font-serif font-normal leading-tight m-0">Mock Test Drill</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-card border border-hairline rounded-xl px-3 py-2 text-sm font-medium">
            {answered} / {questionsData.length} answered
          </div>

          <div className="bg-card border border-hairline rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-2">
            <span>Time: {formatTime(elapsed)}</span>
            {!started ? (
              <button
                type="button"
                onClick={() => { setStarted(true); setRunning(true); }}
                className="flex items-center gap-1 px-2.5 py-1 bg-primary text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                <PlayIcon /> Start
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRunning(r => !r)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-hairline rounded-lg text-xs font-bold cursor-pointer hover:border-primary transition-colors"
              >
                {running ? <PauseIcon /> : <PlayIcon />}
                {running ? 'Pause' : 'Resume'}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => { reset(); onHome(); }}
            className="px-3 py-2 text-sm font-semibold border border-hairline bg-white rounded-xl cursor-pointer hover:bg-card transition-colors"
          >
            ← Home
          </button>
        </div>
      </header>

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-6">

        {/* Question panel */}
        <section className="bg-card border border-hairline rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-wider">
              Question {index + 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-hairline rounded-xl text-sm font-semibold cursor-pointer hover:border-primary-dark transition-colors"
              >
                <ClipboardIcon /> Copy question
              </button>
              {copyStatus && <span className="text-muted text-xs">{copyStatus}</span>}
            </div>
          </div>

          <div className="bg-white border border-hairline rounded-2xl p-5">
            <p className="text-base leading-relaxed m-0">{question.text}</p>
          </div>

          <div className="flex flex-col gap-3">
            {question.options.map(option => {
              const isWrong = !current.correct && current.wrongLetters.includes(option.letter);
              const isCorrect = current.correct && option.correct;
              return (
                <button
                  key={option.letter}
                  type="button"
                  disabled={current.correct || isWrong}
                  onClick={() => handleOption(option)}
                  className={`flex w-full text-left p-4 border rounded-2xl text-sm leading-relaxed items-start transition-colors cursor-pointer
                    ${isWrong ? 'bg-red-50 border-red-300 opacity-70 cursor-not-allowed' : ''}
                    ${isCorrect ? 'bg-green-50 border-green-400' : ''}
                    ${!isWrong && !isCorrect ? 'bg-white/95 border-hairline hover:border-primary-dark' : ''}
                    ${current.correct && !option.correct ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 min-w-8 rounded-full bg-card border border-hairline font-bold mr-4 text-xs">
                    {option.letter}
                  </span>
                  <span>{option.text}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            {index > 0 && (
              <button
                type="button"
                onClick={() => { ensureStarted(); setIndex(v => v - 1); }}
                className="px-5 py-3 bg-white border border-hairline rounded-xl font-semibold cursor-pointer hover:-translate-y-0.5 transition-transform"
              >
                ← Prev
              </button>
            )}
            <button
              type="button"
              disabled={index === questionsData.length - 1}
              onClick={() => { ensureStarted(); setIndex(v => Math.min(questionsData.length - 1, v + 1)); }}
              className="px-5 py-3 bg-ink text-white rounded-xl font-semibold cursor-pointer hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              Next →
            </button>
          </div>

          <div className={`min-h-12 px-4 py-3 rounded-2xl border text-sm leading-relaxed transition-colors
            ${current.correct ? 'bg-green-50 border-green-300 text-green-900' : ''}
            ${!current.correct && current.wrongLetters.length ? 'bg-orange-50 border-orange-300 text-orange-900' : ''}
            ${!current.correct && !current.wrongLetters.length ? 'bg-white/75 border-transparent text-muted' : ''}`}
          >
            {current.correct
              ? `Correct. ${question.options.find(o => o.correct).explain}`
              : current.wrongLetters.length
              ? 'That answer is not correct. Try again.'
              : ''}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="bg-card border border-hairline rounded-2xl p-5 flex flex-col gap-4 h-fit">
          <div>
            <h2 className="text-base font-bold m-0 mb-1">Question Palette</h2>
            <p className="text-xs text-muted m-0">Tap any dot to jump to that question.</p>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {questionsData.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { ensureStarted(); setIndex(i); }}
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold cursor-pointer transition-colors
                  ${state[i].correct ? 'bg-primary border-primary text-white' : ''}
                  ${!state[i].correct && state[i].wrongLetters.length ? 'bg-primary/20 border-primary/60' : ''}
                  ${!state[i].correct && !state[i].wrongLetters.length ? 'bg-white border-hairline hover:border-primary-dark' : ''}
                  ${i === index ? 'ring-2 ring-primary/30' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary inline-block"></span> answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-white border border-hairline inline-block"></span> unanswered
            </span>
          </div>

          <button
            type="button"
            onClick={() => { setRunning(false); setSummary(true); }}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold cursor-pointer hover:-translate-y-0.5 transition-transform"
          >
            Finish &amp; score
          </button>

          {!started ? (
            <button
              type="button"
              onClick={() => { setStarted(true); setRunning(true); }}
              className="w-full py-3 bg-ink text-white rounded-xl font-semibold cursor-pointer hover:-translate-y-0.5 transition-transform"
            >
              Start Test
            </button>
          ) : (
            <button
              type="button"
              onClick={reset}
              className="w-full py-3 bg-white border border-hairline rounded-xl font-semibold cursor-pointer hover:bg-card transition-colors"
            >
              Reset test
            </button>
          )}
        </aside>
      </div>

      {/* Summary modal */}
      {summary && (
        <div className="fixed inset-0 flex items-center justify-center p-5 bg-black/45 z-10">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl">
            <p className="inline-flex px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-wider mb-2">Review complete</p>
            <h2 className="text-2xl font-serif font-normal m-0 mb-2">Score report</h2>
            <p className={`text-sm font-semibold tracking-wide mb-6 ${didPass ? 'text-green-700' : 'text-red-800'}`}>
              {didPass ? 'Passed' : 'Below passing'} · {scorePercent}% score · Passing threshold 72%
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { value: answered, label: 'Correct' },
                { value: attempted - answered, label: 'Wrong attempts' },
                { value: attempted, label: 'Attempted' },
                { value: formatTime(elapsed), label: 'Elapsed' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-card rounded-2xl p-4 text-center">
                  <span className="block text-3xl font-bold mb-1">{value}</span>
                  <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-body leading-relaxed mb-6">
              You answered <strong>{answered}</strong> of <strong>{questionsData.length}</strong> correctly ({scorePercent}%).
              {didPass ? ' Nice work — you passed the 72% threshold.' : ' Keep practicing until you reach 72%.'}
            </p>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => setSummary(false)} className="py-3 bg-white border border-hairline rounded-xl font-semibold cursor-pointer hover:bg-card transition-colors">
                Continue practice
              </button>
              <button type="button" onClick={reset} className="py-3 bg-primary text-white rounded-xl font-bold cursor-pointer hover:-translate-y-0.5 transition-transform">
                Retry test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
