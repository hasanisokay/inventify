'use client'
import useTheme from '@/hooks/useTheme.mjs';

const PhoneSVG = ({height, width}) => {
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
          fill="#1C274C"
          d="M10.038 5.316l.649 1.163c.585 1.05.35 2.426-.572 3.349 0 0-1.12 1.119.91 3.148 2.027 2.027 3.146.91 3.147.91.923-.923 2.3-1.158 3.349-.573l1.163.65c1.585.884 1.772 3.106.379 4.5-.837.836-1.863 1.488-2.996 1.53-1.908.073-5.149-.41-8.4-3.66-3.25-3.251-3.733-6.492-3.66-8.4.043-1.133.694-2.159 1.53-2.996 1.394-1.393 3.616-1.206 4.5.38z"
          transform="matrix(1.5 0 0 1.5 18 18) translate(-12 -12)"
        ></path>
      </svg>
    );
};

export default PhoneSVG;