// src/pages/AnalyticsPage.jsx
import React, { useEffect } from 'react';
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Аналітика логів</h1>
          <p className="text-gray-600">Візуалізація даних по користувачам та діям</p>
        </div>

        {/* Orders Card */}
        <OrdersCard
          scanThresholdData={scanThresholdData}
          ordersLoading={ordersLoading}
          ordersError={ordersError}
        />

        {/* Date Picker and Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        </div>

        {/* Stats Card */}
        <StatsCard chartData={chartData} />

        {/* Chart Card */}
        <ChartCard
          chartData={chartData}
          timeInterval={timeInterval}
          onTimeIntervalChange={setTimeInterval}
          loading={loading}
        />
      </div>
    </div>
  );
}
