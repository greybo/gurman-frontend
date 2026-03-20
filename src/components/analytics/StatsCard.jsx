// src/components/analytics/StatsCard.jsx
import React from 'react';

export const StatsCard = ({ chartData }) => {
  const successScans = chartData.reduce((sum, item) => sum + item.successCount, 0);
  const failScans = chartData.reduce((sum, item) => sum + item.failCount, 0);
  const totalScans = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Success Card */}
      <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-emerald-500 p-6">
        <div className="text-gray-600 text-sm font-medium mb-2">Успішних</div>
        <div className="text-4xl font-bold text-emerald-600">{successScans}</div>
      </div>

      {/* Error Card */}
      <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-red-500 p-6">
        <div className="text-gray-600 text-sm font-medium mb-2">Помилок</div>
        <div className="text-4xl font-bold text-red-600">{failScans}</div>
      </div>

      {/* Total Card */}
      <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-brand-600 p-6">
        <div className="text-gray-600 text-sm font-medium mb-2">Всього</div>
        <div className="text-4xl font-bold text-brand-600">{totalScans}</div>
      </div>
    </div>
  );
};
