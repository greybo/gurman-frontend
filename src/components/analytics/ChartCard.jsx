// src/components/analytics/ChartCard.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const timeIntervals = [
  { value: 10, label: '10 хв' },
  { value: 30, label: '30 хв' },
  { value: 60, label: '1 год' }
];

export const ChartCard = ({ chartData, timeInterval, onTimeIntervalChange, loading }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Графік активності</h3>

        {/* Time Interval Buttons */}
        <div className="flex gap-2">
          {timeIntervals.map(interval => (
            <button
              key={interval.value}
              onClick={() => onTimeIntervalChange(interval.value)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                timeInterval === interval.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {interval.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-gray-600">Завантаження даних...</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Немає даних для відображення</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="successCount"
              name="Успішні"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="failCount"
              name="Помилки"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
