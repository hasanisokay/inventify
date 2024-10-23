'use client'
import useTheme from '@/hooks/useTheme.mjs';

const AddressSVG = ({ height, width }) => {
    return (
      <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || "24px"}
      height={height || "24px"}
      viewBox="0 0 36 36"
    >
      <rect
        width="36"
        height="36"
        x="-18"
        y="-18"
        fill="#FFF"
        rx="0"
        ry="0"
        transform="translate(18 18)"
        vectorEffect="non-scaling-stroke"
        visibility="hidden"
      ></rect>
      <path
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M-3-1l2 2 4-4m4 1.2C7 2.176 3.5 5.4 0 9-3.5 5.4-7 2.176-7-1.8-7-5.776-3.866-9 0-9s7 3.224 7 7.2z"
        transform="matrix(1.5 0 0 1.5 18 18)"
      ></path>
    </svg>
    );
};

export default AddressSVG;
