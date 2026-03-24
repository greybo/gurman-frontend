// src/pages/ProcessingTimePage.jsx
import React from 'react';
import { useProcessingTimeData } from '../hooks/useProcessingTimeData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { RefreshCw } from 'lucide-react';

export default function ProcessingTimePage() {
  const {
    loading,
    error,
    chartData,
    selectedSajt,
    setSelectedSajt,
    selectedManager,
    setSelectedManager,
    selectedYear,
    setSelectedYear,
    availableSajts,
    availableManagers,
    availableYears,
  } = useProcessingTimeData();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Час обробки</h1>
      <p className="text-gray-600 mb-6">
        Різниця між створенням замовлення та відправкою, згрупована по тижнях
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Фільтри */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Фільтри</h3>
        <div className="flex flex-wrap gap-4">
          {/* Рік */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Рік</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Сайт */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сайт</label>
            <select
              value={selectedSajt}
              onChange={(e) => setSelectedSajt(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">Всі сайти</option>
              {availableSajts.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Менеджер */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Менеджер</label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">Всі менеджери</option>
              {availableManagers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Графік */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Час обробки по тижнях ({selectedYear})
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
            <p className="text-gray-500 text-sm">Завантаження даних...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            Немає даних для відображення
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Години', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value, name) => [`${value} год`, name]}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="min"
                name="Найшвидший"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="Середній"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="max"
                name="Найповільніший"
                stroke="#ef4444"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
