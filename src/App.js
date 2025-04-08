import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Feedback from './components/Feedback';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/today" element={<Home />} />
          <Route path="/create" element={<Home />} />
        </Routes>
        <Feedback />
      </div>
    </Router>
  );
}

export default App;
