// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FileSpreadsheet, Home, TestTube2 } from 'lucide-react';
import ExcelParser from './pages/ExcelParser';
import TestPage from './pages/TestPage';
import HomePage from './pages/HomePage';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <FileSpreadsheet className="nav-logo" />
          <span className="nav-title">Excel Parser App</span>
        </div>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <Home size={18} />
            Головна
          </Link>
          <Link 
            to="/parser" 
            className={`nav-link ${isActive('/parser') ? 'active' : ''}`}
          >
            <FileSpreadsheet size={18} />
            Excel Parser
          </Link>
          <Link 
            to="/test" 
            className={`nav-link ${isActive('/test') ? 'active' : ''}`}
          >
            <TestTube2 size={18} />
            Тестова сторінка
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/parser" element={<ExcelParser />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </div>
    </Router>
  );
}