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
    <div className="chart-card">
      <div className="chart-header">
        <h3>Графік активності</h3>
        <div className="chart-controls">
          <div className="time-interval-buttons">
            {timeIntervals.map(interval => (
              <button
                key={interval.value}
                className={`interval-button ${timeInterval === interval.value ? 'active' : ''}`}
                onClick={() => onTimeIntervalChange(interval.value)}
              >
                {interval.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {loading ? (
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Завантаження даних...</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="chart-empty">
          <p>Немає даних для відображення</p>
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
