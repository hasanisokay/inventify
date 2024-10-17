'use client'
import AuthContext from '@/contexts/AuthContext.mjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

const InvoiceNav = () => {
    const { activeOrganization } = useContext(AuthContext);
    const activeOrgId = activeOrganization?.orgId;
    const path = usePathname()

    return (
        <nav>
            <ul className='secondary-nav'>
                <li className="btn-nav">
                    <Link href={`/${activeOrgId}/invoices/new`}>
                        New Invoice
                    </Link>
                </li>
                {path.includes("/invoices/new") && <li className="btn-nav">
                    <Link href={`/${activeOrgId}/invoices`}>
                        Invoices
                    </Link>
                </li>}
            </ul>
        </nav>
    );
};

export default InvoiceNav;