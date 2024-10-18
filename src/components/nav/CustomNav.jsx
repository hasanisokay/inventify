'use client'
import getActiveOrg from '@/utils/getActiveOrg.mjs';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavLink from './NavLink';

const CustomNav = ({ items = null, customer = null, invoice = null }) => {
    const [activeOrgId, setActiveOrgId] = useState(null);
    const [url, setUrl] = useState("");
    const path = usePathname();

    useEffect(() => {
        (async () => {
            const a = await getActiveOrg();
            setActiveOrgId(a);
        })()
    }, [])

    useEffect(() => {
        if (items) {
            setUrl('items')
        } else if (customer) {
            setUrl("customers")
        } else if (invoice) {
            setUrl("invoices")
        }
    }, [items, customer, invoice])

    return (
        <nav>
            <ul className='secondary-nav'>
                <li className="btn-nav">
                    <NavLink activeClasses={`bg-blue-600 hover:bg-blue-400 rounded`} inactiveClasses={"rounded hover:bg-slate-500 bg-slate-700"} href={`/${activeOrgId}/${url}/new`}> Add New <span className='font-bold'>+</span> </NavLink>
                </li>
                {!path.includes("/invoices") && <li className="btn-nav">
                    <NavLink activeClasses={`bg-blue-600 hover:bg-blue-400 flex gap-2  rounded`} inactiveClasses={"rounded hover:bg-slate-500 bg-slate-700 flex gap-2"} href={`/${activeOrgId}/${url}/import`}>Import <span className='font-semibold'>&darr;</span> </NavLink>
                </li>}
            </ul>
        </nav>
    );
};

export default CustomNav;