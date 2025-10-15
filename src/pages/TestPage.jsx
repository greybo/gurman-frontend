// src/pages/TestPage.jsx
import React, { useState } from 'react';
import { Rocket, Code, Database, Terminal } from 'lucide-react';

export default function TestPage() {
  const [counter, setCounter] = useState(0);
  const [text, setText] = useState('');

  return (
    <div className="page-container">
      <div className="test-header">
        <Rocket className="test-icon" />
        <h1 className="test-title">Тестова сторінка</h1>
        <p className="test-subtitle">Експериментуйте з компонентами</p>
      </div>

      <div className="test-grid">
        {/* Counter Card */}
        <div className="test-card">
          <div className="test-card-header">
            <Code size={24} />
            <h3>Лічильник</h3>
          </div>
          <div className="test-card-body">
            <div className="counter-display">{counter}</div>
            <div className="counter-buttons">
              <button 
                onClick={() => setCounter(counter - 1)}
                className="btn-counter btn-danger"
              >
                -
              </button>
              <button 
                onClick={() => setCounter(0)}
                className="btn-counter btn-secondary"
              >
                Скинути
              </button>
              <button 
                onClick={() => setCounter(counter + 1)}
                className="btn-counter btn-success"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Text Input Card */}
        <div className="test-card">
          <div className="test-card-header">
            <Terminal size={24} />
            <h3>Текстове поле</h3>
          </div>
          <div className="test-card-body">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введіть текст..."
              className="test-input"
            />
            <div className="test-output">
              <strong>Ви ввели:</strong> {text || '(порожньо)'}
            </div>
            <div className="test-stats">
              Символів: {text.length} | Слів: {text.trim() ? text.trim().split(/\s+/).length : 0}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="test-card">
          <div className="test-card-header">
            <Database size={24} />
            <h3>Інформація</h3>
          </div>
          <div className="test-card-body">
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">React:</span>
                <span className="info-value">19.1.1</span>
              </div>
              <div className="info-item">
                <span className="info-label">Router:</span>
                <span className="info-value">v6</span>
              </div>
              <div className="info-item">
                <span className="info-label">Vite:</span>
                <span className="info-value">7.1.7</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-badge">✓ Активно</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="test-card">
          <div className="test-card-header">
            <Rocket size={24} />
            <h3>Прогрес</h3>
          </div>
          <div className="test-card-body">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(counter * 10, 100)}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {Math.min(counter * 10, 100)}% завершено
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}