'use client';

const NewExpenseCategoryModal = ({ openModal, setOpenModal, setCategory, category }) => {


    return (
        <div className="mx-auto flex w-auto items-center justify-center">
            <div
                onClick={() => setOpenModal(false)}
                className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}
            >
                <div
                    onClick={(e_) => e_.stopPropagation()}
                    className={`absolute w-fit min-w-[90%] md:min-w-[500px] max-h-[90%] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 drop-shadow-2xl ${openModal ? 'opacity-1 translate-x-0 duration-300' : '-translate-x-20 opacity-0 duration-150'}`}
                >
                    <div className="px-5 pb-5 pt-3 lg:pb-10 lg:pt-5 lg:px-10">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add New Category</h2>
                            <button
                                onClick={() => setOpenModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                &#10005;
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            setOpenModal(false)
                        }}>
                            <input
                                type="text"
                                placeholder="Enter new category"
                                value={category || ""}
                                onChange={(e) => setCategory(e.target.value)}
                                className="text-input3"
                            />
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewExpenseCategoryModal;
