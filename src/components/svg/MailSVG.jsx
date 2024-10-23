
const MailSVG = ({height, width}) => {
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
        <g transform="matrix(.56 0 0 .56 18 18)">
          <path
            fill="#231F20"
            d="M43.416 35.812a1 1 0 011.168-1.624L64 48.168V15.475L32.597 38.803a.998.998 0 01-1.194 0L0 15.475v32.693l19.416-13.979a1 1 0 011.168 1.624L0 50.632V52c0 2.211 1.789 4 4 4h56c2.211 0 4-1.789 4-4v-1.368l-20.584-14.82z"
            transform="translate(0 3.74) translate(-32 -35.74)"
            vectorEffect="non-scaling-stroke"
          ></path>
          <path
            fill="#231F20"
            d="M32 36.754l32-23.771V12c0-2.211-1.789-4-4-4H4c-2.211 0-4 1.789-4 4v.982l32 23.772z"
            transform="translate(0 -9.62) translate(-32 -22.38)"
            vectorEffect="non-scaling-stroke"
          ></path>
        </g>
      </svg>    );
};

export default MailSVG;