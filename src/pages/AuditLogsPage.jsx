// src/pages/AuditLogsPage.jsx
import React from 'react';
import { ClipboardList, RefreshCw, X, Search, Calendar, Layers, List } from 'lucide-react';
import useAuditLogsData, { ACTION_LABELS } from '../hooks/useAuditLogsData';

const SOURCE_LABELS = {
  OrderStatusHandler: 'Синк статусів',
  OrderService:       'Обробка замовлень',
};

function ActionBadge({ action }) {
  const meta = ACTION_LABELS[action] || { label: action, color: 'neutral' };
  return (
    <span className={`audit-badge audit-badge--${meta.color}`}>
      {meta.label}
    </span>
  );
}

function StatCard({ action, count }) {
  const meta = ACTION_LABELS[action] || { label: action, color: 'neutral' };
  return (
    <div className={`audit-stat-card audit-stat-card--${meta.color}`}>
      <div className="audit-stat-count">{count}</div>
      <div className="audit-stat-label">{meta.label}</div>
    </div>
  );
}

export default function AuditLogsPage() {
  const {
    filteredLogs,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    selectedAction,
    setSelectedAction,
    searchOrderId,
    setSearchOrderId,
    clearFilters,
    actionStats,
    groupByOrder,
    setGroupByOrder,
    groupedByOrder,
  } = useAuditLogsData();

  const today = new Date();
  const currentYear = today.getFullYear();

  // Список років для select (поточний та -1)
  const years = [currentYear, currentYear - 1].map(String);

  // Список місяців
  const months = [
    { value: '1', label: 'Січень' }, { value: '2', label: 'Лютий' },
    { value: '3', label: 'Березень' }, { value: '4', label: 'Квітень' },
    { value: '5', label: 'Травень' }, { value: '6', label: 'Червень' },
    { value: '7', label: 'Липень' }, { value: '8', label: 'Серпень' },
    { value: '9', label: 'Вересень' }, { value: '10', label: 'Жовтень' },
    { value: '11', label: 'Листопад' }, { value: '12', label: 'Грудень' },
  ];

  // Кількість днів у вибраному місяці
  const daysInMonth = new Date(
    Number(selectedDate.year),
    Number(selectedDate.month),
    0
  ).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  const hasFilters = selectedAction || searchOrderId;
  const hasStats = Object.keys(actionStats).length > 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-title-section">
          <ClipboardList size={32} className="analytics-icon" />
          <div>
            <h1 className="analytics-title">Аудит логи</h1>
            <p className="analytics-subtitle">Маніпуляції з даними замовлень</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>
      )}

      {/* Статистика за день */}
      {hasStats && (
        <div className="audit-stats-row">
          {Object.entries(actionStats).map(([action, count]) => (
            <StatCard key={action} action={action} count={count} />
          ))}
        </div>
      )}

      {/* Фільтри */}
      <div className="sales-filters-card">
        <div className="sales-filters-header">
          <h3>Фільтри</h3>
          {hasFilters && (
            <button onClick={clearFilters} className="sales-clear-filters-btn">
              <X size={16} /> Скинути
            </button>
          )}
        </div>

        <div className="sales-filters-grid">
          {/* Рік */}
          <div className="sales-filter-group">
            <label className="sales-filter-label"><Calendar size={16} /> Рік</label>
            <select
              className="sales-filter-select"
              value={selectedDate.year}
              onChange={e => setSelectedDate(d => ({ ...d, year: e.target.value, day: '1' }))}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Місяць */}
          <div className="sales-filter-group">
            <label className="sales-filter-label"><Calendar size={16} /> Місяць</label>
            <select
              className="sales-filter-select"
              value={selectedDate.month}
              onChange={e => setSelectedDate(d => ({ ...d, month: e.target.value, day: '1' }))}
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {/* День */}
          <div className="sales-filter-group">
            <label className="sales-filter-label"><Calendar size={16} /> День</label>
            <select
              className="sales-filter-select"
              value={selectedDate.day}
              onChange={e => setSelectedDate(d => ({ ...d, day: e.target.value }))}
            >
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Тип дії */}
          <div className="sales-filter-group">
            <label className="sales-filter-label">Тип події</label>
            <select
              className="sales-filter-select"
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
            >
              <option value="">Всі події</option>
              {Object.entries(ACTION_LABELS).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>

          {/* Пошук по orderId */}
          <div className="sales-filter-group">
            <label className="sales-filter-label"><Search size={16} /> № Замовлення</label>
            <input
              type="text"
              className="sales-filter-input"
              placeholder="Введіть ID..."
              value={searchOrderId}
              onChange={e => setSearchOrderId(e.target.value)}
            />
          </div>

          {/* Лічильник */}
          <div className="sales-total-box">
            <div className="sales-total-label">Записів</div>
            <div className="sales-total-value">{filteredLogs.length}</div>
          </div>

          {/* Кнопка групування */}
          <div className="sales-filter-group">
            <label className="sales-filter-label"><Layers size={16} /> Вигляд</label>
            <button
              className={`audit-group-toggle ${groupByOrder ? 'audit-group-toggle--active' : ''}`}
              onClick={() => setGroupByOrder(prev => !prev)}
            >
              {groupByOrder ? <Layers size={16} /> : <List size={16} />}
              {groupByOrder ? 'По замовленнях' : 'Плоский список'}
            </button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="sales-table-card">
        {loading ? (
          <div className="sales-loading">
            <RefreshCw size={24} className="spinning" />
            <p>Завантаження...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="sales-empty">
            <ClipboardList size={48} />
            <p>Логів за цей день не знайдено</p>
          </div>
        ) : groupByOrder ? (
          /* === Згрупований вигляд по Order ID === */
          <div className="audit-grouped-view">
            {groupedByOrder.map((group) => (
              <div key={String(group.orderId)} className="audit-order-group">
                <div className="audit-order-group-header">
                  <span className="audit-order-group-id">
                    Замовлення #{group.orderId != null ? group.orderId : '—'}
                  </span>
                  <span className="audit-order-group-count">
                    {group.logs.length} {group.logs.length === 1 ? 'запис' : group.logs.length < 5 ? 'записи' : 'записів'}
                  </span>
                </div>
                <div className="audit-timeline">
                  {group.logs.map((log, idx) => (
                    <div key={log._key} className="audit-timeline-item">
                      <div className="audit-timeline-dot-col">
                        <div className={`audit-timeline-dot audit-timeline-dot--${(ACTION_LABELS[log.action] || {}).color || 'neutral'}`} />
                        {idx < group.logs.length - 1 && <div className="audit-timeline-line" />}
                      </div>
                      <div className="audit-timeline-content">
                        <div className="audit-timeline-row">
                          <span className="audit-timeline-time">
                            {log.timestamp ? log.timestamp.split(' ')[1] : '—'}
                          </span>
                          <ActionBadge action={log.action} />
                          {log.toStatus != null && (
                            <span className="audit-status-tag">→ {log.toStatus}</span>
                          )}
                        </div>
                        {log.details && (
                          <div className="audit-timeline-details">{log.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* === Плоска таблиця (як було) === */
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Час</th>
                  <th>Подія</th>
                  <th>№ Замовлення</th>
                  <th>Статус</th>
                  <th>Джерело</th>
                  <th>Деталі</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._key}>
                    <td className="audit-td-time">
                      {log.timestamp ? log.timestamp.split(' ')[1] : '—'}
                    </td>
                    <td>
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="sales-td-id">
                      {log.orderId != null ? log.orderId : '—'}
                    </td>
                    <td className="audit-td-status">
                      {log.toStatus != null ? (
                        <span className="audit-status-tag">→ {log.toStatus}</span>
                      ) : '—'}
                    </td>
                    <td className="audit-td-source">
                      {SOURCE_LABELS[log.source] || log.source || '—'}
                    </td>
                    <td className="audit-td-details">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
