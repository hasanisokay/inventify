
const DeleteSVG = ({width,height}) => {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ||"24"}
        height={height || "24"}
        fill="none"
        viewBox="0 0 24 24"
      >
        <g
          id="SVGRepo_iconCarrier"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M10 11v6M14 11v6M4 7h16M6 7h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3zM9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2H9z"></path>
        </g>
      </svg>    );
};

export default DeleteSVG;