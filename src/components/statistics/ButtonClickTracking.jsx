import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { uk } from 'date-fns/locale';
import {
  Search, ChevronDown, ChevronRight, Calendar, Loader2,
  Monitor, User, Smartphone, MousePointerClick,
} from 'lucide-react';
import useButtonClickData from '../../hooks/useButtonClickData';

function formatTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ButtonClickTracking() {
  const {
    selectedDate,
    setSelectedDate,
    loading,
    searchQuery,
    setSearchQuery,
    filterScreen,
    setFilterScreen,
    filterWorker,
    setFilterWorker,
    screens,
    workers,
    groups,
    totalClicks,
  } = useButtonClickData();

  const [expandedGroup, setExpandedGroup] = useState(null);

  const toggleGroup = (key) => {
    setExpandedGroup(expandedGroup === key ? null : key);
  };

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
            <Calendar size={16} className="text-gray-500" />
            Дата
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd.MM.yyyy"
            locale={uk}
            className="w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
            <Monitor size={16} className="text-gray-500" />
            Екран
          </label>
          <select
            value={filterScreen}
            onChange={(e) => setFilterScreen(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">Всі екрани</option>
            {screens.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
            <User size={16} className="text-gray-500" />
            Працівник
          </label>
          <select
            value={filterWorker}
            onChange={(e) => setFilterWorker(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">Всі працівники</option>
            {workers.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
            <Search size={16} className="text-gray-500" />
            Пошук
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Баркод, кнопка, invoiceId..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
          <span className="font-medium">{groups.length}</span>
          <span>груп</span>
          <span className="text-gray-300">|</span>
          <span className="font-medium">{totalClicks}</span>
          <span>кліків</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            Завантаження...
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {searchQuery || filterScreen !== 'all' || filterWorker !== 'all'
              ? 'Нічого не знайдено'
              : 'Немає даних за обрану дату'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-10 px-4 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Екран</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Працівник</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Версія</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Пристрій</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Кліків</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => {
                const isExpanded = expandedGroup === group.key;
                return (
                  <React.Fragment key={group.key}>
                    <tr
                      onClick={() => toggleGroup(group.key)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{group.screen}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{group.workerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{group.invoiceId}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono">
                          {group.appVersion}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                          <Smartphone size={12} className="text-gray-400" />
                          {group.deviceModel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                          {group.clicks.length}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="px-4 py-0 bg-gray-50/50">
                          <div className="py-3 pl-6 pr-2">
                            <div className="relative border-l-2 border-brand-200 pl-6 space-y-2">
                              {group.clicks.map((click, idx) => (
                                <div key={idx} className="relative">
                                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow-sm" />
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-400 font-mono text-xs w-16 flex-shrink-0">
                                      {formatTime(click.timestamp)}
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">
                                      <MousePointerClick size={11} />
                                      {click.buttonName}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-mono">
                                      {click.barcode}
                                    </span>
                                    {!click.success && (
                                      <span className="text-red-500 text-xs font-medium">Помилка</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
