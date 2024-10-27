'use client'
import { limitOptions } from '@/constants/options.mjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Select from 'react-select';

const BarInInvoices = ({ sort, limit, selectId, }) => {
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);
    const [selectedSort, setSelectedSort] = useState({ value: sort, label: (sort === 'newest' && 'Newest' || sort === 'top-paid' && 'Top Paid' || sort === 'top-due' && 'With Due') });
    const [selectedLimit, setSelectedLimit] = useState({ value: limit, label: `${limit} items per page` });
    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'top-paid', label: 'Top Paid' },
        { value: 'top-due', label: 'With Due' },
    ];


    useEffect(() => {
        if (hasMounted) {
            const query = new URLSearchParams(window.location.search);
            query.set('sort', selectedSort.value);
            query.set('limit', selectedLimit.value);
            if (limit !== selectedLimit.value) {
                query.set("page", 1)
            }
            router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
        } else {
            setHasMounted(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSort, selectedLimit]);

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

export default BarInInvoices;

