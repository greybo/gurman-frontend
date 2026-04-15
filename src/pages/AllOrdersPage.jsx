// src/pages/AllOrdersPage.jsx
import React from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Calendar,
  ChevronLeft,
  Phone,
  Truck,
  CreditCard,
  Clock,
  Hash,
  DollarSign,
  ArrowUpDown,
  Tag,
  Globe,
  X,
  BarChart3,
} from 'lucide-react';
import useAllOrders from '../hooks/useAllOrders';

function StatusBadge({ statusId, getStatusInfo }) {
  const info = getStatusInfo(statusId);
  const colorMap = {
    info: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    orange: 'bg-orange-100 text-orange-700',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    pink: 'bg-pink-100 text-pink-700',
    blue: 'bg-blue-100 text-blue-700',
    darkgreen: 'bg-emerald-100 text-emerald-700',
    neutral: 'bg-gray-100 text-gray-700',
  };
  const cls = colorMap[info.color] || colorMap.neutral;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {info.label}
    </span>
  );
}

function OrderDetailModal({ order, onClose, formatDate, getStatusInfo, getShippingName, getPaymentName }) {
  if (!order) return null;

  const info = getStatusInfo(order.currentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              Замовлення #{order.orderId}
            </h2>
            <StatusBadge statusId={order.currentStatus} getStatusInfo={getStatusInfo} />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={Hash} label="ID замовлення" value={order.orderId} />
            <InfoItem
              icon={Phone}
              label="Клієнт"
              value={`${`${order.fName || ''} ${order.lName || ''}`.trim() || '—'} · ${order.phone || '—'}`}
            />
            <InfoItem icon={Calendar} label="Дата замовлення" value={formatDate(order.orderTime)} />
            <InfoItem icon={Clock} label="Останнє оновлення" value={formatDate(order.updatedAt)} />
            <InfoItem
              icon={Truck}
              label="Доставка"
              value={`${getShippingName(order.shippingMethod)}${order.trackingNumber ? ` · ${order.trackingNumber}` : ''}`}
            />
            <InfoItem icon={CreditCard} label="Оплата" value={getPaymentName(order.paymentMethod)} />
            <InfoItem icon={Hash} label="ID контакту" value={order.contactId || '—'} />
            <InfoItem icon={Hash} label="ID менеджера" value={order.managerId || '—'} />
          </div>

          {/* Financial Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Фінанси</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <FinanceCard label="Сума продажу" value={order.salesAmount} />
              <FinanceCard label="Оплата" value={order.paymentAmount} />
              <FinanceCard label="Витрати" value={order.expensesAmount} />
              <FinanceCard label="Собівартість" value={order.costPriceAmount} />
              <FinanceCard label="Комісія" value={order.commissionAmount} />
              <FinanceCard label="Прибуток" value={order.profitAmount} highlight />
              {order.shipping_costs > 0 && (
                <FinanceCard label="Доставка" value={order.shipping_costs} />
              )}
            </div>
          </div>

          {/* Leads */}
          {order.leads && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ліди</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{order.leads.count ?? '—'}</div>
                  <div className="text-xs text-gray-500">Кількість</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{order.leads.salesCount ?? '—'}</div>
                  <div className="text-xs text-gray-500">Продажі</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{order.leads.salesAmount ?? '—'}</div>
                  <div className="text-xs text-gray-500">Сума продажів</div>
                </div>
              </div>
            </div>
          )}

          {/* UTM */}
          {order.utm && Object.values(order.utm).some((v) => v) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">UTM мітки</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {order.utm.campaign && <UtmRow label="Campaign" value={order.utm.campaign} />}
                {order.utm.source && <UtmRow label="Source" value={order.utm.source} />}
                {order.utm.medium && <UtmRow label="Medium" value={order.utm.medium} />}
                {order.utm.content && <UtmRow label="Content" value={order.utm.content} />}
                {order.utm.term && <UtmRow label="Term" value={order.utm.term} />}
                {order.utm.page && <UtmRow label="Page" value={order.utm.page} />}
                {order.utm.sourceFull && <UtmRow label="Source Full" value={order.utm.sourceFull} />}
              </div>
            </div>
          )}

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Історія статусів
              </h3>
              <div className="space-y-2">
                {order.statusHistory.map((entry, idx) => {
                  const sInfo = getStatusInfo(entry.status);
                  return (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {idx + 1}
                      </div>
                      <StatusBadge statusId={entry.status} getStatusInfo={getStatusInfo} />
                      <span className="text-sm text-gray-600 ml-auto">{formatDate(entry.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sajt */}
          {order.sajt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Globe size={14} />
              <span>Сайт: {order.sajt}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function FinanceCard({ label, value, highlight }) {
  const formatted = typeof value === 'number'
    ? new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', minimumFractionDigits: 0 }).format(value)
    : '—';
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
      <div className={`text-lg font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>{formatted}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function UtmRow({ label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 min-w-[90px]">{label}:</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

export default function AllOrdersPage() {
  const {
    orders,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedOrder,
    setSelectedOrder,
    stats,
    formatDate,
    getStatusInfo,
    getShippingName,
    getPaymentName,
  } = useAllOrders();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <ShoppingBag size={32} className="text-brand-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Всі замовлення</h1>
            <p className="text-gray-600 text-sm">Аналітика замовлень з Firestore</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Дата від</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Дата до</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Пошук</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ID замовлення, телефон, кампанія..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Замовлень</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 0 }).format(stats.totalSales)} <span className="text-sm font-normal text-gray-400">грн</span>
          </div>
          <div className="text-sm text-gray-500">Сума продажів</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 0 }).format(stats.totalProfit)} <span className="text-sm font-normal text-gray-400">грн</span>
          </div>
          <div className="text-sm text-gray-500">Прибуток</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="text-2xl font-bold text-amber-600">
            {new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 0 }).format(stats.totalCommission)} <span className="text-sm font-normal text-gray-400">грн</span>
          </div>
          <div className="text-sm text-gray-500">Комісія</div>
        </div>
      </div>

      {error && !loading && orders.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          {error}
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <RefreshCw size={24} className="text-brand-600 animate-spin" />
          <p className="text-gray-600 text-sm">Завантаження...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Клієнт
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Оновлено
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Доставка
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wider">
                    Сума
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wider">
                    Прибуток
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Кампанія
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-brand-600">
                      #{order.orderId}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {`${order.fName || ''} ${order.lName || ''}`.trim() || '—'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {order.phone || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge statusId={order.currentStatus} getStatusInfo={getStatusInfo} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(order.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Truck size={14} className="text-gray-400" />
                        {getShippingName(order.shippingMethod)}
                      </div>
                      {order.trackingNumber && (
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          {order.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {order.salesAmount?.toLocaleString('uk-UA') || '—'}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      (order.profitAmount || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {order.profitAmount?.toLocaleString('uk-UA', { minimumFractionDigits: 2 }) || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.utm?.campaign || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            Показано {orders.length} замовлень
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <ShoppingBag size={48} className="text-gray-300" />
          <p className="text-gray-500">Замовлень не знайдено</p>
        </div>
      )}

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        formatDate={formatDate}
        getStatusInfo={getStatusInfo}
        getShippingName={getShippingName}
        getPaymentName={getPaymentName}
      />
    </div>
  );
}
