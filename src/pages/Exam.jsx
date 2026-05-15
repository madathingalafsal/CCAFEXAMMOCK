import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import questionsData from '../../questions.json';
import { EXAM_DURATION, formatTime } from '../utils';

const LOGO = import.meta.env.BASE_URL + 'image.png';
const STORAGE_KEY = 'ccaf_exam_session';

function initSelections() {
  return questionsData.map(() => null);
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(data) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function clearSession() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}

export default function Exam({ onHome }) {
  const saved = loadSession();

  const [index, setIndex] = useState(saved?.index ?? 0);
  const [selections, setSelections] = useState(saved?.selections ?? initSelections());
  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft ?? EXAM_DURATION);
  const [running, setRunning] = useState(true);
  const [blurred, setBlurred] = useState(saved ? true : false);
  const [summary, setSummary] = useState(saved?.summary ?? false);

  // Countdown timer
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !summary) {
      clearSession();
      setRunning(false);
      setSummary(true);
    }
  }, [timeLeft, summary]);

  // Persist session on every state change
  useEffect(() => {
    if (!summary) saveSession({ index, selections, timeLeft, summary });
  }, [index, selections, timeLeft, summary]);

  // Blur + pause on tab switch
  useEffect(() => {
    if (summary) return;
    function onVisibility() {
      if (document.hidden) { setRunning(false); setBlurred(true); }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [summary]);

  const question = questionsData[index];
  const selected = selections[index];
  const answeredCount = selections.filter(s => s !== null).length;
  const unanswered = questionsData.length - answeredCount;
  const allAnswered = unanswered === 0;
  const isUrgent = timeLeft <= 600;
  const elapsedTime = EXAM_DURATION - timeLeft;

  const correct = selections.filter((sel, i) => sel === questionsData[i].options.find(o => o.correct)?.letter).length;
  const scorePercent = Math.round((correct / questionsData.length) * 100);
  const didPass = scorePercent >= 72;

  function selectOption(letter) {
    setSelections(cur => { const next = [...cur]; next[index] = letter; return next; });
  }

  function restart() {
    clearSession();
    setIndex(0); setSelections(initSelections()); setTimeLeft(EXAM_DURATION);
    setRunning(true); setBlurred(false); setSummary(false);
  }

  function abandon() {
    clearSession();
    setRunning(false);
    onHome();
  }

  return (
    <>
    {blurred && !summary && createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
        <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
          <div className="text-5xl mb-4">⚠</div>
          <h2 className="text-2xl font-serif font-normal m-0 mb-3">Tab Switch Detected</h2>
          <p className="text-sm text-muted leading-relaxed m-0 mb-6">
            Your timer has been paused. Stay on this tab during the exam.
          </p>
          <button type="button"
            onClick={() => { setBlurred(false); setRunning(true); }}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold cursor-pointer hover:-translate-y-0.5 transition-transform">
            Resume Exam
          </button>
        </div>
      </div>,
      document.body
    )}
    <div className={`max-w-5xl mx-auto ${blurred && !summary ? 'blur-md pointer-events-none select-none' : ''}`}>

      {/* Header */}
      <header className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-4">
          <img src={LOGO} alt="logo" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-xs tracking-widest uppercase text-muted font-semibold m-0">CCAF Exam</p>
            <h1 className="text-2xl font-serif font-normal leading-tight m-0">Exam Mode</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-card border border-hairline rounded-xl px-3 py-2 text-sm font-medium">
            {answeredCount} / {questionsData.length} answered
          </div>
          <div className={`border rounded-xl px-4 py-2 text-sm font-bold tabular-nums
            ${isUrgent ? 'bg-red-50 border-red-300 text-red-800' : 'bg-card border-hairline'}`}>
            ⏱ {formatTime(timeLeft)} remaining
          </div>
        </div>
      </header>

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-6">

        {/* Question panel */}
        <section className="bg-card border border-hairline rounded-2xl p-5 flex flex-col gap-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-ink/8 text-ink text-xs font-bold uppercase tracking-wider w-fit">
            Question {index + 1}
          </span>

          <div className="bg-white border border-hairline rounded-2xl p-5">
            <p className="text-base leading-relaxed m-0">{question.text}</p>
          </div>

          <div className="flex flex-col gap-3">
            {question.options.map(option => (
              <button
                key={option.letter}
                type="button"
                onClick={() => selectOption(option.letter)}
                className={`flex w-full text-left p-4 border rounded-2xl text-sm leading-relaxed items-start cursor-pointer transition-colors
                  ${selected === option.letter
                    ? 'bg-primary/10 border-primary font-medium'
                    : 'bg-white/95 border-hairline hover:border-primary-dark'}`}
              >
                <span className={`inline-flex items-center justify-center w-8 h-8 min-w-8 rounded-full border font-bold mr-4 text-xs
                  ${selected === option.letter ? 'bg-primary text-white border-primary' : 'bg-card border-hairline'}`}>
                  {option.letter}
                </span>
                <span>{option.text}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {index > 0 && (
              <button type="button" onClick={() => setIndex(v => v - 1)}
                className="px-5 py-3 bg-white border border-hairline rounded-xl font-semibold cursor-pointer hover:-translate-y-0.5 transition-transform">
                ← Prev
              </button>
            )}
            <button type="button" disabled={index === questionsData.length - 1} onClick={() => setIndex(v => Math.min(questionsData.length - 1, v + 1))}
              className="px-5 py-3 bg-ink text-white rounded-xl font-semibold cursor-pointer hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0">
              Next →
            </button>
          </div>

          <div className="min-h-12 px-4 py-3 rounded-2xl border border-hairline bg-white/60 text-muted text-sm italic">
            {selected ? 'Answer recorded. You can change it anytime before submitting.' : 'Select an answer to continue.'}
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
              <button key={i} type="button" onClick={() => setIndex(i)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold cursor-pointer transition-colors
                  ${selections[i] !== null ? 'bg-ink border-ink text-white' : 'bg-white border-hairline hover:border-primary-dark'}
                  ${i === index ? 'ring-2 ring-primary/30' : ''}`}>
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-ink inline-block"></span> answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-white border border-hairline inline-block"></span> unanswered
            </span>
          </div>

          {!allAnswered && (
            <p className="text-xs text-muted text-center m-0">{unanswered} question{unanswered !== 1 ? 's' : ''} remaining</p>
          )}

          <button type="button" disabled={!allAnswered} onClick={() => { setRunning(false); setSummary(true); }}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold cursor-pointer hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0">
            {allAnswered ? 'Finish & score' : `${unanswered} unanswered`}
          </button>

          <button type="button" onClick={abandon}
            className="w-full py-3 bg-white border border-hairline rounded-xl font-semibold cursor-pointer hover:bg-card transition-colors">
            Abandon exam
          </button>
        </aside>
      </div>

      {/* Summary modal */}
      {summary && (
        <div className="fixed inset-0 flex items-center justify-center p-5 bg-black/45 z-10">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl">
            <p className="inline-flex px-3 py-1.5 rounded-full bg-ink/8 text-ink text-xs font-bold uppercase tracking-wider mb-2">Exam complete</p>
            <h2 className="text-2xl font-serif font-normal m-0 mb-2">Score report</h2>
            <p className={`text-sm font-semibold tracking-wide mb-6 ${didPass ? 'text-green-700' : 'text-red-800'}`}>
              {didPass ? 'Passed' : 'Below passing'} · {scorePercent}% score · Passing threshold 72%
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { value: correct, label: 'Correct' },
                { value: questionsData.length - correct, label: 'Incorrect' },
                { value: `${scorePercent}%`, label: 'Score' },
                { value: formatTime(elapsedTime), label: 'Time used' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-card rounded-2xl p-4 text-center">
                  <span className="block text-3xl font-bold mb-1">{value}</span>
                  <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-body leading-relaxed mb-6">
              You answered <strong>{correct}</strong> of <strong>{questionsData.length}</strong> correctly.
              {didPass ? ' Great work — you passed the 72% threshold.' : ' Keep studying and try again.'}
            </p>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={abandon}
                className="py-3 bg-white border border-hairline rounded-xl font-semibold cursor-pointer hover:bg-card transition-colors">
                Back to home
              </button>
              <button type="button" onClick={restart}
                className="py-3 bg-primary text-white rounded-xl font-bold cursor-pointer hover:-translate-y-0.5 transition-transform">
                Retry exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
