/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Spinner from '@/components/loader/Spinner';

ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const CostSummary = () => {
    const [totalDue, setTotalDue] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [totalPaid, setTotalPaid] = useState(undefined);
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/gets/cost-summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
                credentials: 'include'
            });
            const data = await res.json();
            setTotalDue(data.totalDue);
            setTotalPaid(data.totalPaid);
            setLoading(false)
        } catch (err) {
            console.log(err)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const chartData = {
        labels: ['Total Due', 'Total Paid'],
        datasets: [{
            data: [totalDue, totalPaid],
            backgroundColor: ['#e72d2d', '#308853'],
            hoverBackgroundColor: ['#ff0f10', '#1c6c47'],
        }],
    };
    const options = {
        plugins: {
            legend: {
                display: true,
            },
            datalabels: {
                color: '#ffffff',
                formatter: (value) => {
                    return value > 0 ? `${value}` : '';
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
            {loading ? <Spinner /> : <>
                <div>
                    <div className='md:px-10 px-2'>
                        <h2 className='font-semibold text-xl mt-4 mb-2 text-center'>Cost Summary</h2>
                        <h3 className='my-2 font-semibold '>Select Date Range for Cost Summary</h3>
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
                            <button className='btn-purple' onClick={fetchData}>Get Data</button>

                        </div>
                    </div>
                    <div className='items-center justify-center my-10 gap-4 flex flex-wrap'>
                        <div className='flex flex-col items-start justify-start'>
                            {totalPaid && <p><span className='w-[115px] inline-block'>Received:</span> <span className='font-semibold min-w-[100px] inline-block'>{totalPaid}</span></p>}
                            {totalDue && <p> <span className='w-[120px] inline-block'>Due:</span><span className='font-semibold min-w-[100px] inline-block'>{totalDue}</span></p>}
                        </div>
                        <div className='h-[400px] w-fit'>
                            {totalDue > 0 || totalPaid > 0 ? (
                                <Pie data={chartData} options={options} />
                            ) : (
                                <p>No data available for the selected range.</p>
                            )}
                        </div>
                    </div>
                </div>
            </>}
        </>
    );
};

export default CostSummary;
