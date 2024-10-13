import useTheme from "@/hooks/useTheme.mjs";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded focus:outline-none"
        >
            {theme === 'light' ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 3v3m0 12v3m9-9h-3m-12 0H3m15.364 6.364l-2.121-2.121m-8.486 0l-2.121 2.121m0-8.486l2.121-2.121m8.486 0l2.121 2.121"
                    />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 3c1.83 0 3.54.656 4.879 1.76a7.004 7.004 0 010 11.48A6.971 6.971 0 0112 21c-3.86 0-7-3.14-7-7s3.14-7 7-7zm0 2c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5z"
                    />
                </svg>
            )}
        </button>
    );
};

export default ThemeToggle;
