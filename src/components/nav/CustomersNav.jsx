'use client'
import AuthContext from '@/contexts/AuthContext.mjs';
import Link from 'next/link';
import React, { useContext } from 'react';

const CustomersNav = () => {
    const { activeOrganization } = useContext(AuthContext);
    const activeOrgId = activeOrganization?.orgId;
    return (
        <nav>
        <ul className='secondary-nav'>
            <li className="btn-nav">
                <Link href={`/${activeOrgId}/customers/new`}> Add New Item </Link>
            </li>
            <li className="btn-nav">
                <Link href={`/${activeOrgId}/customers/import`}>Import</Link>
            </li>
        </ul>
    </nav>
    );
};

export default CustomersNav;