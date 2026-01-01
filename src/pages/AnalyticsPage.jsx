// src/pages/AnalyticsPage.jsx
import React, { useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import {
  DatePickerCard,
  OrdersCard,
  FiltersCard,
  StatsCard,
  ChartCard
} from '../components/analytics';

export default function AnalyticsPage() {
  console.log('[AnalyticsPage] Component rendering');

  const {
    selectedDate,
    datesWithData,
    scanThresholdData,
    users,
    actions,
    selectedUser,
    selectedAction,
    timeInterval,
    chartData,
    loading,
    ordersLoading,
    ordersError,
    setSelectedUser,
    setSelectedAction,
    setTimeInterval,
    handleDateChange,
  } = useAnalyticsData();

  // Component lifecycle logging and global error handler
  useEffect(() => {
    console.log('[AnalyticsPage] Component mounted');

    const handleError = (event) => {
      console.error('[AnalyticsPage] Global error caught:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    const handleUnhandledRejection = (event) => {
      console.error('[AnalyticsPage] Unhandled promise rejection:', {
        reason: event.reason,
        promise: event.promise
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.log('[AnalyticsPage] Component will unmount');
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div className="page-container">
      <div className="analytics-header">
        <div className="analytics-title-section">
          <BarChart2 size={32} className="analytics-icon" />
          <div>
            <h1 className="analytics-title">Аналітика логів</h1>
            <p className="analytics-subtitle">Візуалізація даних по користувачам та діям</p>
          </div>
        </div>
      </div>

      <OrdersCard
        scanThresholdData={scanThresholdData}
        ordersLoading={ordersLoading}
        ordersError={ordersError}
      />

      <DatePickerCard
        selectedDate={selectedDate}
        datesWithData={datesWithData}
        onDateChange={handleDateChange}
      />

      <FiltersCard
        users={users}
        actions={actions}
        selectedUser={selectedUser}
        selectedAction={selectedAction}
        onUserChange={setSelectedUser}
        onActionChange={setSelectedAction}
      />

      <StatsCard chartData={chartData} />

      <ChartCard
        chartData={chartData}
        timeInterval={timeInterval}
        onTimeIntervalChange={setTimeInterval}
        loading={loading}
      />
    </div>
  );
}
