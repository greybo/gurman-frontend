import React from 'react';
import { Package, AlertCircle, Clock, LogIn, ChevronRight } from 'lucide-react';

function formatDuration(seconds) {
  if (!seconds || seconds < 1) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}г ${m}хв`;
  if (m > 0) return `${m}хв ${s}с`;
  return `${s}с`;
}

function formatLastLogin(timestamp) {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  return d.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function argbToHex(argb) {
  if (!argb || typeof argb !== 'number') return '#3b82f6';
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

export default function WorkerCard({ worker, rank, onClick }) {
  const color = typeof worker.color === 'string' ? worker.color : argbToHex(worker.color);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-brand-200 cursor-pointer transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {(worker.name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{worker.name}</h3>
            <p className="text-xs text-gray-500">
              {worker.active ? 'Активний' : 'Неактивний'}
            </p>
          </div>
        </div>
        {rank != null && rank < 3 && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              rank === 0
                ? 'bg-yellow-100 text-yellow-700'
                : rank === 1
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-orange-100 text-orange-700'
            }`}
          >
            #{rank + 1}
          </span>
        )}
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Metric
          icon={<Package size={14} />}
          label="Замовлень"
          value={worker.ordersCount}
          color="text-brand-600"
        />
        <Metric
          icon={<Clock size={14} />}
          label="Сер. час"
          value={formatDuration(worker.avgProcessingSec)}
          color="text-blue-600"
        />
        <Metric
          icon={<AlertCircle size={14} />}
          label="Помилок"
          value={worker.scansFailed}
          color={worker.scansFailed > 0 ? 'text-red-600' : 'text-gray-500'}
        />
        <Metric
          icon={<LogIn size={14} />}
          label="Останній вхід"
          value={formatLastLogin(worker.lastLogin)}
          color="text-gray-700"
          small
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span>
          Скан: {worker.scansSuccess} · Кліків: {worker.clicksCount}
        </span>
        <ChevronRight size={14} className="text-gray-400" />
      </div>
    </div>
  );
}

function Metric({ icon, label, value, color, small }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`${small ? 'text-xs' : 'text-lg'} font-semibold ${color}`}>{value}</p>
    </div>
  );
}
