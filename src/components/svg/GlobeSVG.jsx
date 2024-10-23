import React from "react";

const  GlobeSVG =({height, width}) =>{
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || "24px"}
    height={height || "24px"}
    fill="none"
    viewBox="-0.5 0 25 25"
  >
    <g
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path d="M12 22.32c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zM2 12.32h20"></path>
      <path d="M12 22.32c1.933 0 3.5-4.477 3.5-10s-1.567-10-3.5-10-3.5 4.477-3.5 10 1.567 10 3.5 10z"></path>
    </g>
  </svg>
  );
}

export default GlobeSVG;