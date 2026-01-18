// src/pages/SalesPage.jsx
import React from 'react';
import { ShoppingCart, RefreshCw, Users, Calendar, X, DollarSign } from 'lucide-react';
import useSalesData from '../hooks/useSalesData';

export default function SalesPage() {
  const {
    filteredOrders,
    loading,
    error,
    totalSum,
    selectedClient,
    selectedMonth,
    selectedYear,
    setSelectedClient,
    setSelectedMonth,
    setSelectedYear,
    clearFilters,
    uniqueClients,
    uniqueMonths,
    uniqueYears,
    formatDate,
    getPhone,
    getClientName
  } = useSalesData();

  // Month names for display
  const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const months = [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    const monthNum = parseInt(monthStr.split('-')[1], 10);
    const year = monthStr.split('-')[0];
    return `${months[monthNum - 1]} ${year}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="page-container">
      <div className="analytics-header">
        <div className="analytics-title-section">
          <ShoppingCart size={32} className="analytics-icon" />
          <div>
            <h1 className="analytics-title">Продажа</h1>
            <p className="analytics-subtitle">Перегляд та аналіз продажів</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="sales-filters-card">
        <div className="sales-filters-header">
          <h3>Фільтри</h3>
          {(selectedClient || selectedMonth) && (
            <button onClick={clearFilters} className="sales-clear-filters-btn">
              <X size={16} />
              Скинути фільтри
            </button>
          )}
        </div>

        <div className="sales-filters-grid">
          <div className="sales-filter-group">
            <label className="sales-filter-label">
              <Calendar size={16} />
              Рік
            </label>
            <select
              className="sales-filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Всі роки</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="sales-filter-group">
            <label className="sales-filter-label">
              <Calendar size={16} />
              Місяць
            </label>
            <select
              className="sales-filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Всі місяці</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
          </div>

          <div className="sales-filter-group">
            <label className="sales-filter-label">
              <Users size={16} />
              Клієнт
            </label>
            <select
              className="sales-filter-select"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Всі клієнти</option>
              {uniqueClients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>

          {/* Total Sum */}
          <div className="sales-total-box">
            <div className="sales-total-label">
              <DollarSign size={16} />
              Сума продажів
            </div>
            <div className="sales-total-value">
              {formatCurrency(totalSum)}
            </div>
            <div className="sales-total-count">
              {filteredOrders.length} замовлень
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="sales-table-card">
        {loading ? (
          <div className="sales-loading">
            <RefreshCw size={24} className="spinning" />
            <p>Завантаження...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>№ Замовлення</th>
                  <th>Клієнт</th>
                  <th>Телефон</th>
                  <th>К-сть продаж</th>
                  <th>Сума</th>
                  <th>Дата продажу</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId || order.id}>
                    <td className="sales-td-id">{order.id || '-'}</td>
                    <td className="sales-td-client">{getClientName(order)}</td>
                    <td className="sales-td-phone">{getPhone(order)}</td>
                    <td className="sales-td-count">{order.primaryContact?.leadsSalesCount || 0}</td>
                    <td className="sales-td-amount">{formatCurrency(order.paymentAmount || 0)}</td>
                    <td className="sales-td-date">{formatDate(order.updateDate || order.createNewOrder)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="sales-tfoot-label">Всього:</td>
                  <td className="sales-tfoot-amount">{formatCurrency(totalSum)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="sales-empty">
            <ShoppingCart size={48} />
            <p>Замовлень не знайдено</p>
          </div>
        )}
      </div>
    </div>
  );
}
