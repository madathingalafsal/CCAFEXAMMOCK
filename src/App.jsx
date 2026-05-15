import { useState } from 'react';
import Landing from './pages/Landing';
import Practice from './pages/Practice';
import Exam from './pages/Exam';

export default function App() {
  const [screen, setScreen] = useState('landing');

  if (screen === 'practice') return <Practice onHome={() => setScreen('landing')} />;
  if (screen === 'exam') return <Exam onHome={() => setScreen('landing')} />;
  return <Landing onPractice={() => setScreen('practice')} onExam={() => setScreen('exam')} />;
}
