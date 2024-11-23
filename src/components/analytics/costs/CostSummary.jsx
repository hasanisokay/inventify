'use client';
import { useEffect, useState } from 'react';
import Spinner from '@/components/loader/Spinner';
import RangeDatepicker from '@/components/datepickers/RangeDatepicker';

const CostSummary = () => {
    const [mergedData, setMergedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/gets/cost-summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
                credentials: 'include'
            });
            const data = await res.json();
 
            if (data.success) {
                console.log(data)
                mergeData(data.invoiceData, data.expenseData);
            } else {
                console.error("Error fetching data:", data.message);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const mergeData = (invoiceData, expenseData) => {
        const merged = [];
        const invoiceMap = new Map();
        const expenseMap = new Map();
    
        // Map expenses by period
        expenseData.forEach((expense) => {
            expenseMap.set(expense._id, expense.totalExpenses);
        });
    
        // Map invoices by period
        invoiceData.forEach((invoice) => {
            invoiceMap.set(invoice._id, {
                totalDue: invoice.totalDue,
                totalPaid: invoice.totalPaid,
            });
        });
    
        // Merge all unique periods from invoices and expenses
        const uniquePeriods = new Set([
            ...invoiceMap.keys(),
            ...expenseMap.keys(),
        ]);
    
        uniquePeriods.forEach((period) => {
            const invoice = invoiceMap.get(period) || { totalDue: 0, totalPaid: 0 };
            const expense = expenseMap.get(period) || 0;
    
            merged.push({
                timePeriod: formatTimePeriod(period),
                totalDue: invoice.totalDue,
                totalPaid: invoice.totalPaid,
                totalExpenses: expense,
            });
        });
    
        setMergedData(merged);
    };
    
    
    const formatTimePeriod = (period) => {
        if(typeof(period)==='number') return period
        if (period?.includes("W")) {
            const [year, week] = period.split("-W");
            return formatWeekToDateRange(year, week);
        } else if (period?.includes("-")) {
            const [year, month] = period.split("-");
            const monthNames = [
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ];
            return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
        }
        return period;  
    };

    const formatWeekToDateRange = (year, week) => {

        const firstDayOfWeek = getDateOfISOWeek(year, week); 
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); 

        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const startDateFormatted = firstDayOfWeek.toLocaleDateString('en-US', options);
        const endDateFormatted = lastDayOfWeek.toLocaleDateString('en-US', options);

        return `${startDateFormatted} - ${endDateFormatted}`;
    };

    const getDateOfISOWeek = (year, week) => {
        const date = new Date(year, 0, 1);
        const dayOfWeek = date.getDay();
        const diff = (dayOfWeek <= 4 ? 1 - dayOfWeek : 8 - dayOfWeek) + (week - 1) * 7;
        date.setDate(date.getDate() + diff);

        return date;
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStartDateChange = (date) => {
        setStartDate(date);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
    };

    return (
        <div className="container min-h-[628px] mx-auto p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg relative">
            {loading ? (
                <div className="absolute inset-0 bg-white dark:bg-gray-600 dark:bg-opacity-50 bg-opacity-20 backdrop-blur-lg flex justify-center items-center z-10">
                    <div className="text-center text-2xl text-gray-800 dark:text-white">
                        <p>Loading...</p>
                        <Spinner />
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-semibold text-gray-800 dark:text-white mb-2">Cost Summary</h2>
                        <h3 className="text-lg text-gray-600 dark:text-gray-300">Select a Date Range for Cost Summary</h3>
                    </div>

                    <RangeDatepicker 
                        endDate={endDate} 
                        startDate={startDate} 
                        fetchData={fetchData} 
                        handleEndDateChange={handleEndDateChange} 
                        handleStartDateChange={handleStartDateChange} 
                    />

                    <div className="mt-6">
                        <table className="min-w-full table-auto mb-8 border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-lg font-medium text-gray-700 dark:text-gray-300">Time Period</th>
                                    <th className="px-4 py-2 text-left text-lg font-medium text-gray-700 dark:text-gray-300">Due</th>
                                    <th className="px-4 py-2 text-left text-lg font-medium text-gray-700 dark:text-gray-300">Received</th>
                                    <th className="px-4 py-2 text-left text-lg font-medium text-gray-700 dark:text-gray-300">Expenses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mergedData.length > 0 ? (
                                    mergedData.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.timePeriod}</td>
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.totalDue.toLocaleString()} BDT</td>
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.totalPaid.toLocaleString()} BDT</td>
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.totalExpenses.toLocaleString()} BDT</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-2 text-center text-gray-600 dark:text-gray-400">
                                            No data available for the selected range.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default CostSummary;
