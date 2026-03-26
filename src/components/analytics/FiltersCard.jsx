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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Фільтри</h3>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* User Filter */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User size={18} className="text-gray-600" />
            Працівник
          </label>
          <select
            value={selectedUser}
            onChange={(e) => onUserChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white text-gray-900"
          >
            <option value="all">Всі працівники</option>
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Activity size={18} className="text-gray-600" />
            Дія
          </label>
          <select
            value={selectedAction}
            onChange={(e) => onActionChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white text-gray-900"
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
