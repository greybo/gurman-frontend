// src/components/analytics/FiltersCard.jsx
import React from 'react';
import { User, Activity } from 'lucide-react';

export const FiltersCard = ({
  users,
  actions,
  selectedUser,
  selectedAction,
  onUserChange,
  onActionChange
}) => {
  return (
    <div className="analytics-filters-card">
      <div className="filters-header">
        <h3>Фільтри</h3>
      </div>
      <div className="filters-grid">
        <div className="filter-group">
          <label className="filter-label">
            <User size={18} />
            Користувач
          </label>
          <select
            value={selectedUser}
            onChange={(e) => onUserChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Всі користувачі</option>
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">
            <Activity size={18} />
            Дія
          </label>
          <select
            value={selectedAction}
            onChange={(e) => onActionChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Всі дії</option>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
