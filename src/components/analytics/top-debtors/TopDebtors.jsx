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

const TopDebtors = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [textColor, setTextColor] = useState("#ffffff");
    const [topDebtors, setTopDebtors] = useState([]);
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(endDate.getMonth() - 1)));

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/gets/top-debtors?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=${10}`, {
                credentials: 'include'
            });
            const data = await res.json();
            setTopDebtors(data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setTextColor(theme === "dark" ? "#ffffff" : "#000000")
    }, [theme])

    const chartData = {
        labels: topDebtors.map(customer => `${customer._id.firstName} ${customer._id.lastName}`),
        datasets: [
            {
                label: 'Top Debtors',
                data: topDebtors.map(customer => customer.totalDueAmount), // Assuming you want to show due amount
                backgroundColor: topDebtors.map((_, index) => index % 2 === 0 ? '#171a20' : '#2e2e34'),
                hoverBackgroundColor: '#5a5a5a' ,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 0.1,
                barPercentage: 0.8,
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
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (tooltipItem) => {
                        const customer = topDebtors[tooltipItem.dataIndex];
                        return `${customer._id.firstName} ${customer._id.lastName}\nTotal Due: ${customer.totalDueAmount}\nTotal Paid: ${customer.totalPaidAmount}`;
                    },
                    labelColor: () => ({
                        backgroundColor: 'rgb(255, 0, 0)',
                        borderWidth: 2,
                        borderDash: [2, 2],
                        borderRadius: 2,
                    }),
                    labelTextColor: () => '#c9c6b7',
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

            {loading ? <Spinner /> : <div>
                <h2 className='font-semibold text-xl text-center'>Top 10 Debtors</h2>
                <h3 className='my-2 font-semibold '>Select Date Range for top 10 Debtors</h3>
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
                    {topDebtors.length > 0 ? (
                        <Bar data={chartData} options={options} />
                    ) : (
                        <p>No debtors found.</p>
                    )}
                </div>
            </div>}
        </>
    );
};

export default TopDebtors;
