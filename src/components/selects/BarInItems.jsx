'use client'
import { limitOptions } from '@/constants/options.mjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Select from 'react-select';

const BarInItems = ({ sort, limit, selectId }) => {
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false)
    const [selectedLimit, setSelectedLimit] = useState({ value: limit, label: `${limit} items per page` });
    useEffect(() => {
        if (hasMounted) {
            const query = new URLSearchParams(window.location.search);
            query.set('limit', selectedLimit.value);
            if (limit !== selectedLimit.value) {
                query.set("page", 1)
            }
            router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });

        } else { setHasMounted(true) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLimit]);

    return (
        <div className='flex mb-4 text-black gap-2'>
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

export default BarInItems;

