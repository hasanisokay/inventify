'use client';
import TopSpenders from './top-sepnders/TopSpenders';
import TopDebtors from './top-debtors/TopDebtors';
import TopItems from './top-items/TopItems';
const Analytics = () => {
    return (
        <div className='flex flex-col gap-10 my-10'>
            <TopItems />
            <TopSpenders />
            <TopDebtors />
        </div>
    );
};

export default Analytics;
