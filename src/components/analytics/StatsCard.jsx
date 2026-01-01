// src/components/analytics/StatsCard.jsx
import React from 'react';

export const StatsCard = ({ chartData }) => {
  const successScans = chartData.reduce((sum, item) => sum + item.successCount, 0);
  const failScans = chartData.reduce((sum, item) => sum + item.failCount, 0);
  const totalScans = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="stats-grid">
      <div className="stat-card success">
        <div className="stat-value">{successScans}</div>
        <div className="stat-label">Успішних</div>
      </div>
      <div className="stat-card error">
        <div className="stat-value">{failScans}</div>
        <div className="stat-label">Помилок</div>
      </div>
      <div className="stat-card total">
        <div className="stat-value">{totalScans}</div>
        <div className="stat-label">Всього</div>
      </div>
    </div>
  );
};
