import React from 'react';
import { X, Package, AlertCircle, Clock, LogIn, MousePointerClick, ScanLine, ArrowRight } from 'lucide-react';

const ACTION_META = {
  APP_SCAN: { label: 'Сканування', icon: ScanLine, color: 'text-blue-600 bg-blue-50' },
  STATUS_CHANGE: { label: 'Зміна статусу', icon: ArrowRight, color: 'text-green-600 bg-green-50' },
  WORKER_LOGIN: { label: 'Вхід', icon: LogIn, color: 'text-purple-600 bg-purple-50' },
  BUTTON_CLICK: { label: 'Клік', icon: MousePointerClick, color: 'text-amber-600 bg-amber-50' },
};

function formatTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function describeAction(item) {
  switch (item._type) {
    case 'APP_SCAN':
      return `${item.screen || ''} · ${item.barcode || ''} · ${item.success ? 'OK' : 'FAIL'}`;
    case 'STATUS_CHANGE':
      return `#${item.orderId} · ${item.fromStatus || '—'} → ${item.toStatus || '—'}`;
    case 'WORKER_LOGIN':
      return `${item.deviceModel || '—'} · ${item.appVersion || ''}`;
    case 'BUTTON_CLICK':
      return `${item.screen || ''} · ${item.buttonName || ''}`;
    default:
      return '';
  }
}

export default function WorkerDetails({ worker, actions, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{worker.name}</h2>
            <p className="text-xs text-gray-500">
              {worker.ordersCount} замовлень · {worker.scansSuccess} сканувань · {worker.scansFailed} помилок
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-4 gap-3 p-5 border-b border-gray-100">
          <Stat icon={<Package size={16} />} label="Замовлень" value={worker.ordersCount} />
          <Stat icon={<ScanLine size={16} />} label="Сканувань" value={worker.scansSuccess} />
          <Stat icon={<AlertCircle size={16} />} label="Помилок" value={worker.scansFailed} />
          <Stat icon={<MousePointerClick size={16} />} label="Кліків" value={worker.clicksCount} />
        </div>

        {/* Actions list */}
        <div className="flex-1 overflow-y-auto p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Дії ({actions.length})
          </h3>
          {actions.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Немає дій за обраний період</p>
          ) : (
            <div className="space-y-2">
              {actions.map((a, idx) => {
                const meta = ACTION_META[a._type] || { label: a._type, icon: Clock, color: 'text-gray-600 bg-gray-50' };
                const Icon = meta.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-1.5 rounded-md ${meta.color} flex-shrink-0`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
                        <span className="font-medium text-gray-700">{meta.label}</span>
                        <span>·</span>
                        <span className="font-mono">{formatTime(a.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-900 truncate">{describeAction(a)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
