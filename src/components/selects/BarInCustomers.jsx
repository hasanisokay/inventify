'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Select from 'react-select';

const BarInCustomers = ({ sort, limit, selectId, page }) => {
    const router = useRouter();
    const [selectedSort, setSelectedSort] = useState({ value: sort, label: (sort === 'spenders' && 'Highest Spenders' || sort === 'debtors' && 'Highest Debtors')});
    const [selectedLimit, setSelectedLimit] = useState({ value: limit, label: `${limit} items per page` });
    const sortOptions = [
        { value: 'spenders', label: 'Highest Spenders' },
        { value: 'debtors', label: 'Highest Debtors' },
    ];
    const limitOptions = [
        { value: 100, label: '100 items per page' },
        { value: 200, label: '200 items per page' },
        { value: 500, label: '500 items per page' },
    ];
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        query.set('sort', selectedSort.value);
        query.set('limit', selectedLimit.value);
        router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSort, selectedLimit, page]);

    return (
        <div className='flex mb-4 text-black gap-2'>
            <Select
                defaultValue={selectedSort}
                options={sortOptions}
                onChange={(e) => setSelectedSort(e)}
                className='select-react'
                instanceId={selectId[0]}
            />
            <Select
                defaultValue={selectedLimit}
                options={limitOptions}
                onChange={setSelectedLimit}
                className='select-react'
            instanceId={selectId[1]}
            />
        </div>
    );
};

export default BarInCustomers;

