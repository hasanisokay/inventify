'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PaginationDefault = ({ p, totalPages }) => {
    const [page, setPage] = useState(p)
    const [hasMounted, setHasMounted] = useState(false)
    const router = useRouter();
    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === totalPages || i === 1 || Math.abs(page - i) < 3 || Math.abs(totalPages - i) < 2) {
                pages.push(
                    <div key={i}>
                        <span className="font-semibold">
                            {Math.abs(totalPages - i) < 2 && Math.abs(totalPages - i) >= 1 &&
                            
                            Math.abs(totalPages - page) > 3 &&  Math.abs(page - i) > 3 && "..."}
                        </span>
                        <span className="font-semibold">
                            {i !==1 && i > 2 && page - i >= 2 &&  "..."}
                        </span>
                        <button
                            onClick={() => setPage(i)}
                            disabled={i === page}
                            className={`h-[30px] rounded text-white w-[40px] mx-1 ${i === page ? 'bg-slate-700' : "bg-blue-600"} `}
                        >
                            {i}
                        </button>
                    </div>

                );
            }

        }
        return pages;
    };
    useEffect(() => {
        if (hasMounted) {
            const query = new URLSearchParams(window.location.search);
            query.set('page', page);
            router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
        } else {
            setHasMounted(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);
    return (
        <div className="flex flex-wrap h-auto w-[420px] mt-4 items-center mx-auto">
            {renderPageNumbers()}
        </div>
    );
};

export default PaginationDefault;
