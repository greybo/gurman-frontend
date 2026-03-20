// src/components/analytics/OrdersCard.jsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';

export const OrdersCard = ({ scanThresholdData, ordersLoading, ordersError }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart size={20} className="text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Інформація про замовлення</h3>
      </div>

      {/* Body */}
      <div>
        {ordersLoading ? (
          <div className="p-3 text-center text-gray-600">Завантаження даних замовлень...</div>
        ) : ordersError ? (
          <div className="p-3 text-center text-red-500 font-medium">{ordersError}</div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Orders Stat */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="text-xs font-semibold text-gray-700 mb-1">Всього замовлень</div>
                <div className="text-2xl font-bold text-blue-700">
                  {scanThresholdData.totalOrders || 0}
                </div>
              </div>

              {/* Products Stat */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-emerald-500">
                <div className="text-xs font-semibold text-gray-700 mb-1">Кількість товару на сьогодні</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {scanThresholdData.totalProducts || 0}
                </div>
              </div>

              {/* Weight Stat */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-amber-500">
                <div className="text-xs font-semibold text-gray-700 mb-1">Вага</div>
                <div className="text-2xl font-bold text-amber-700">
                  {(scanThresholdData.totalWeight || 0) + ' кг'}
                </div>
              </div>

              {/* Volume Stat */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-pink-500">
                <div className="text-xs font-semibold text-gray-700 mb-1">Об'єм</div>
                <div className="text-2xl font-bold text-pink-700">
                  {(scanThresholdData.totalVolume || 0) + ' м³'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
