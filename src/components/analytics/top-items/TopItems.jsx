'use client';
import { useEffect, useState } from 'react';


import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import Spinner from '@/components/loader/Spinner';
import useTheme from '@/hooks/useTheme.mjs';
import RangeDatepicker from '@/components/datepickers/RangeDatepicker';

// Register required chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const TopItems = () => {
    const { theme } = useTheme();
    const [textColor, setTextColor] = useState("text-white");
    const [topItems, setTopItems] = useState([]);
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(endDate.getMonth() - 12)));
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
            console.error(err);

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
        localStorage.setItem("top_items_start_date", JSON.stringify(date))
        setStartDate(date);
    };

    const handleEndDateChange = (date) => {
        localStorage.setItem("top_items_end_date", JSON.stringify(date))
        setEndDate(date);
    };

    useEffect(() => {
        const previousStartDate = localStorage.getItem("top_items_start_date");
        const previousEndDate = localStorage.getItem("top_items_end_date");

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
    
        const validStartDate = parseDate(previousStartDate);
        const validEndDate = parseDate(previousEndDate);
    
        setStartDate(validStartDate || new Date(new Date().setMonth(new Date().getMonth() - 12)));
        setEndDate(validEndDate || new Date());
    }, []);

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
                    <RangeDatepicker endDate={endDate} startDate={startDate} fetchData={fetchData} handleEndDateChange={handleEndDateChange} handleStartDateChange={handleStartDateChange} />
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
