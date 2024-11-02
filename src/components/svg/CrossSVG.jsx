import useTheme from "@/hooks/useTheme.mjs"

const CrossSVG = (props) => {
    const { theme } = useTheme();
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 25 25"
    >
        <g id="SVGRepo_iconCarrier">
            <g
                id="Page-1"
                fill="none"
                fillRule="evenodd"
                stroke="none"
                strokeWidth="1"
            >
                <g id="Icon-Set-Filled" fill={theme === "light" ? "#3b3b3b" : "#fff"} transform="translate(-469 -1041)">
                    <path
                        id="cross"
                        d="m487.148 1053.48 5.665-5.66a4 4 0 0 0 0-5.66 3.996 3.996 0 0 0-5.665 0l-5.664 5.66-5.664-5.66a3.994 3.994 0 0 0-5.664 0 4 4 0 0 0 0 5.66l5.664 5.66-5.664 5.67a4 4 0 0 0 0 5.66 3.994 3.994 0 0 0 5.664 0l5.664-5.66 5.664 5.66a3.996 3.996 0 0 0 5.665 0 4 4 0 0 0 0-5.66z"
                    ></path>
                </g>
            </g>
        </g>
    </svg>
};

export default CrossSVG;
