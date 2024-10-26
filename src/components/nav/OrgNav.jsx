'use client'

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import logOut from "@/utils/logOut.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import AuthContext from "@/contexts/AuthContext.mjs";
import NavLink from "./NavLink";
import useTheme from "@/hooks/useTheme.mjs";
import Image from "next/image";
import logo from "@/../../public/logo1.png"
const OrgNav = ({ activeOrg }) => {

    const [activeOrgId, setActiveOrgId] = useState(activeOrg);
    const { activeOrganization } = useContext(AuthContext);

    const [visible, setVisible] = useState(true);
    const { theme } = useTheme();
    const [lastScrollY, setLastScrollY] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const handleScroll = () => {
        if (window.scrollY > lastScrollY) {
            // setVisible(false);
            setMenuOpen(false);
        } else {
            // setVisible(true);
        }
        setLastScrollY(window.scrollY);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastScrollY]);

    useEffect(() => {
        if (activeOrganization) {
            setActiveOrgId(activeOrganization?.orgId);
        }
    }, [activeOrganization]);

    const menu = (
        <ul className="md:flex-row  flex-col flex items-center md:space-y-0 space-y-4">
            <li>
                <NavLink activeClasses={"text-[#00e76f]"} href='/' aria-label="Home Page">
                    Home
                </NavLink>
            </li>
            {activeOrgId && <li>
                <NavLink activeClasses={"text-[#00e76f]"} href={`/${activeOrgId}/customers`} aria-label="Customers Page">
                    Customers
                </NavLink>
            </li>}
            {activeOrgId && <li>
                <NavLink activeClasses={"text-[#00e76f]"} href={`/${activeOrgId}/items`} aria-label="Items Page">
                    Items
                </NavLink>
            </li>}
            {activeOrgId && <li>
                <NavLink activeClasses={"text-[#00e76f]"} href={`/${activeOrgId}/invoices`} aria-label="Invoices Page">
                    Invoices
                </NavLink>
            </li>}
            {activeOrgId && <li>
                <NavLink activeClasses={"text-[#00e76f]"} href={`/${activeOrgId}/payments-received`} aria-label="Payment Received Page">
                    Payments Received
                </NavLink>
            </li>}
            {activeOrgId && <li>
                <NavLink activeClasses={"text-[#00e76f]"} href={`/${activeOrgId}/expenses`} aria-label="Expenses Page">
                    Expenses
                </NavLink>
            </li>}
            <li>
                <button className="px-3 py-1 text-sm font-medium duration-300" onClick={async () => {
                    await logOut();
                    window.location.reload();
                }}>Log Out</button>
            </li>
        </ul>
    );

    return (
        <nav
            className={`fixed top-0 left-0 w-full bg-black z-50 transition-transform
            bg-opacity-50 backdrop-blur-sm shadow-md
            duration-300 ${visible ? 'transform-none' : '-translate-y-full'
                }`}
            aria-label="Main Navigation"
            role="navigation"
        >
            <div className="relative text-white dark:text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ul className="h-16 flex items-center justify-between">
                        <li>
                            <Link href={"/"}>  <Image width={200} height={200} alt="logo" src={logo} /></Link>
                        </li>
                        <li className="hidden md:block">{menu}</li>
                        <li className="block md:hidden">
                            {menuOpen ? (
                                <svg onClick={() => setMenuOpen(!menuOpen)} width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z" fill="#ff0f10" />
                                </svg>
                            ) : (
                                <svg onClick={() => setMenuOpen(!menuOpen)} width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 18L20 18" stroke={theme === "dark" ? "#d9eff1" : "#000000"} strokeWidth="2" strokeLinecap="round" />
                                    <path d="M4 12L20 12" stroke={theme === "dark" ? "#d9eff1" : "#000000"} strokeWidth="2" strokeLinecap="round" />
                                    <path d="M4 6L20 6" stroke={theme === "dark" ? "#d9eff1" : "#000000"} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            )}
                        </li>
                    </ul>
                </div>
                <div
                    className={`absolute top-16 md:hidden bg-black dark:bg-gray-700 dark:bg-opacity-90 text-white bg-opacity-80 left-0 w-full bg-white/5 transition-transform duration-300 border-t border-white/20 dark:border-gray-800/20 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {menu}
                </div>
            </div>
        </nav>
    );
};

export default OrgNav;
