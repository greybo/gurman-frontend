// src/pages/ProcessingTimePage.jsx
import React, { useState } from 'react';
import { useProcessingTimeData } from '../hooks/useProcessingTimeData';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { RefreshCw } from 'lucide-react';

const LINES = [
  { key: 'min', name: 'Найшвидший', color: '#10b981' },
  { key: 'avg', name: 'Середній', color: '#3b82f6' },
  { key: 'max', name: 'Найповільніший', color: '#ef4444' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
      <p className="font-medium text-gray-900 mb-1">{data?.week} ({data?.weekStart})</p>
      <p className="text-xs text-gray-500 mb-2">Замовлень: {data?.count}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value} год
        </p>
      ))}
    </div>
  );
}

export default function ProcessingTimePage() {
  const {
    loading,
    error,
    chartData,
    managerChartData,
    selectedSajt,
    setSelectedSajt,
    selectedManager,
    setSelectedManager,
    selectedShipping,
    setSelectedShipping,
    selectedYear,
    setSelectedYear,
    availableSajts,
    availableManagers,
    availableShippings,
    availableYears,
  } = useProcessingTimeData();

  const [visibleLines, setVisibleLines] = useState({ min: true, avg: true, max: true });

  const toggleLine = (key) => {
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сайт</label>
            <select
              value={selectedSajt}
              onChange={(e) => setSelectedSajt(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">Всі сайти</option>
              {availableSajts.map(s => (
                <option key={s.value} value={s.value}>{s.text}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Менеджер</label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">Всі менеджери</option>
              {availableManagers.map(m => (
                <option key={m.value} value={m.value}>{m.text}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Доставка</label>
            <select
              value={selectedShipping}
              onChange={(e) => setSelectedShipping(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">Всі методи</option>
              {availableShippings.map(s => (
                <option key={s.value} value={s.value}>{s.text}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Графік */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Час обробки по тижнях ({selectedYear})
          </h3>

          {/* Чекбокси ліній */}
          <div className="flex gap-4">
            {LINES.map(line => (
              <label key={line.key} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={visibleLines[line.key]}
                  onChange={() => toggleLine(line.key)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: line.color }}
                />
                <span className="text-sm font-medium" style={{ color: line.color }}>
                  {line.name}
                </span>
              </label>
            ))}
          </div>
        </div>

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
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="week"
                stroke="#6b7280"
                fontSize={11}
                tick={({ x, y, payload }) => {
                  const item = chartData.find(d => d.week === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={12} textAnchor="middle" fill="#6b7280" fontSize={11}>
                        {payload.value}
                      </text>
                      <text x={0} y={0} dy={26} textAnchor="middle" fill="#9ca3af" fontSize={10}>
                        {item?.weekStart || ''}
                      </text>
                    </g>
                  );
                }}
                height={45}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Години', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              {LINES.map(line => (
                visibleLines[line.key] && (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.name}
                    stroke={line.color}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Аналітика по менеджерах */}
      {!loading && managerChartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Час обробки по менеджерах ({selectedYear})
            </h3>
            <div className="flex gap-4">
              {LINES.map(line => (
                <label key={line.key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={visibleLines[line.key]}
                    onChange={() => toggleLine(line.key)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: line.color }}
                  />
                  <span className="text-sm font-medium" style={{ color: line.color }}>
                    {line.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={Math.max(300, managerChartData.length * 60)}>
            <BarChart
              data={managerChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis
                type="number"
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Години', position: 'insideBottom', offset: -2, style: { fill: '#6b7280' } }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                width={140}
                tick={({ x, y, payload }) => {
                  const item = managerChartData.find(d => d.name === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-5} y={-6} textAnchor="end" fill="#374151" fontSize={12} fontWeight={500}>
                        {payload.value}
                      </text>
                      <text x={-5} y={10} textAnchor="end" fill="#9ca3af" fontSize={10}>
                        {item?.count} замовл.
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0]?.payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                      <p className="font-medium text-gray-900 mb-1">{data?.name}</p>
                      <p className="text-xs text-gray-500 mb-2">Замовлень: {data?.count}</p>
                      <p className="text-sm" style={{ color: '#10b981' }}>Найшвидший: {data?.min} год</p>
                      <p className="text-sm" style={{ color: '#3b82f6' }}>Середній: {data?.avg} год</p>
                      <p className="text-sm" style={{ color: '#ef4444' }}>Найповільніший: {data?.max} год</p>
                    </div>
                  );
                }}
              />
              {visibleLines.min && <Bar dataKey="min" name="Найшвидший" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />}
              {visibleLines.avg && <Bar dataKey="avg" name="Середній" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />}
              {visibleLines.max && <Bar dataKey="max" name="Найповільніший" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={14} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
