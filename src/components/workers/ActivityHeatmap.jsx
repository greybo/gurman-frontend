import React, { useMemo } from 'react';

function formatDayLabel(dayKey) {
  // dayKey: 'YYYY-MM-DD'
  const [, m, d] = dayKey.split('-');
  return `${d}.${m}`;
}

export default function ActivityHeatmap({ data }) {
  const { days, max } = useMemo(() => {
    const dayKeys = Object.keys(data).sort();
    let maxVal = 0;
    dayKeys.forEach((dk) => {
      data[dk].forEach((c) => {
        if (c > maxVal) maxVal = c;
      });
    });
    return { days: dayKeys, max: maxVal };
  }, [data]);

  if (days.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Активність по годинах</h3>
        <p className="text-sm text-gray-400 text-center py-8">Немає даних</p>
      </div>
    );
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-50';
    const intensity = count / max;
    if (intensity > 0.75) return 'bg-brand-600';
    if (intensity > 0.5) return 'bg-brand-500';
    if (intensity > 0.25) return 'bg-brand-300';
    if (intensity > 0.1) return 'bg-brand-200';
    return 'bg-brand-100';
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Активність по годинах</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Менше</span>
          <div className="w-3 h-3 rounded-sm bg-brand-100" />
          <div className="w-3 h-3 rounded-sm bg-brand-200" />
          <div className="w-3 h-3 rounded-sm bg-brand-300" />
          <div className="w-3 h-3 rounded-sm bg-brand-500" />
          <div className="w-3 h-3 rounded-sm bg-brand-600" />
          <span>Більше</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-separate" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th className="w-12"></th>
              {hours.map((h) => (
                <th key={h} className="text-[10px] font-medium text-gray-400 w-6">
                  {h % 3 === 0 ? h : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((dayKey) => (
              <tr key={dayKey}>
                <td className="text-xs text-gray-500 pr-2 text-right">{formatDayLabel(dayKey)}</td>
                {hours.map((h) => {
                  const count = data[dayKey][h] || 0;
                  return (
                    <td
                      key={h}
                      className={`w-6 h-6 rounded-sm ${getColor(count)} transition-colors`}
                      title={`${formatDayLabel(dayKey)} ${h}:00 — ${count} дій`}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
