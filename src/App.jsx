import { useState } from 'react';
import Landing from './pages/Landing';
import Practice from './pages/Practice';
import Exam from './pages/Exam';

const hasExamSession = () => !!localStorage.getItem('ccaf_exam_session');

export default function App() {
  const [screen, setScreen] = useState(hasExamSession() ? 'exam' : 'landing');

  if (screen === 'practice') return <Practice onHome={() => setScreen('landing')} />;
  if (screen === 'exam') return <Exam onHome={() => setScreen('landing')} />;
  return <Landing onPractice={() => setScreen('practice')} onExam={() => setScreen('exam')} />;
}
