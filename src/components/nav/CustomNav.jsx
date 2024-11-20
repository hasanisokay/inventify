'use client'
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavLink from './NavLink';

const CustomNav = ({ items = null, customer = null, invoice = null, expenses = null, orgId }) => {
    const [activeOrgId, setActiveOrgId] = useState(orgId);
    const [url, setUrl] = useState("");
    const path = usePathname();

    useEffect(() => {
        if (items) {
            setUrl('items')
        } else if (customer) {
            setUrl("customers")
        } else if (invoice) {
            setUrl("invoices")
        }
        else if (expenses) {
            setUrl("expenses")
        }
    }, [items, customer, invoice, expenses])

    return (
        <nav>
            <ul className='secondary-nav text-white'>
                <li>
                    <NavLink activeClasses={`bg-blue-600 hover:bg-blue-400 rounded-lg`} inactiveClasses={"rounded-lg hover:bg-slate-500 bg-slate-700"} href={`/${activeOrgId}/${url}/new`}> Add New <span className='font-bold'>+</span> </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default CustomNav;