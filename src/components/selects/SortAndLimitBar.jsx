'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Select from 'react-select';

const SortAndLimitBar = ({ sort, limit }) => {
    const router = useRouter();
    const [selectedSort, setSelectedSort] = useState({ value: sort, label: sort === 'newest' ? 'Newest' : 'Oldest' });
    const [selectedLimit, setSelectedLimit] = useState({ value: limit, label: `${limit} items per page` });
    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
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
    }, [selectedSort, selectedLimit]);

    return (
        <div className='flex mb-4 text-black gap-2'>
            <Select
                defaultValue={selectedSort}
                options={sortOptions}
                onChange={(e) => setSelectedSort(e)}
                className='select-react'
            />
            <Select
                defaultValue={selectedLimit}
                options={limitOptions}
                onChange={setSelectedLimit}
                className='select-react'
            />
        </div>
    );
};

export default SortAndLimitBar;

