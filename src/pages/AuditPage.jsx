import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  RefreshCw,
  Trash2,
  Download,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Search,
  Check,
  X,
  MapPin,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuditSessions } from '../hooks/useAuditSessions';
import { useAuditItems } from '../hooks/useAuditItems';

const TABS = [
  { id: 'all', label: 'Всі', color: 'gray' },
  { id: 'unchecked', label: 'Не перевірені', color: 'gray' },
  { id: 'checked', label: 'Перевірені', color: 'green' },
  { id: 'discrepancy', label: 'Розбіжності', color: 'red' },
];

export default function AuditPage() {
  const { sessions, loading, error, deleteSession } = useAuditSessions();
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const selectedSession = sessions.find((s) => s.sessionId === selectedSessionId);

  if (selectedSessionId && selectedSession) {
    return (
      <AuditSessionDetail
        session={selectedSession}
        onBack={() => setSelectedSessionId(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList size={28} className="text-brand-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Переоблік</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <RefreshCw size={24} className="text-brand-600 animate-spin" />
          <p className="text-gray-600 text-sm">Завантаження сесій...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <ClipboardList size={48} className="text-gray-300" />
          <p className="text-gray-500">Сесій переобліку немає</p>
          <p className="text-xs text-gray-400">
            Створіть нову сесію в мобільному додатку
          </p>
        </div>
      )}

      {/* Sessions list */}
      {!loading && sessions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.sessionId}
              session={session}
              onClick={() => setSelectedSessionId(session.sessionId)}
              onDelete={() => {
                if (
                  window.confirm(
                    `Видалити сесію "${session.name}"?\nДія незворотна.`
                  )
                ) {
                  deleteSession(session.sessionId);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onClick, onDelete }) {
  const isOpen = session.status === 'open';
  const progress =
    session.totalItems > 0
      ? Math.round((session.checkedItems / session.totalItems) * 100)
      : 0;
  const dateStr = session.createdAt
    ? new Date(session.createdAt).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 truncate flex-1">
          {session.name}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isOpen
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isOpen ? 'Відкрита' : 'Закрита'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Видалити"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-1">{dateStr}</p>
      {session.workerName && (
        <p className="text-xs text-gray-500 mb-3">
          Створив: {session.workerName}
        </p>
      )}

      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-700">
          Перевірено: <strong>{session.checkedItems || 0}</strong> /{' '}
          {session.totalItems || 0}
        </span>
        {session.discrepancyItems > 0 && (
          <span className="text-red-600 font-semibold">
            Розбіжностей: {session.discrepancyItems}
          </span>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            session.discrepancyItems > 0 ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function AuditSessionDetail({ session, onBack }) {
  const { items, counts, loading, error, resolveItem } = useAuditItems(session.sessionId);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('difference'); // difference / name
  const [placeFilter, setPlaceFilter] = useState('all');
  const [resolutionModal, setResolutionModal] = useState(null); // { item, action }

  // Unique places extracted from items
  const availablePlaces = useMemo(() => {
    const set = new Set();
    items.forEach((i) => {
      if (Array.isArray(i.placeCode)) {
        i.placeCode.forEach((p) => p && set.add(p));
      } else if (typeof i.placeCode === 'string' && i.placeCode) {
        set.add(i.placeCode);
      }
    });
    return [...set].sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeTab !== 'all') {
      list = list.filter((i) => i.status === activeTab);
    }
    if (placeFilter !== 'all') {
      list = list.filter((i) => {
        if (Array.isArray(i.placeCode)) return i.placeCode.includes(placeFilter);
        return i.placeCode === placeFilter;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.barcode?.toLowerCase().includes(q)
      );
    }
    // Сортування
    if (sortBy === 'difference') {
      list = [...list].sort(
        (a, b) =>
          Math.abs((b.actualQty || 0) - (b.expectedQty || 0)) -
          Math.abs((a.actualQty || 0) - (a.expectedQty || 0))
      );
    } else {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [items, activeTab, searchQuery, sortBy, placeFilter]);

  const topDiscrepancies = useMemo(() => {
    return [...items]
      .filter((i) => i.status === 'discrepancy')
      .map((i) => ({
        name: (i.name || '—').slice(0, 25),
        difference: (i.actualQty || 0) - (i.expectedQty || 0),
        absDiff: Math.abs((i.actualQty || 0) - (i.expectedQty || 0)),
      }))
      .sort((a, b) => b.absDiff - a.absDiff)
      .slice(0, 10);
  }, [items]);

  const handleExport = () => {
    const headers = [
      'Назва',
      'Штрихкод',
      'Очікувана к-сть',
      'Фактична к-сть',
      'Різниця',
      'Місце',
      'Перевірив',
      'Статус',
    ];
    const data = items.map((item) => [
      item.name || '',
      item.barcode || '',
      item.expectedQty || 0,
      item.actualQty || 0,
      (item.actualQty || 0) - (item.expectedQty || 0),
      Array.isArray(item.placeCode) ? item.placeCode.join(', ') : '',
      item.checkedByName || '',
      item.status || 'unchecked',
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = [
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Переоблік');
    const fileName = `audit_${session.name.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Назад"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">{session.name}</h1>
          <p className="text-sm text-gray-500">
            {session.workerName && `Створив: ${session.workerName} · `}
            Статус: {session.status === 'open' ? 'Відкрита' : 'Закрита'}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Download size={16} />
          <span className="text-sm font-medium">Експорт Excel</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Circle size={18} />}
          label="Всього"
          value={counts.all}
          color="gray"
        />
        <StatCard
          icon={<Circle size={18} />}
          label="Не перевірені"
          value={counts.unchecked}
          color="gray"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Перевірені"
          value={counts.checked}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Розбіжності"
          value={counts.discrepancy}
          color="red"
        />
      </div>

      {/* Top discrepancies chart */}
      {topDiscrepancies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Топ-10 розбіжностей
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topDiscrepancies}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                angle={-30}
                textAnchor="end"
                height={70}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="difference" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-4 overflow-x-auto">
        {TABS.map((tab) => {
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Пошук по назві або баркоду..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={placeFilter}
            onChange={(e) => setPlaceFilter(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 appearance-none bg-white"
          >
            <option value="all">Всі місця</option>
            {availablePlaces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
        >
          <option value="difference">Сортувати за різницею</option>
          <option value="name">Сортувати за назвою</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <RefreshCw size={24} className="text-brand-600 animate-spin" />
          <p className="text-gray-600 text-sm">Завантаження товарів...</p>
        </div>
      )}

      {/* Items table */}
      {!loading && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                  Назва
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                  Штрихкод
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">
                  Очікувана
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">
                  Фактична
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">
                  Різниця
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                  Місце
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                  Перевірив
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                  Резолюція
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500 text-sm"
                  >
                    Товарів не знайдено
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <ItemRow
                    key={item.productId}
                    item={item}
                    onResolveClick={(action) => setResolutionModal({ item, action })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolution modal */}
      {resolutionModal && (
        <ResolutionModal
          item={resolutionModal.item}
          action={resolutionModal.action}
          onClose={() => setResolutionModal(null)}
          onConfirm={async (comment) => {
            await resolveItem(resolutionModal.item.productId, resolutionModal.action, comment);
            setResolutionModal(null);
          }}
        />
      )}
    </div>
  );
}

function ResolutionModal({ item, action, onClose, onConfirm }) {
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const isApprove = action === 'approved';
  const diff = (item.actualQty || 0) - (item.expectedQty || 0);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm(comment);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          {isApprove ? (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={20} className="text-green-600" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <X size={20} className="text-red-600" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {isApprove ? 'Підтвердити розбіжність' : 'Відхилити розбіжність'}
            </h3>
            <p className="text-xs text-gray-500">{item.name || '—'}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <div className="flex justify-between text-gray-600 mb-1">
            <span>Очікувана:</span>
            <span className="font-medium text-gray-900">{item.expectedQty ?? '—'}</span>
          </div>
          <div className="flex justify-between text-gray-600 mb-1">
            <span>Фактична:</span>
            <span className="font-medium text-gray-900">{item.actualQty ?? '—'}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Різниця:</span>
            <span className={`font-semibold ${diff > 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {diff > 0 ? `+${diff}` : diff}
            </span>
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Коментар {!isApprove && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={isApprove ? 'Необов\'язково...' : 'Поясніть причину відхилення...'}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Скасувати
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || (!isApprove && !comment.trim())}
            className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {saving ? 'Збереження...' : isApprove ? 'Підтвердити' : 'Відхилити'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, onResolveClick }) {
  const diff = (item.actualQty || 0) - (item.expectedQty || 0);
  const isDiscrepancy = item.status === 'discrepancy';
  const isUnchecked = item.status === 'unchecked';
  const place = Array.isArray(item.placeCode) ? item.placeCode.join(', ') : '—';

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${isDiscrepancy ? 'bg-red-50/50' : ''}`}>
      <td className="px-4 py-3 text-sm text-gray-900">
        <div className="flex items-center gap-2">
          <StatusDot status={item.status} />
          <span className="font-medium">{item.name || '—'}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-600 font-mono">
        {item.barcode || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-right text-gray-900">
        {item.expectedQty ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">
        {isUnchecked ? '—' : item.actualQty ?? 0}
      </td>
      <td
        className={`px-4 py-3 text-sm text-right font-semibold ${
          isDiscrepancy
            ? diff > 0
              ? 'text-blue-600'
              : 'text-red-600'
            : 'text-gray-400'
        }`}
      >
        {isUnchecked ? '—' : diff > 0 ? `+${diff}` : diff}
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">{place}</td>
      <td className="px-4 py-3 text-xs text-gray-600">
        {item.checkedByName || '—'}
      </td>
      <td className="px-4 py-3 text-xs">
        {isDiscrepancy ? (
          item.resolution ? (
            <div className="flex flex-col gap-0.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                  item.resolution === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {item.resolution === 'approved' ? <Check size={11} /> : <X size={11} />}
                {item.resolution === 'approved' ? 'Підтверджено' : 'Відхилено'}
              </span>
              {item.resolutionComment && (
                <span className="text-gray-500 truncate max-w-[180px]" title={item.resolutionComment}>
                  {item.resolutionComment}
                </span>
              )}
            </div>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => onResolveClick('approved')}
                className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors"
                title="Підтвердити"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => onResolveClick('rejected')}
                className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                title="Відхилити"
              >
                <X size={14} />
              </button>
            </div>
          )
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
    </tr>
  );
}

function StatusDot({ status }) {
  const color =
    status === 'checked'
      ? 'bg-green-500'
      : status === 'discrepancy'
        ? 'bg-red-500'
        : 'bg-gray-300';
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    gray: 'text-gray-700 bg-gray-50',
    green: 'text-green-700 bg-green-50',
    red: 'text-red-700 bg-red-50',
  };
  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
