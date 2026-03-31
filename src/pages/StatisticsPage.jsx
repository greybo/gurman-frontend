import React, { useState } from 'react';
import { GitBranch, LogIn, MousePointerClick, Download } from 'lucide-react';
import OrderStatusTracking from '../components/statistics/OrderStatusTracking';
import WorkerLoginTracking from '../components/statistics/WorkerLoginTracking';
import ButtonClickTracking from '../components/statistics/ButtonClickTracking';
import AppUpdateTracking from '../components/statistics/AppUpdateTracking';

const tabs = [
  { id: 'order-statuses', label: 'Статуси замовлень', icon: GitBranch },
  { id: 'worker-logins', label: 'Вхід', icon: LogIn },
  { id: 'button-clicks', label: 'Кліки', icon: MousePointerClick },
  { id: 'app-updates', label: 'Оновлення', icon: Download },
];

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState('order-statuses');

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Статистика</h1>
        <p className="text-gray-500 text-sm">Відстеження переміщень та аналітика замовлень</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 -mb-px">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'order-statuses' && <OrderStatusTracking />}
      {activeTab === 'worker-logins' && <WorkerLoginTracking />}
      {activeTab === 'button-clicks' && <ButtonClickTracking />}
      {activeTab === 'app-updates' && <AppUpdateTracking />}
    </div>
  );
}
