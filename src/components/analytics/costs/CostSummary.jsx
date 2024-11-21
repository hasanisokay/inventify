'use client';
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Spinner from '@/components/loader/Spinner';
import RangeDatepicker from '@/components/datepickers/RangeDatepicker';

ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const CostSummary = () => {
    const [totalDue, setTotalDue] = useState(undefined);
    const [totalPaid, setTotalPaid] = useState(undefined);
    const [totalExpenses, setTotalExpenses] = useState(undefined);
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
            setTotalDue(data.totalDue);
            setTotalPaid(data.totalPaid);
            setTotalExpenses(data.totalExpenses);
        } catch (err) {
            console.log(err);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const chartData = {
        labels: ['Total Due', 'Total Paid', 'Total Expenses'],
        datasets: [{
            data: [totalDue, totalPaid, totalExpenses],
            backgroundColor: ['#e72d2d', '#308853', '#f39c12'],  // Colors for Pie chart segments
            hoverBackgroundColor: ['#ff0f10', '#1c6c47', '#e67e22'],
        }],
    };

    const options = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    fontSize: 14,
                    boxWidth: 20,
                    padding: 10,
                    fontColor: '#333', // Default text color for light mode
                },
            },
            datalabels: {
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 16,
                },
                formatter: (value) => {
                    return value > 0 ? `${value.toLocaleString()} BDT` : '';
                },
            },
        },
    };

    const handleStartDateChange = (date) => {
        if (date <= endDate) {
            setStartDate(date);
        } else {
            setStartDate(date);
            setEndDate(date);
        }
    };

    const handleEndDateChange = (date) => {
        if (date >= startDate) {
            setEndDate(date);
        } else {
            setEndDate(date);
            setStartDate(date);
        }
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

                  
                    <RangeDatepicker endDate={endDate} startDate={startDate} fetchData={fetchData} handleEndDateChange={handleEndDateChange} handleStartDateChange={handleStartDateChange} />

                    <div className="flex justify-between gap-12 items-center flex-wrap">
                        <div className="text-lg font-medium text-gray-800 dark:text-gray-300 space-y-4">
                            {totalPaid !== undefined && (
                                <p><span className="font-semibold">Received:</span> {totalPaid.toLocaleString()} BDT</p>
                            )}
                            {totalDue !== undefined && (
                                <p><span className="font-semibold">Due From Invoice:</span> {totalDue.toLocaleString()} BDT</p>
                            )}
                            {totalExpenses !== undefined && (
                                <p><span className="font-semibold">Expenses:</span> {totalExpenses.toLocaleString()} BDT</p>
                            )}
                        </div>

                        <div className="h-[400px] w-[400px]">
                            {totalDue > 0 || totalPaid > 0 || totalExpenses > 0 ? (
                                <Pie data={chartData} options={options} />
                            ) : (
                                <p className="text-center text-gray-600 dark:text-gray-400">No data available for the selected range.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>

    );
};

export default CostSummary;
