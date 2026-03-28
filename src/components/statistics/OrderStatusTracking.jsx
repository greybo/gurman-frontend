import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { uk } from 'date-fns/locale';
import { Search, ChevronDown, ChevronRight, ArrowRight, Calendar, Loader2 } from 'lucide-react';
import useStatusChangeData from '../../hooks/useStatusChangeData';

function formatTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function OrderStatusTracking() {
  const {
    selectedDate,
    setSelectedDate,
    loading,
    searchQuery,
    setSearchQuery,
    orders,
    totalOrders,
  } = useStatusChangeData();

  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Date picker */}
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

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
            <Search size={16} className="text-gray-500" />
            Пошук
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук по Order ID або ТТН..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Counter */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
          <span className="font-medium">{orders.length}</span>
          {searchQuery && <span>/ {totalOrders}</span>}
          <span>замовлень</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            Завантаження...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {searchQuery ? 'Нічого не знайдено' : 'Немає даних за обрану дату'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-10 px-4 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ТТН</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Переміщень</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Останній статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isExpanded = expandedOrder === order.orderId;
                const lastTransition = order.transitions[order.transitions.length - 1];
                return (
                  <React.Fragment key={order.orderId}>
                    {/* Order row */}
                    <tr
                      onClick={() => toggleOrder(order.orderId)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{order.trackingNumber}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                          {order.transitions.length}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{lastTransition?.toStatus || '—'}</td>
                    </tr>

                    {/* Expanded transitions */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="px-4 py-0 bg-gray-50/50">
                          <div className="py-3 pl-6 pr-2">
                            <div className="relative border-l-2 border-brand-200 pl-6 space-y-3">
                              {order.transitions.map((t, idx) => (
                                <div key={idx} className="relative">
                                  {/* Timeline dot */}
                                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow-sm" />
                                  <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400 font-mono text-xs w-16 flex-shrink-0">
                                      {formatTime(t.timestamp)}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 text-xs font-medium">
                                      {t.fromStatus}
                                    </span>
                                    <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
                                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium">
                                      {t.toStatus}
                                    </span>
                                    <span className="text-gray-400 text-xs ml-auto">
                                      {t.workerName}
                                    </span>
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
