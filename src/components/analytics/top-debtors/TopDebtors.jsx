/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import useTheme from '@/hooks/useTheme.mjs';
import Spinner from '@/components/loader/Spinner';
import RangeDatepicker from '@/components/datepickers/RangeDatepicker';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ChartDataLabels);

const TopDebtors = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [textColor, setTextColor] = useState("#000000");
    const [topDebtors, setTopDebtors] = useState([]);
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(endDate.getMonth() - 12)));

    const fetchData = async () => {
        try {

            setLoading(true);
            const res = await fetch(
                `/api/gets/top-debtors?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=10`,
                { credentials: 'include' }
            );
            const data = await res.json();
            setTopDebtors(data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setTextColor(theme === "dark" ? "#ffffff" : "#000000");
    }, [theme]);

    const chartData = {
        labels: topDebtors.map((debtor) => `${debtor._id.firstName} ${debtor._id.lastName}`),
        datasets: [
            {
                label: 'Total Due Amount',
                data: topDebtors.map((debtor) => debtor.totalDueAmount),
                backgroundColor: topDebtors.map((_, index) =>
                    index % 2 === 0 ? '#2e6aec' : '#9333ea'
                ),
                hoverBackgroundColor: topDebtors.map((_, index) =>
                    index % 2 === 0 ? '#2e6adc' : '#9334ea'
                ),
                borderWidth: 0,
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            x: {
                ticks: {
                    color: textColor,
                },
                grid: {
                    display: false,
                },
            },
            y: {
                ticks: {
                    color: textColor,
                },
                grid: {
                    color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                },
            },
        },
        plugins: {
            datalabels: {
                color: theme === "dark" ? "#ffffff" : "#000000",
                font: { size: 12, weight: "bold" },
                anchor: "center",
                align: "center",
                formatter: (value) => `${value.toFixed(2)}`,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const debtor = topDebtors[context.dataIndex];
                        return `${debtor._id.firstName} ${debtor._id.lastName}\nDue: $${debtor.totalDueAmount}`;
                    },
                },
            },
            legend: {
                display: false,
            },
        },
    };

    const handleStartDateChange = (date) => {
        localStorage.setItem("top_debtors_start_date", JSON.stringify(date))
        setStartDate(date);
    };

    const handleEndDateChange = (date) => {
        localStorage.setItem("top_debtors_end_date", JSON.stringify(date))
        setEndDate(date);
    };
    useEffect(() => {
        const previousStartDate = localStorage.getItem("top_debtors_start_date");
        const previousEndDate = localStorage.getItem("top_debtors_end_date");

        const parseDate = (date) => {
            try {
                return new Date(JSON.parse(date));
            } catch {
                return null;
            }
        };
    
        const validStartDate = parseDate(previousStartDate);
        const validEndDate = parseDate(previousEndDate);
    
        setStartDate(validStartDate || new Date(new Date().setMonth(new Date().getMonth() - 12)));
        setEndDate(validEndDate || new Date());
    }, []);
    return (
        <div className='container min-h-[594px] mx-auto p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg relative'>
            {loading ? (
         <div className="absolute inset-0 bg-white dark:bg-gray-600 dark:bg-opacity-50 bg-opacity-20 backdrop-blur-lg flex justify-center items-center z-10">
         <div className="text-center text-2xl text-gray-800 dark:text-white">
             <p>Loading...</p>
             <Spinner />
         </div>
     </div>
            ) : (
                <>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Top 10 Debtors</h2>
                        <p className="text-gray-600 dark:text-gray-400">View overdue amounts for the selected date range.</p>
                    </div>
                    <RangeDatepicker endDate={endDate} startDate={startDate} fetchData={fetchData} handleEndDateChange={handleEndDateChange} handleStartDateChange={handleStartDateChange} />

                    <div className="h-96">
                        {topDebtors.length > 0 ? (
                            <Bar data={chartData} options={options} />
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">No debtors found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TopDebtors;
