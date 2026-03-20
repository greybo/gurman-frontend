import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function GeneralSettings() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Загальні налаштування</h2>
      <p className="text-gray-600 mb-6">Тут будуть інші параметри</p>

      {/* Пошук */}
      <div className="relative w-full max-w-md">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Пошук..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pl-10 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
        />
        {searchTerm && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setSearchTerm('')}
            title="Очистити"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}