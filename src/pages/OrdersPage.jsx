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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-title-section">
          <Package size={32} className="analytics-icon" />
          <div>
            <h1 className="analytics-title">Замовлення</h1>
            <p className="analytics-subtitle">
              Поточні замовлення з orders_DB_V3
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="orders-stats-row">
        <div className="orders-stat-card">
          <div className="orders-stat-count">{stats.total}</div>
          <div className="orders-stat-label">Всього замовлень</div>
        </div>
        <div className="orders-stat-card orders-stat-card--warning">
          <div className="orders-stat-count">{stats.pending}</div>
          <div className="orders-stat-label">Чекають на зміну статусу</div>
        </div>
        {Object.entries(stats.shippingCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => (
            <div className="orders-stat-card" key={name}>
              <div className="orders-stat-count">{count}</div>
              <div className="orders-stat-label">
                <Truck size={14} /> {name || 'Невідомо'}
              </div>
            </div>
          ))}
      </div>

      {/* Pending orders alert */}
      {pendingOrders.length > 0 && (
        <div className="orders-pending-alert">
          <div className="orders-pending-header">
            <AlertCircle size={20} />
            <span>
              Замовлення, що чекають на зміну статусу ({pendingOrders.length})
            </span>
          </div>
          <div className="orders-pending-list">
            {pendingOrders.map((order) => {
              const info = getStatusInfo(order.statusId);
              return (
                <div className="orders-pending-item" key={order.orderId}>
                  <span className="orders-pending-id">#{order.id}</span>
                  <span className="orders-pending-client">
                    {getClientName(order)}
                  </span>
                  <span className={`orders-badge orders-badge--${info.color}`}>
                    {info.label}
                  </span>
                  <span className="orders-pending-date">
                    <Clock size={13} /> {formatDate(order.updateDate)}
                  </span>
                  <span className="orders-pending-ship">
                    <Truck size={13} /> {getShipping(order)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grouped by status */}
      {loading ? (
        <div className="sales-loading">
          <RefreshCw size={24} className="spinning" />
          <p>Завантаження...</p>
        </div>
      ) : sortedStatusKeys.length > 0 ? (
        <div className="orders-groups">
          {sortedStatusKeys.map((statusId) => {
            const info = getStatusInfo(Number(statusId));
            const list = groupedOrders[statusId];
            const isExpanded = expandedGroups[statusId];
            const groupBg = info.bg
              ? `${info.bg}B3` // hex + B3 = 70% opacity
              : undefined;

            return (
              <div
                className="orders-group"
                key={statusId}
                style={groupBg ? { backgroundColor: groupBg } : undefined}
              >
                <button
                  className="orders-group-header"
                  onClick={() => toggleGroup(statusId)}
                >
                  <div className="orders-group-left">
                    {isExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                    <span
                      className={`orders-badge orders-badge--${info.color}`}
                    >
                      {info.label}
                    </span>
                    <span className="orders-group-count">
                      {list.length} замовлень
                    </span>
                  </div>
                  <span className="orders-group-updated">
                    Останнє оновлення: {formatDate(list[0]?.updateDate)}
                  </span>
                </button>

                {isExpanded && (
                  <div className="orders-group-body">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>№</th>
                          <th>Клієнт</th>
                          <th>Товари</th>
                          <th>Доставка</th>
                          <th>Оновлено</th>
                          <th>Коментар</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((order) => (
                          <tr key={order.orderId}>
                            <td className="orders-td-id">{order.id || '—'}</td>
                            <td className="orders-td-client">
                              {getClientName(order)}
                            </td>
                            <td className="orders-td-products">
                              {order.products?.length
                                ? order.products.map((p, i) => (
                                    <div
                                      className="orders-product-line"
                                      key={i}
                                    >
                                      <span className="orders-product-amount">
                                        {p.amount}x
                                      </span>{' '}
                                      {p.text}
                                    </div>
                                  ))
                                : '—'}
                            </td>
                            <td className="orders-td-ship">
                              <div className="orders-ship-cell">
                                <Truck size={14} />
                                {getShipping(order)}
                              </div>
                              {order.trackingNumber && (
                                <div className="orders-tracking">
                                  {order.trackingNumber}
                                </div>
                              )}
                            </td>
                            <td className={`orders-td-date${isDateOlderThan24h(order.updateDate) ? ' orders-td-date--stale' : ''}`}>
                              {formatDate(order.updateDate)}
                            </td>
                            <td className="orders-td-comment">
                              {order.comment || '—'}
                            </td>
                            <td className="orders-td-actions">
                              <button
                                className="orders-delete-btn"
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
        <div className="sales-empty">
          <Package size={48} />
          <p>Замовлень не знайдено</p>
        </div>
      )}
    </div>
  );
}
