import ThemeToggle from "../toggles/ThemeToggle";
import NavLink from "./NavLink";

const MainNav = () => {

    const menu = (
        <ul className="md:flex-row flex-col flex items-center md:space-y-0 space-y-4">
            <li className="duration-300 lg:hover:scale-110 active:scale-110 lg:active:scale-100">
                <NavLink activeClasses={"text-[#0000FF] dark:text-[#00e76f]"} href="/" aria-label="Home Page">
                    {"Home"}
                </NavLink>
            </li>
            <li className="duration-300 lg:hover:scale-110 active:scale-110 lg:active:scale-100">
                <NavLink activeClasses={"text-[#0000FF] dark:text-[#00e76f]"} href="/blogs" aria-label="Blogs Page">
                    {"Blogs"}
                </NavLink>
            </li>
            {currentUser && <li className="duration-300 lg:hover:scale-110 active:scale-110 lg:active:scale-100">
                <NavLink activeClasses={"text-[#0000FF] dark:text-[#00e76f]"} href="/admin" aria-label="Admin Page">
                    {"Admin"}
                </NavLink>
            </li>}
            <li className="duration-300 lg:hover:scale-110 active:scale-110 lg:active:scale-100">
                <NavLink activeClasses={"text-[#0000FF] dark:text-[#00e76f]"} href="/others" aria-label="Others Page">
                    {"Others"}
                </NavLink>
            </li>
            <li className="duration-300 lg:hover:scale-110 active:scale-110 lg:active:scale-100">
                <NavLink activeClasses={"text-[#0000FF] dark:text-[#00e76f]"} href='/opinions' aria-label="Opinions Page">
                    {"Opinions"}
                </NavLink>
            </li>
            <li className="duration-300 lg:hover:scale-110 active:scale-110 lg:active:scale-100">
                <NavLink activeClasses={"text-[#0000FF] dark:text-[#00e76f]"} href="/search" aria-label="Search Page">
                    {"Search"}
                </NavLink>
            </li>
            <li className="duration-300 lg:hover:scale-110 active:scale-110 lg:active:scale-100">
                <NavLink activeClasses={"text-[#0000FF] dark:text-[#00e76f]"} href="/about" aria-label="About Page">
                    {"About"}
                </NavLink>
            </li>
            <li className="duration-300 lg:hover:scale-110 active:scale-110 lg:active:scale-100">
                <ThemeToggle />
            </li>
        </ul>
    );
    return (
        <nav>
            
        </nav>
    );
};

export default MainNav;