/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import useTheme from '@/hooks/useTheme.mjs';
import Spinner from '@/components/loader/Spinner';



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const TopSpenders = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [textColor, setTextColor] = useState("#ffffff");
    const [topCustomers, setTopCustomers] = useState([]);
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(endDate.getMonth() - 1)));

    const fetchData = async () => {
        setLoading(true)
        const res = await fetch(`/api/gets/top-spenders?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=${10}`, {
            credentials: 'include'
        });
        const data = await res.json();
        setTopCustomers(data.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        setTextColor(theme === "dark" ? "#ffffff" : "#000000")
    }, [theme])

    const chartData = {
        labels: topCustomers?.map(customer => `${customer._id.firstName} ${customer._id.lastName}`),
        datasets: [
            {
                label: 'Top Spenders',
                data: topCustomers?.map(customer => customer.totalPaidAmount),
                backgroundColor: topCustomers?.map((customer, index) => index % 2 === 0 ? '#5a5a5a' : '#111827'),
                hoverBackgroundColor: "#3d6b6a",

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
                    autoSkip: false,
                    color: textColor
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
                        const customer = topCustomers[tooltipItem.dataIndex];
                        return `${customer._id.firstName} ${customer._id.lastName} \n Total Paid: ${customer.totalPaidAmount} Total Due: ${customer.totalDueAmount}`;
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
        },
    };

    const handleStartDateChange = (date) => {
        if (date <= endDate) {
            setStartDate(date);
        } else {
            // Optionally, set end date to the same as start date if it was invalid
            setStartDate(date);
            setEndDate(date);
        }
    };

    // Handler for end date change
    const handleEndDateChange = (date) => {
        if (date >= startDate) {
            setEndDate(date);
        } else {
            // Optionally, set start date to the same as end date if it was invalid
            setEndDate(date);
            setStartDate(date);
        }
    };
    return (
        <>
            {loading ? <Spinner /> : <div>
                <h2 className='font-semibold text-xl text-center'>Top 10 Spenders</h2>
                <h3 className='my-2 font-semibold '>Select Date Range for top 10 Spenders</h3>
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
                    {topCustomers?.length > 0 ? (
                        <Bar data={chartData} options={options} />
                    ) : (
                        <p>No Spenders found.</p>
                    )}
                </div>
            </div>}
        </>

    );
};

export default TopSpenders;
