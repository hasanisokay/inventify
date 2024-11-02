import React from 'react';

const DragSVG = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
        >
            <rect
                width="24"
                height="24"
                x="-12"
                y="-12"
                fill="#FFF"
                rx="0"
                ry="0"
                transform="translate(12 12)"
                vectorEffect="non-scaling-stroke"
                visibility="hidden"
            ></rect>
            <g transform="matrix(.02 0 0 .02 12 12)">
                <rect
                    width="4"
                    height="4"
                    x="-2"
                    y="-2"
                    fill="#808080" // Gray color
                    rx="0"
                    ry="0"
                    transform="matrix(25 0 0 25 -100 -200)"
                    vectorEffect="non-scaling-stroke"
                ></rect>
                <rect
                    width="4"
                    height="4"
                    x="-2"
                    y="-2"
                    fill="#808080" // Gray color
                    rx="0"
                    ry="0"
                    transform="matrix(25 0 0 25 100 -200)"
                    vectorEffect="non-scaling-stroke"
                ></rect>
                <rect
                    width="4"
                    height="4"
                    x="-2"
                    y="-2"
                    fill="#808080" // Gray color
                    rx="0"
                    ry="0"
                    transform="matrix(25 0 0 25 -100 0)"
                    vectorEffect="non-scaling-stroke"
                ></rect>
                <rect
                    width="4"
                    height="4"
                    x="-2"
                    y="-2"
                    fill="#808080" // Gray color
                    rx="0"
                    ry="0"
                    transform="matrix(25 0 0 25 100 0)"
                    vectorEffect="non-scaling-stroke"
                ></rect>
                <rect
                    width="4"
                    height="4"
                    x="-2"
                    y="-2"
                    fill="#808080" // Gray color
                    rx="0"
                    ry="0"
                    transform="matrix(25 0 0 25 -100 200)"
                    vectorEffect="non-scaling-stroke"
                ></rect>
                <rect
                    width="4"
                    height="4"
                    x="-2"
                    y="-2"
                    fill="#808080" // Gray color
                    rx="0"
                    ry="0"
                    transform="matrix(25 0 0 25 100 200)"
                    vectorEffect="non-scaling-stroke"
                ></rect>
                <rect
                    width="32"
                    height="32"
                    x="-16"
                    y="-16"
                    fill="none"
                    rx="0"
                    ry="0"
                    transform="scale(25)"
                    vectorEffect="non-scaling-stroke"
                ></rect>
            </g>
        </svg>
    );
};

export default DragSVG;
