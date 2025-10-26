// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { FileSpreadsheet, Home, TestTube2, FolderOpen, LogOut, User } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ExcelParser from './pages/ExcelParser';
import TestPage from './pages/TestPage';
import HomePage from './pages/HomePage';
import FilesListPage from './pages/FilesListPage';
import LoginPage from './pages/LoginPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/UsersPage'; // <-- 1. ІМПОРТ НОВОЇ СТОРІНКИ

function Navigation() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      {currentUser && (
        <>
          <div className="nav-container">
            <div className="nav-brand">
              <FileSpreadsheet className="nav-logo" />
              <span className="nav-title">Gurman App</span>
            </div>
            <div className="nav-links">
              {/* <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                <Home size={18} />
                Головна
              </Link> */}
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                <FileSpreadsheet size={18} />
                Аналітика
              </Link>
              <Link
                to="/parser"
                className={`nav-link ${isActive('/parser') ? 'active' : ''}`}
              >
                <FileSpreadsheet size={18} />
                Excel Parser
              </Link>
              <Link
                to="/files"
                className={`nav-link ${isActive('/files') ? 'active' : ''}`}
              >
                <FolderOpen size={18} />
                Мої файли
              </Link>
              
              {/* 2. ДОДАНО ЛІНК НА НОВУ СТОРІНКУ */}
              <Link
                to="/users"
                className={`nav-link ${isActive('/users') ? 'active' : ''}`}
              >
                <User size={18} />
                TG Користувачі
              </Link>

              {/* <Link
                to="/test"
                className={`nav-link ${isActive('/test') ? 'active' : ''}`}
              >
                <TestTube2 size={18} />
                Тестова сторінка
              </Link> */}
              <div className="nav-user">
                <User size={16} />
                <span>{currentUser.email}</span>
              </div>
              <button onClick={handleLogout} className="nav-logout">
                <LogOut size={18} />
                Вийти
              </button>
            </div>
          </div>
        </>
      )}
    </nav >
  );
}

function AppRoutes() {
  return (
    <div className="app">
      <Navigation />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/parser"
          element={
            <PrivateRoute>
              <ExcelParser />
            </PrivateRoute>
          }
        />
        <Route
          path="/files"
          element={
            <PrivateRoute>
              <FilesListPage />
            </PrivateRoute>
          }
        />

        {/* 3. ДОДАНО РОУТ ДЛЯ НОВОЇ СТОРІНКИ */}
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/test"
          element={
            <PrivateRoute>
              <TestPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}