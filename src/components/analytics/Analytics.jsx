'use client';
import TopSpenders from './top-sepnders/TopSpenders';
import TopDebtors from './top-debtors/TopDebtors';
import TopItems from './top-items/TopItems';
import CostSummary from './costs/CostSummary';
import { useEffect, useState } from 'react';
import getActiveOrg from '@/utils/getActiveOrg.mjs';

const Analytics = ({actOrg}) => {
    const [activeOrg, setActiveOrg] = useState(actOrg)
    useEffect(()=>{
        if(!actOrg){
            (async()=>{
                const a = await getActiveOrg();
                setActiveOrg(a);
            })()
        }
    },[])
    if(!activeOrg) return
    return (
        <div className='flex flex-col gap-10 my-10'>
            <CostSummary />
            <TopItems />
            <TopSpenders />
            <TopDebtors />
        </div>
    );
};

export default Analytics;
