'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({ href, children, activeClasses, inactiveClasses, ...props }) => {
    const path = usePathname();
    return (
        <Link href={href}
            aria-current={(path === href) ? 'page' : undefined}
            {...props}
            className={`px-3 py-1 text-sm font-medium duration-300 
                 ${path === href ? activeClasses : inactiveClasses} `}
        >
            {children}
        </Link>
    );
};

export default NavLink;