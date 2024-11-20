'use client';
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import Spinner from '@/components/loader/Spinner';
import useTheme from '@/hooks/useTheme.mjs';

// Register required chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const TopItems = () => {
    const { theme } = useTheme();
    const [textColor, setTextColor] = useState("text-white");
    const [topItems, setTopItems] = useState([]);
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(endDate.getMonth() - 1)));
    const [loading, setLoading] = useState(false);

    // Fetch data for top items
    const fetchData = async () => {
        try {

            setLoading(true);
            const res = await fetch(`/api/gets/top-items?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=10`, {
                credentials: 'include'
            });
            const data = await res.json();
            setTopItems(data.data || []);
        } catch (err) {
            console.log(err);

        } finally {
            setLoading(false);

        }
    };

    // Set text color based on theme (light/dark)
    useEffect(() => {
        setTextColor(theme === "dark" ? "text-white" : "text-gray-800");
    }, [theme]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Chart Data
    const chartData = {
        labels: topItems?.map(i => `${i.name}`),
        datasets: [
            {
                label: 'Top Items',
                data: topItems?.map(i => i.totalSoldQuantity),
                backgroundColor: topItems?.map((i, index) => index % 2 === 0 ? '#6c5ce7' : '#fd79a8'), // Gradient colors
                hoverBackgroundColor: topItems?.map((i, index) => index % 2 === 0 ? '#8e44ad' : '#d63031'),
                borderColor: '#fff',
                borderWidth: 1.5,
                barPercentage: 0.9, // Adjusted for wider bars
                categoryPercentage: 0.85,
            },
        ],
    };

    // Chart Options
    const options = {
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    color: theme === "dark" ? "white" : "black", // Adjust text color based on theme
                    autoSkip: false,
                    font: {
                        weight: 'bold',
                    },
                },
                stacked: false,
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: theme === "dark" ? "white" : "black",
                    // Dynamically adjust max value to avoid clipping
                    max: Math.max(...topItems?.map(i => i.totalSoldQuantity)) * 1.2,
                    callback: (value) => value.toLocaleString(),
                },
                grid: {
                    color: theme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', // Light grid for dark mode
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (tooltipItem) => {
                        const item = topItems[tooltipItem.dataIndex];
                        return `${item.name} \n Total Quantity Sold: ${item.totalSoldQuantity} ${item.unit}`;
                    },
                    labelColor: (context) => {
                        return {
                            backgroundColor: 'rgb(255, 0, 0)',
                            borderWidth: 2,
                            borderDash: [2, 2],
                            borderRadius: 2,
                        };
                    },
                    labelTextColor: () => "#c9c6b7",
                },
            },
            legend: {
                display: true,
                labels: {
                    font: {
                        weight: 'bold',
                    },
                },
            },
            datalabels: {
                color: theme === "dark" ? "white" : "black", // Handle dark theme for data labels
                font: {
                    weight: 'bold',
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
        <>
            <div className='container min-h-[658px] mx-auto p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg relative' >

                {loading ? (<div className="absolute inset-0 bg-white dark:bg-gray-600 dark:bg-opacity-50 bg-opacity-20 backdrop-blur-lg flex justify-center items-center z-10">
                    <div className="text-center text-2xl text-gray-800 dark:text-white">
                        <p>Loading...</p>
                        <Spinner />
                    </div>
                </div>) : <>
                    <div className="text-center mb-6">
                        <h2 className={`text-3xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2`}>Top 10 Items</h2>
                        <h3 className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-4`}>Select Date Range for Top 10 Items</h3>
                    </div>

                    <div className="flex gap-8 justify-center mb-8 flex-wrap">
                        <div className="w-[250px]">
                            <label className={`text-sm mr-1 font-medium dark:text-gray-200 text-gray-700`}>From</label>
                            <DatePicker
                                selected={startDate}
                                onChange={handleStartDateChange}
                                className={`w-full p-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                            />
                        </div>
                        <div className="w-[250px]">
                            <label className={`text-sm mr-1 font-medium dark:text-gray-200 text-gray-700`}>To</label>
                            <DatePicker
                                selected={endDate}
                                onChange={handleEndDateChange}
                                filterDate={date => date >= startDate}
                                className={`w-full p-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                            />
                        </div>
                        <button
                            className={`px-6 py-3 dark:bg-indigo-800 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700  transition-all duration-300`}
                            onClick={fetchData}
                        >
                            Get Data
                        </button>
                    </div>
                    <div className="h-[400px] my-8">
                        {topItems?.length > 0 ? (
                            <Bar data={chartData} options={options} />
                        ) : (
                            <p className={`text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>No items found.</p>
                        )}
                    </div>
                </>}
            </div>
        </>
    );
};

export default TopItems;
