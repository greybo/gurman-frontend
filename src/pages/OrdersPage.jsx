// src/pages/OrdersPage.jsx
import React from 'react';
import {
  Package,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  Truck,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import useOrdersData, { getStatusInfo } from '../hooks/useOrdersData';

export default function OrdersPage() {
  const {
    loading,
    error,
    groupedOrders,
    sortedStatusKeys,
    pendingOrders,
    stats,
    expandedGroups,
    toggleGroup,
    formatDate,
    getClientName,
    getShipping,
    isDateOlderThan24h,
    deleteOrder,
  } = useOrdersData();

  const handleDelete = (order) => {
    const name = `${order.fName || ''} ${order.lName || ''}`.trim() || '—';
    const confirmed = window.confirm(
      `Видалити замовлення #${order.id}?\nКлієнт: ${name}\n\nЦю дію не можна скасувати.`
    );
    if (confirmed) {
      deleteOrder(order.orderId);
    }
  };

  // Map status colors to Tailwind classes
  const getStatusBadgeClasses = (color) => {
    const baseClasses = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium';
    switch (color) {
      case 'green':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'yellow':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'red':
        return `${baseClasses} bg-red-100 text-red-700`;
      case 'blue':
        return `${baseClasses} bg-blue-100 text-blue-700`;
      case 'purple':
        return `${baseClasses} bg-purple-100 text-purple-700`;
      case 'gray':
        return `${baseClasses} bg-gray-100 text-gray-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  // Map status colors to hex for background styling
  const getStatusBgColor = (color) => {
    const colors = {
      'green': '#10b981',
      'yellow': '#f59e0b',
      'red': '#ef4444',
      'blue': '#3b82f6',
      'purple': '#a855f7',
      'gray': '#6b7280'
    };
    return colors[color] || colors['gray'];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Package size={32} className="text-brand-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Замовлення</h1>
            <p className="text-gray-600 text-sm">Поточні замовлення</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">Всього замовлень</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm border-l-4 border-l-amber-500">
          <div className="text-3xl font-bold text-amber-600 mb-1">{stats.pending}</div>
          <div className="text-sm text-gray-600">Чекають на зміну статусу</div>
        </div>
        {Object.entries(stats.shippingCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" key={name}>
              <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={14} className="text-gray-400" />
                {name || 'Невідомо'}
              </div>
            </div>
          ))}
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={20} className="text-amber-600" />
            <span className="font-semibold text-amber-900">
              Замовлення, що чекають на зміну статусу ({pendingOrders.length})
            </span>
          </div>
          <div className="space-y-2">
            {pendingOrders.map((order) => {
              const info = getStatusInfo(order.statusId);
              return (
                <div className="bg-white rounded-lg p-3 flex items-center gap-3 flex-wrap" key={order.orderId}>
                  <span className="font-semibold text-gray-900">#{order.id}</span>
                  <span className="text-gray-600 text-sm flex-1 min-w-fit">
                    {getClientName(order)}
                  </span>
                  <span className={getStatusBadgeClasses(info.color)}>
                    {info.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Clock size={13} /> {formatDate(order.updateDate)}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Truck size={13} /> {getShipping(order)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orders by Status Groups */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
          <RefreshCw size={24} className="text-brand-600 animate-spin" />
          <p className="text-gray-600 text-sm">Завантаження...</p>
        </div>
      ) : sortedStatusKeys.length > 0 ? (
        <div className="space-y-4">
          {sortedStatusKeys.map((statusId) => {
            const info = getStatusInfo(Number(statusId));
            const list = groupedOrders[statusId];
            const isExpanded = expandedGroups[statusId];
            const statusBgColor = getStatusBgColor(info.color);
            const groupBgStyle = {
              backgroundColor: `${statusBgColor}1a`, // 10% opacity
            };

            return (
              <div
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                key={statusId}
                style={groupBgStyle}
              >
                <button
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200"
                  style={{
                    color: info.color === 'yellow' ? '#1d1d1f' : '#ffffff',
                    backgroundColor: `${statusBgColor}`,
                  }}
                  onClick={() => toggleGroup(statusId)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                    <span className={getStatusBadgeClasses(info.color)}>
                      {info.label}
                    </span>
                    <span className="font-medium">
                      {list.length} замовлень
                    </span>
                  </div>
                  <span className="text-sm opacity-90">
                    Останнє оновлення: {formatDate(list[0]?.updateDate)}
                  </span>
                </button>

                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                            №
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                            Клієнт
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                            Товари
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                            Доставка
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                            Оновлено
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                            Коментар
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {list.map((order) => (
                          <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                              {order.id || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {getClientName(order)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {order.products?.length
                                ? order.products.map((p, i) => (
                                    <div key={i} className="flex gap-2">
                                      <span className="font-medium text-gray-900">{p.amount}x</span>
                                      <span>{p.text}</span>
                                    </div>
                                  ))
                                : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-700 mb-1">
                                <Truck size={14} className="text-gray-400" />
                                {getShipping(order)}
                              </div>
                              {order.trackingNumber && (
                                <div className="text-xs text-gray-500 font-mono">
                                  {order.trackingNumber}
                                </div>
                              )}
                            </td>
                            <td className={`px-6 py-4 text-sm ${
                              isDateOlderThan24h(order.updateDate)
                                ? 'text-red-600 font-medium'
                                : 'text-gray-600'
                            }`}>
                              {formatDate(order.updateDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                              {order.comment || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                onClick={() => handleDelete(order)}
                                title="Видалити замовлення"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
          <Package size={48} className="text-gray-300" />
          <p className="text-gray-500">Замовлень не знайдено</p>
        </div>
      )}
    </div>
  );
}
