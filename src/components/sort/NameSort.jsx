'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const NameSort = ({name, topValue, lowValue}) => {
    const router = useRouter()
    const [selectedSort, setSelectedSort] = useState("");
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        if (hasMounted) {
            const query = new URLSearchParams(window.location.search);
            query.set('sort', selectedSort);
            router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
        } else {
            setHasMounted(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSort]);

    return (
        <div className="flex items-center gap-2">
            <span onClick={() => setSelectedSort(prev => prev === topValue ? lowValue : topValue)} className="cursor-pointer">{name || "Name"}</span>
            <div className="flex flex-col cursor-pointer text-gray-500">
                <svg
                    onClick={() => setSelectedSort(prev => prev === topValue ? lowValue : topValue)}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-[8px] h-[8px] ${selectedSort === topValue && "text-gray-800"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="5"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                <svg
                    onClick={() => setSelectedSort(prev => prev === lowValue ? topValue : lowValue)}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-[8px] h-[8px] ${selectedSort === lowValue && "text-gray-800"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="5"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
};

export default NameSort;