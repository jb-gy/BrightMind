import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrightMindLanding from './components/landing/BrightMindLanding';
import Reader from './components/Reader';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BrightMindLanding />} />
        <Route path="/reader" element={<Reader />} />
      </Routes>
    </Router>
  );
}

export default App;