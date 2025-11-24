import React, { useState } from 'react';
import { Search, X } from 'lucide-react'; // Переконайтеся, що у вас встановлено lucide-react або змініть на вашу бібліотеку іконок

export default function GeneralSettings() {
  // Стан для збереження тексту пошуку
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <h2 className="content-title">Загальні налаштування</h2>
      <p className="page-subtitle">Тут будуть інші параметри</p>

      {/* --- Початок блоку пошуку --- */}
      <div
        style={{
          marginTop: '24px',        // Відступ зверху
          position: 'relative',     // Батьківський контейнер для абсолютного позиціонування іконок
          width: '95%',            // Ширина контейнера
          maxWidth: '20em'         // Обмеження ширини, щоб поле не було на весь екран
        }}
      >
        {/* Іконка лупи (зліва) */}
        <Search
          size={20}
          className="search-icon"
        />

        {/* Поле вводу */}
        <input
          type="text"
          placeholder="Пошук..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {/* Кнопка очищення (справа) - з'являється тільки якщо є текст */}
        {searchTerm && (
          <button
            className="search-clear-button"
            onClick={() => setSearchTerm('')}
            title="Очистити"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {/* --- Кінець блоку пошуку --- */}

    </div>
  );
}