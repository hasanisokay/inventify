'use client'
import AuthContext from '@/contexts/AuthContext.mjs';
import Link from 'next/link';
import { useContext } from 'react';

const ItemsNav = () => {
    const { activeOrganization } = useContext(AuthContext);
    const activeOrgId = activeOrganization?.orgId;
    return (
        <nav>
            <ul className='secondary-nav'>
                <li className="btn-nav">
                    <Link href={`/${activeOrgId}/items/new`}> Add New Item </Link>
                </li>
                <li className="btn-nav">
                    <Link href={`/${activeOrgId}/items/import`}>Import</Link>
                </li>
            </ul>
        </nav>
    );
};

export default ItemsNav;