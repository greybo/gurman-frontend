// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Zap, Shield, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="page-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <Sparkles className="hero-icon" />
            Вітаємо в Excel Parser
          </h1>
          <p className="hero-subtitle">
            Швидкий і зручний інструмент для роботи з Excel файлами
          </p>
          <div className="hero-buttons">
            <Link to="/parser" className="btn-primary">
              Почати роботу
            </Link>
            <Link to="/test" className="btn-secondary">
              Тестова сторінка
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Можливості</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FileSpreadsheet className="feature-icon" />
            <h3 className="feature-title">Парсинг Excel</h3>
            <p className="feature-text">
              Завантажуйте та переглядайте дані з Excel файлів (.xlsx, .xls)
            </p>
          </div>
          
          <div className="feature-card">
            <Zap className="feature-icon" />
            <h3 className="feature-title">Швидкий пошук</h3>
            <p className="feature-text">
              Миттєво знаходьте потрібну інформацію серед всіх даних
            </p>
          </div>
          
          <div className="feature-card">
            <Shield className="feature-icon" />
            <h3 className="feature-title">Безпека</h3>
            <p className="feature-text">
              Всі дані обробляються локально у вашому браузері
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}