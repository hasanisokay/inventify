'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PaginationDefault = ({ p, totalPages }) => {
    const [page, setPageNow] = useState(p);
    const router = useRouter();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        query.set('page', page);
        router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
    }, [page]);

    const handlePageChange = (newPage) => {
        setPageNow(newPage);
    };

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    disabled={i === page}
                    style={{
                        margin: '0 5px',
                        padding: '5px 10px',
                        backgroundColor: i === page ? '#0070f3' : '#fff',
                        color: i === page ? '#fff' : '#0070f3',
                        border: '1px solid #0070f3',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
            <button
                onClick={() => handlePageChange(page > 1 ? page - 1 : 1)}
                disabled={page === 1}
                style={{ marginRight: '10px' }}
            >
                Previous
            </button>
            {renderPageNumbers()}
            <button
                onClick={() => handlePageChange(page < totalPages ? page + 1 : totalPages)}
                disabled={page === totalPages}
                style={{ marginLeft: '10px' }}
            >
                Next
            </button>
        </div>
    );
};

export default PaginationDefault;
