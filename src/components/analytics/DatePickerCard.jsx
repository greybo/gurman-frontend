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
    <div className="analytics-date-card">
      <div className="date-card-header">
        <CalendarIcon size={20} />
        <h3>Вибір дати</h3>
      </div>
      <div className="date-card-body">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
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
    </div>
  );
};
