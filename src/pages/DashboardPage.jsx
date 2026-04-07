import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingCart, ScanLine, AlertCircle, ClipboardList,
  FileSpreadsheet, TrendingUp, Activity, Loader2, ArrowRight, ArrowUp, ArrowDown,
  MousePointerClick, LogIn,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useDashboardData from '../hooks/useDashboardData';

const ACTIVITY_META = {
  APP_SCAN: { label: 'Сканування', icon: ScanLine, color: 'text-blue-600 bg-blue-50' },
  STATUS_CHANGE: { label: 'Зміна статусу', icon: ArrowRight, color: 'text-green-600 bg-green-50' },
  WORKER_LOGIN: { label: 'Вхід', icon: LogIn, color: 'text-purple-600 bg-purple-50' },
  BUTTON_CLICK: { label: 'Клік', icon: MousePointerClick, color: 'text-amber-600 bg-amber-50' },
};

const STATUS_COLOR_CLASSES = {
  green: 'bg-green-50 text-green-700 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  darkgreen: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  gray: 'bg-gray-50 text-gray-700 border-gray-200',
  neutral: 'bg-gray-50 text-gray-700 border-gray-200',
};

function describeAction(item) {
  switch (item._type) {
    case 'APP_SCAN':
      return `${item.workerName || '—'} · ${item.barcode || ''}${item.success ? '' : ' · помилка'}`;
    case 'STATUS_CHANGE':
      return `${item.workerName || '—'} · #${item.orderId} → ${item.toStatus || '—'}`;
    case 'WORKER_LOGIN':
      return `${item.workerName || '—'} · ${item.deviceModel || ''}`;
    case 'BUTTON_CLICK':
      return `${item.workerName || '—'} · ${item.buttonName || ''}`;
    default:
      return '';
  }
}

function formatRelative(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'щойно';
  if (m < 60) return `${m} хв тому`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} год тому`;
  const d = Math.floor(h / 24);
  return `${d} дн тому`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Доброго ранку';
  if (h < 18) return 'Добрий день';
  return 'Добрий вечір';
}

function PeriodCard({ title, value, subtitle, prevValue, icon: Icon, color = 'brand' }) {
  let trend = null;
  if (prevValue != null && prevValue > 0) {
    const diff = ((value - prevValue) / prevValue) * 100;
    trend = {
      pct: Math.abs(Math.round(diff)),
      up: diff >= 0,
    };
  }
  const colorMap = {
    brand: 'text-brand-600 bg-brand-50',
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</span>
        <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>
          <Icon size={14} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trend.up ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend.pct}%
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, color }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  };
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${colorMap[color]}`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { loading, ordersByStatus, totalOrders, periodStats, recentActivity } = useDashboardData();

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'друже';

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {getGreeting()}, {userName}! 👋
        </h1>
        <p className="text-gray-500 text-sm">
          Ось огляд того, що відбувається у вашому складі сьогодні.
        </p>
      </div>

      {/* Period stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PeriodCard
          title="Доставлено сьогодні"
          value={periodStats.deliveredToday}
          prevValue={periodStats.deliveredYesterday}
          subtitle="порівняно з вчора"
          icon={Package}
          color="brand"
        />
        <PeriodCard
          title="За тиждень"
          value={periodStats.deliveredWeek}
          subtitle="доставлених замовлень"
          icon={TrendingUp}
          color="green"
        />
        <PeriodCard
          title="Сканувань сьогодні"
          value={periodStats.scansToday}
          prevValue={periodStats.scansYesterday}
          subtitle="порівняно з вчора"
          icon={ScanLine}
          color="blue"
        />
        <PeriodCard
          title="Помилок сьогодні"
          value={periodStats.errorsToday}
          subtitle="невдалих сканувань"
          icon={AlertCircle}
          color={periodStats.errorsToday > 0 ? 'red' : 'brand'}
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Швидкі дії</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction to="/orders" icon={Package} label="Замовлення" color="brand" />
          <QuickAction to="/audit" icon={ClipboardList} label="Переоблік" color="green" />
          <QuickAction to="/excel" icon={FileSpreadsheet} label="Excel Manager" color="amber" />
          <QuickAction to="/workers" icon={TrendingUp} label="Продуктивність" color="purple" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time order status counters */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={18} className="text-brand-600" />
                Замовлення по статусах
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Real-time · всього: {totalOrders}</p>
            </div>
            <Link
              to="/orders"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              Всі замовлення <ArrowRight size={12} />
            </Link>
          </div>

          {ordersByStatus.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Немає замовлень</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ordersByStatus.map((s) => {
                const cls = STATUS_COLOR_CLASSES[s.info.color] || STATUS_COLOR_CLASSES.gray;
                return (
                  <div key={s.statusId} className={`border rounded-lg p-3 ${cls}`}>
                    <p className="text-xs font-medium opacity-75 truncate">{s.info.label}</p>
                    <p className="text-xl font-bold mt-0.5">{s.count}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity feed */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-brand-600" />
              Останні дії
            </h2>
            <Link
              to="/statistics"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              Все <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Поки тихо</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {recentActivity.map((a, idx) => {
                const meta = ACTIVITY_META[a._type] || ACTIVITY_META.APP_SCAN;
                const Icon = meta.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`p-1 rounded ${meta.color} flex-shrink-0 mt-0.5`}>
                      <Icon size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 truncate">{describeAction(a)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {meta.label} · {formatRelative(a.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
