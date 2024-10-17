'use client'
import AuthContext from "@/contexts/AuthContext.mjs";
import { useContext } from "react";
import Link from "next/link";
import logOut from "@/utils/logOut.mjs";

const OrgNav = () => {
    const { activeOrganization } = useContext(AuthContext);
    const activeOrgId = activeOrganization?.orgId;

    return (
        <nav className="bg-gray-800 p-4">
            {
                activeOrgId && <ul className="flex space-x-4">
                    <li>
                        <Link href={`/`} className="text-white hover:text-gray-300">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${activeOrgId}/customers`} className="text-white hover:text-gray-300">
                            Customers
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${activeOrgId}/items`} className="text-white hover:text-gray-300">
                            Items
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${activeOrgId}/invoices`} className="text-white hover:text-gray-300">
                            Invoices
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${activeOrgId}/payments-received`} className="text-white hover:text-gray-300">
                            Payments Received
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${activeOrgId}/expenses`} className="text-white hover:text-gray-300">
                            Expenses
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${activeOrgId}/reports`} className="text-white hover:text-gray-300">
                            Reports
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${activeOrgId}/advanced-billing`} className="text-white hover:text-gray-300">
                            Advanced Billing
                        </Link>
                    </li>
                    <li>
                        <button className="text-white hover:text-gray-300" onClick={async () => {
                            await logOut()
                            window.location.reload()
                        }}>Log Out</button>

                    </li>
                </ul>
            }
        </nav>
    );
};

export default OrgNav;
