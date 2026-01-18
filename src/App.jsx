// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FileSpreadsheet, TestTube2, LogOut, User, Settings as SettingsIcon, ShoppingCart } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ExcelManager from './pages/ExcelManager';
import TestPage from './pages/TestPage';
import LoginPage from './pages/LoginPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import SalesPage from './pages/SalesPage';

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
              <span className="nav-title">Gurman</span>
            </div>
            <div className="nav-links">
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                <FileSpreadsheet size={18} />
                Аналітика
              </Link>
              <Link
                to="/sales"
                className={`nav-link ${isActive('/sales') ? 'active' : ''}`}
              >
                <ShoppingCart size={18} />
                Продажа
              </Link>
              <Link
                to="/excel"
                className={`nav-link ${isActive('/excel') ? 'active' : ''}`}
              >
                <FileSpreadsheet size={18} />
                Excel Manager
              </Link>
              <Link
                to="/settings"
                className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
              >
                <SettingsIcon size={18} />
                Налаштування
              </Link>
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
    </nav>
  );
}

function AppRoutes() {
  return (
    <div className="app">
      <Navigation />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/excel"
          element={
            <PrivateRoute>
              <ExcelManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <SalesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
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