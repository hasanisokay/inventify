import "./loading.css";

const Loading = ({ loading }) => {
    return (
        <div className={`transition-transform duration-1000 transform ${loading ? 'translate-y-0' : '-translate-y-full'} w-fit bg-[#ffd43b] translate-x-0 transform rounded px-2 mx-auto mb-4 absolute right-1/2 left-1/2 z-50`}>
            <div className="loading"></div>
        </div>
    );
};

export default Loading;


