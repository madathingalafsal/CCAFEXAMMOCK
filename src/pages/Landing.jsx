import questionsData from '../../questions.json';

const STATS = [
  { value: '120', label: 'Minutes' },
  { value: '72%', label: 'To pass' },
  { value: String(questionsData.length), label: 'Questions' },
  { value: 'MCQ', label: 'Format' },
];

const PRACTICE_FEATURES = [
  'Instant right / wrong feedback',
  'Retry wrong answers until correct',
  'Pause the timer anytime',
  'No pressure — focus on learning',
];

const EXAM_FEATURES = [
  '120-minute countdown timer',
  'No feedback until you submit',
  'Tab switch blurs & pauses exam',
  'Answer all questions to submit',
];

function FeatureList({ items, dark }) {
  return (
    <ul className="flex flex-col gap-2 flex-1">
      {items.map(f => (
        <li key={f} className={`text-sm flex gap-2 ${dark ? 'text-white/80' : 'text-body'}`}>
          <span className="text-primary font-bold shrink-0">✓</span>
          {f}
        </li>
      ))}
    </ul>
  );
}

export default function Landing({ onPractice, onExam }) {
  return (
    <div className="min-h-screen flex flex-col items-center pt-10 px-4 pb-16">
      <div className="w-full max-w-3xl">

        {/* Hero */}
        <div className="flex items-center gap-5 mb-10">
          <img src={import.meta.env.BASE_URL + 'image.png'} alt="logo" className="w-16 h-16 object-contain" />
          <div>
            <p className="text-xs tracking-widest uppercase text-muted font-semibold mb-0.5">CCAF Practice</p>
            <h1 className="text-4xl font-serif font-normal leading-tight tracking-tight m-0">Claude Certified Architect — Foundations</h1>
          </div>
        </div>

        {/* About the exam */}
        <section className="bg-card border border-hairline rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 m-0">About the CCAF Exam</h2>
          <div className="grid grid-cols-4 gap-3">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-white border border-hairline rounded-xl p-4 text-center">
                <span className="block text-3xl font-black text-primary leading-none mb-1">{value}</span>
                <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mode cards */}
        <section>
          <h2 className="text-lg font-bold mb-4">Choose your mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Practice card */}
            <div className="bg-card border border-hairline rounded-2xl p-6 flex flex-col gap-5">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary mb-3">Practice</span>
                <h3 className="text-xl font-bold mb-1.5 m-0">Practice Mode</h3>
                <p className="text-sm text-muted leading-relaxed m-0">Learn as you go with instant feedback on every answer.</p>
              </div>
              <FeatureList items={PRACTICE_FEATURES} />
              <button
                type="button"
                onClick={onPractice}
                className="w-full py-3.5 bg-ink text-white rounded-xl font-bold cursor-pointer hover:-translate-y-0.5 transition-transform"
              >
                Start Practice
              </button>
            </div>

            {/* Exam card */}
            <div className="bg-ink border border-ink rounded-2xl p-6 flex flex-col gap-5">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-white mb-3">Exam</span>
                <h3 className="text-xl font-bold text-white mb-1.5 m-0">Exam Mode</h3>
                <p className="text-sm text-white/60 leading-relaxed m-0">Simulate real conditions. No hints. No pausing.</p>
              </div>
              <FeatureList items={EXAM_FEATURES} dark />
              <button
                type="button"
                onClick={onExam}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold cursor-pointer hover:-translate-y-0.5 transition-transform"
              >
                Start Exam
              </button>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
