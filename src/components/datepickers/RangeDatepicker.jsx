import React from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

const RangeDatepicker = ({ handleStartDateChange, handleEndDateChange, startDate, endDate, fetchData }) => {
    return (
        <div className="flex gap-8 justify-center items-center mb-8 flex-wrap">
            <div className="w-[250px] text-xs">
                <label className={`text-sm mr-1 font-medium dark:text-gray-200 text-gray-700`}>From</label>
                <DatePicker
                    value={startDate}
                    onChange={(date)=>handleStartDateChange(date)}
                    dateFormat="dd/MM/yyyy"
                    clearIcon={null}
                    className={`w-full p-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                />
            </div>
            <div className="w-[250px] text-xs">
                <label className={`text-sm mr-1 font-medium dark:text-gray-200 text-gray-700`}>To</label>
                <DatePicker
                    value={endDate}
                    onChange={(date)=>handleEndDateChange(date)}
                    dateFormat="dd/MM/yyyy"
                    filterDate={date => date >= startDate}
                    clearIcon={null}
                    className={`w-full p-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                />
            </div>
            <button
                className={`px-6 py-2 max-h-fit dark:bg-indigo-800 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700  transition-all duration-300`}
                onClick={fetchData}
            >
                Get Data
            </button>
        </div>
    );
};

export default RangeDatepicker;