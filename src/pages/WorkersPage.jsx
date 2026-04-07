import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { uk } from 'date-fns/locale';
import { Calendar, Loader2, TrendingUp, ArrowUpDown } from 'lucide-react';
import useWorkersPerformance from '../hooks/useWorkersPerformance';
import WorkerCard from '../components/workers/WorkerCard';
import ActivityHeatmap from '../components/workers/ActivityHeatmap';
import WorkerDetails from '../components/workers/WorkerDetails';

export default function WorkersPage() {
  const {
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    loading,
    workerStats,
    heatmapData,
    workerActions,
  } = useWorkersPerformance();

  const [showInactive, setShowInactive] = useState(false);
  const [sortBy, setSortBy] = useState('orders'); // orders | name | errors
  const [selectedWorker, setSelectedWorker] = useState(null);

  const sortedWorkers = useMemo(() => {
    let list = workerStats;
    if (!showInactive) {
      list = list.filter((w) => w.active);
    }
    const sorted = [...list];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'errors':
        sorted.sort((a, b) => b.scansFailed - a.scansFailed);
        break;
      case 'orders':
      default:
        sorted.sort((a, b) => b.ordersCount - a.ordersCount);
    }
    return sorted;
  }, [workerStats, showInactive, sortBy]);

  const topPerformers = useMemo(() => {
    return [...workerStats]
      .filter((w) => w.active && w.ordersCount > 0)
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 5);
  }, [workerStats]);

  // Build actions array for selected worker
  const selectedActions = useMemo(() => {
    if (!selectedWorker) return [];
    const byId = workerActions[selectedWorker.workerId] || [];
    const byName = workerActions[`name:${selectedWorker.name}`] || [];
    return [...byId, ...byName].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [selectedWorker, workerActions]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Продуктивність працівників</h1>
        <p className="text-gray-500 text-sm">
          Метрики, активність та статистика по кожному працівнику
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="text-gray-500" />
              Від
            </label>
            <DatePicker
              selected={dateFrom}
              onChange={(date) => {
                setDateFrom(date);
                if (date > dateTo) setDateTo(date);
              }}
              selectsStart
              startDate={dateFrom}
              endDate={dateTo}
              maxDate={dateTo}
              dateFormat="dd.MM.yyyy"
              locale={uk}
              className="w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="text-gray-500" />
              До
            </label>
            <DatePicker
              selected={dateTo}
              onChange={setDateTo}
              selectsEnd
              startDate={dateFrom}
              endDate={dateTo}
              minDate={dateFrom}
              dateFormat="dd.MM.yyyy"
              locale={uk}
              className="w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <ArrowUpDown size={16} className="text-gray-500" />
              Сортування
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="orders">За замовленнями</option>
              <option value="errors">За помилками</option>
              <option value="name">За іменем</option>
            </select>
          </div>

          <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 accent-brand-600"
            />
            <span className="text-sm text-gray-700">Показати неактивних</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          Завантаження...
        </div>
      ) : (
        <>
          {/* Top performers */}
          {topPerformers.length > 0 && (
            <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl border border-brand-100 p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-brand-600" />
                <h2 className="font-semibold text-gray-900">Топ-5 за замовленнями</h2>
              </div>
              <div className="space-y-2">
                {topPerformers.map((w, idx) => {
                  const max = topPerformers[0].ordersCount;
                  const pct = (w.ordersCount / max) * 100;
                  return (
                    <div
                      key={w.workerId}
                      onClick={() => setSelectedWorker(w)}
                      className="cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 group-hover:text-brand-700">
                          #{idx + 1} {w.name}
                        </span>
                        <span className="text-gray-600">{w.ordersCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-brand-500 group-hover:bg-brand-600 transition-colors"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Heatmap */}
          <div className="mb-6">
            <ActivityHeatmap data={heatmapData} />
          </div>

          {/* Worker cards grid */}
          {sortedWorkers.length === 0 ? (
            <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200">
              Немає працівників за обраний період
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedWorkers.map((worker, idx) => (
                <WorkerCard
                  key={worker.workerId}
                  worker={worker}
                  rank={sortBy === 'orders' ? idx : null}
                  onClick={() => setSelectedWorker(worker)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Details modal */}
      {selectedWorker && (
        <WorkerDetails
          worker={selectedWorker}
          actions={selectedActions}
          onClose={() => setSelectedWorker(null)}
        />
      )}
    </div>
  );
}
