'use client';
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import Spinner from '@/components/loader/Spinner';
import useTheme from '@/hooks/useTheme.mjs';



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const TopItems = () => {
    const { theme } = useTheme();
    const [textColor, setTextColor] = useState("#ffffff");
    const [topItems, setTopItems] = useState([]);
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(endDate.getMonth() - 1)));
    const [loading, setLoading] = useState(false);
    const fetchData = async () => {
        setLoading(true)
        const res = await fetch(`/api/gets/top-items?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=${10}`, {
            credentials: 'include'
        });
        const data = await res.json();
        setTopItems(data.data || []);
        setLoading(false);
    };
    useEffect(() => {
        setTextColor(theme === "dark" ? "#ffffff" : "#000000")
    }, [theme])
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const chartData = {
        labels: topItems?.map(i => `${i.name}`),
        datasets: [
            {
                label: 'Top Items',
                data: topItems?.map(i => i.totalSoldQuantity),
                backgroundColor: topItems?.map((i, index) => index % 2 === 0 ? '#7fb9b9' : '#ffab00'), // Alternating colors
                hoverBackgroundColor: topItems?.map((i, index) => index % 2 === 0 ? '#3bc7c7' : '#d7a540'), // Different hover colors

                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 0.1,

                barPercentage: 0.8, // Adjusted width of the bars
                categoryPercentage: 0.9,


            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    color: textColor,
                    autoSkip: false,
                },
                stacked: false,
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColor,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)', // Optional grid line color
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
                    labelTextColor: () => '#c9c6b7',
                },
            },
            legend: {
                display: true,
            },
            datalabels: {
                color: '#000000',
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
            {loading ? <Spinner /> : <div>
                <h2 className='font-semibold text-xl text-center'>Top 10 Items</h2>
                <h3 className='my-2 font-semibold '>Select Date Range for top 10 items</h3>
                <div className='flex  gap-10 flex-wrap'>
                    <div className='input-container w-[250px]'>
                        <label>
                            From
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            className='text-input'
                        />

                    </div>
                    <div className='input-container w-[250px]'>
                        <label>
                            To
                        </label>
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            filterDate={date => date >= startDate}
                            className='text-input'
                        />
                    </div>
                    <button className='btn-purple' onClick={fetchData}>Fetch Data</button>

                </div>

                <div className='h-[400px] w-full my-10'>

                    {topItems?.length > 0 ? (
                        <Bar data={chartData} options={options} />
                    ) : (
                        <p>No Items found.</p>
                    )}
                </div>
            </div>}

        </>
    );
};

export default TopItems;
