// src/pages/SalesPage.jsx
import React from 'react';
import { ShoppingCart, RefreshCw, Users, Calendar, X, DollarSign, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
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
    setSelectedMonth,
    setSelectedYear,
    clearFilters,
    uniqueMonths,
    uniqueYears,
    formatDate,
    getPhone,
    getClientName,
    // Client search
    clientSearchTerm,
    showClientDropdown,
    setShowClientDropdown,
    filteredClients,
    handleSelectClient,
    handleClientInputChange,
    clientDropdownRef,
    // Sorting
    dateSortOrder,
    toggleDateSort
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <ShoppingCart size={32} className="text-brand-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Продажі</h1>
            <p className="text-gray-600 text-sm">Перегляд та аналіз продажів</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Фільтри</h3>
          {(selectedClient || selectedMonth) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={16} />
              Скинути фільтри
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Year Filter */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} className="text-gray-500" />
              Рік
            </label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Всі роки</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} className="text-gray-500" />
              Місяць
            </label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Всі місяці</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
          </div>

          {/* Client Filter */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users size={16} className="text-gray-500" />
              Клієнт
            </label>
            <div className="relative" ref={clientDropdownRef}>
              <div className="relative w-full">
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  value={clientSearchTerm}
                  onChange={(e) => handleClientInputChange(e.target.value)}
                  onFocus={() => setShowClientDropdown(true)}
                  placeholder="Пошук клієнта..."
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowClientDropdown(!showClientDropdown)}
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              {showClientDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                      <div
                        key={client}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          selectedClient === client
                            ? 'bg-brand-50 text-brand-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectClient(client)}
                      >
                        {client}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      Клієнтів не знайдено
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Total Sum Box */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-md">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign size={16} />
              <span className="text-xs font-medium opacity-90">Сума продажів</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(totalSum)}
            </div>
            <div className="text-xs opacity-85">
              {filteredOrders.length} замовлень
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
            <RefreshCw size={24} className="text-brand-600 animate-spin" />
            <p className="text-gray-600 text-sm">Завантаження...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                    № Замовлення
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                    Клієнт
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider">
                    Сума
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={toggleDateSort}
                  >
                    <div className="flex items-center gap-2">
                      Дата продажу
                      {dateSortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const salesCount = order.primaryContact?.leadsSalesCount || 0;
                  return (
                    <tr key={order.orderId || order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {order.id || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">{getClientName(order)}</span>
                            {salesCount > 1 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold">
                                {salesCount}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-500 text-xs">{getPhone(order)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {formatCurrency(order.paymentAmount || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.updateDate || order.createNewOrder)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold">
                  <td colSpan="2" className="px-6 py-3 text-sm text-gray-900">
                    Всього:
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {formatCurrency(totalSum)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
            <ShoppingCart size={48} className="text-gray-300" />
            <p className="text-gray-500">Замовлень не знайдено</p>
          </div>
        )}
      </div>
    </div>
  );
}
