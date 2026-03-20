// src/components/analytics/DatePickerCard.jsx
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';

export const DatePickerCard = ({ selectedDate, datesWithData, onDateChange }) => {
  // Function to check if a date has data
  const isDateWithData = (date) => {
    return datesWithData.some(dataDate => {
      return dataDate.getFullYear() === date.getFullYear() &&
             dataDate.getMonth() === date.getMonth() &&
             dataDate.getDate() === date.getDate();
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <CalendarIcon size={20} className="text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Вибір дати</h3>
      </div>

      {/* Date Picker */}
      <div className="flex justify-center py-2">
        <DatePicker
          selected={selectedDate}
          onChange={onDateChange}
          dateFormat="dd/MM/yyyy"
          inline
          dayClassName={(date) => isDateWithData(date) ? 'date-with-data' : undefined}
          maxDate={new Date()}
        />
      </div>
    </div>
  );
};
