// src/components/analytics/OrdersCard.jsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';

export const OrdersCard = ({ scanThresholdData, ordersLoading, ordersError }) => {
  return (
    <div className="analytics-date-card" style={{ marginBottom: '24px' }}>
      <div className="date-card-header">
        <ShoppingCart size={20} />
        <h3>Інформація про замовлення</h3>
      </div>
      <div className="date-card-body">
        {ordersLoading ? (
          <div style={{ padding: '12px', textAlign: 'center' }}>Завантаження даних замовлень...</div>
        ) : ordersError ? (
          <div style={{ padding: '12px', textAlign: 'center', color: '#ef4444' }}>{ordersError}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#f0f9ff', border: '2px solid #0ea5e9', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Всього замовлень</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#0369a1' }}>
                  {scanThresholdData.totalOrders || 0}
                </div>
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Кількість товару на сьогодні</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>
                  {scanThresholdData.totalProducts || 0}
                </div>
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#d7d7d7ff', border: '2px solid #b9ab10ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Вага</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#b9ab10ff' }}>
                  {(scanThresholdData.totalWeight || 0) + ' кг'}
                </div>
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#ded7dcff', border: '2px solid #b91081ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Об'єм</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#b91081ff' }}>
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
