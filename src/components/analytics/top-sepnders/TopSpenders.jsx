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

const TopSpenders = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [textColor, setTextColor] = useState("#000000");
    const [topCustomers, setTopCustomers] = useState([]);
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(endDate.getMonth() - 12)));

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/gets/top-spenders?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=${10}`, {
                credentials: 'include',
            });
            const data = await res.json();
            setTopCustomers(data.data || []);
        } catch (err) {
            console.error(err);

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
        labels: topCustomers.map(customer => `${customer._id.firstName} ${customer._id.lastName}`),
        datasets: [
            {
                label: 'Top Spenders',
                data: topCustomers.map(customer => Math.max(customer.totalPaidAmount, 1)),
                backgroundColor: topCustomers.map((_, index) =>
                    index % 2 === 0 ? '#14ae5c' : '#fd602b'
                ),
                hoverBackgroundColor: topCustomers.map((_, index) =>
                    index % 2 === 0 ? '#14ae4c' : '#fd601b'
                ),
                borderWidth: 0,
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    autoSkip: false,
                    color: textColor,
                    font: { size: 12 },
                },
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColor,
                    font: { size: 12 },
                },
                grid: { color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" },
            },
        },
        plugins: {
            datalabels: {
                color: theme === "dark" ? "#ffffff" : "#000000",
                font: {
                    size: 12,
                    weight: "bold",
                },
                align: "center",
                anchor: "center",
                formatter: (value) => `${value.toFixed(2)}`,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const customer = topCustomers[tooltipItem.dataIndex];
                        return `${customer._id.firstName} ${customer._id.lastName} - Total Paid: $${customer.totalPaidAmount}`;
                    },
                },
            },
            legend: { display: false },
        },
    };

    const handleStartDateChange = (date) => {
        localStorage.setItem("top_spenders_start_date", JSON.stringify(date))
        setStartDate(date);
    };

    const handleEndDateChange = (date) => {
        localStorage.setItem("top_spenders_end_date", JSON.stringify(date))
        setEndDate(date);
    };
    useEffect(() => {
        const previousStartDate = localStorage.getItem("top_spenders_start_date");
        const previousEndDate = localStorage.getItem("top_spenders_end_date");

        const parseDate = (date) => {
            try {
                if (date) {
                    return new Date(JSON.parse(date));
                } else {
                    return null
                }
            } catch {
                return null;
            }
        };

        const validStartDate = parseDate(previousStartDate) || new Date(new Date().setMonth(new Date().getMonth() - 12));
        const validEndDate = parseDate(previousEndDate) || new Date();
        setStartDate(validStartDate);
        setEndDate(validEndDate);
        fetchData();
    }, []);
    return (
        <div className='container min-h-[658px] mx-auto p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg relative'>
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
                        <h2 className="text-2xl font-bold">Top 10 Spenders</h2>
                        <p className="text-gray-600 dark:text-gray-400">View spending data for the selected date range.</p>
                    </div>
                    <RangeDatepicker endDate={endDate} startDate={startDate} fetchData={fetchData} handleEndDateChange={handleEndDateChange} handleStartDateChange={handleStartDateChange} />

                    <div className="h-96 w-full">
                        {topCustomers.length > 0 ? (
                            <Bar data={chartData} options={options} />
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">No spenders found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TopSpenders;
