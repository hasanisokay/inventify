import { useEffect, useState } from "react";
import Loading from "../loader/Loading";

const ExpenseModal = ({ openModal, setOpenModal, item, setItems }) => {
    const [loading, setLoading] = useState(false);

    if (loading) {
        return <Loading loading={loading} />;
    }
    if (!item) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Overlay */}
            <div
                onClick={() => {
                    setOpenModal(false);
                    setItems(null);
                }}
                className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${openModal ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />

            {/* Modal */}
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-xl max-h-[96%] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 transform transition-all duration-300 ${openModal ? "translate-y-0 opacity-100 scale-100" : "-translate-y-20 opacity-0 scale-95"
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-500 ">
                        Expense Amount
                    </h3>
                    <button
                        onClick={() => {
                            setOpenModal(false);
                            setItems(null);
                        }}
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                    >
                        ✖
                    </button>
                </div>

                {/* Expense Summary */}

                <p className="text-lg mb-6 font-semibold text-red-400">
                    {item.currency || "BDT"} {item.total.toLocaleString()}
                    <span className="text-xs text-gray-500 ml-2 font-normal">
                        on {new Date(item.date).toLocaleDateString("en-GB")}
                    </span>
                </p>
                <p className="text-xs mb-4  text-gray-700 bg-blue-300 w-fit px-[6px] py-[2px]">
                    {item.itemized ? "Itemized" : "Non Itemized"}
                </p>

                {/* Reference & Customer */}
                <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Ref #
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                        {item.reference || "N/A"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                        Customer
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                        {item.customer?.firstName} {item.customer?.lastName || ""}
                    </p>
                </div>

                {/* Expense Breakdown */}
                {item.itemized ? (
                    <div>
                        <div className="flex justify-between border-b border-t py-1 px-2">
                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                Expense Account
                            </h4>

                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                Amount
                            </h4>
                        </div>

                        {item.itemizedExpenses.map((expense, index) => (
                            <div key={index} className="flex justify-between text-gray-700 dark:text-gray-300 border-b py-1 px-2">
                                <div className="text-sm ">
                                    <p><strong>{expense.category}</strong></p>
                                    <p className="text-gray-600">{expense.note || "N/A"}</p>
                                </div>
                                <div className=" dark:border-gray-700  text-right">
                                    {item.currency || "BDT"} {expense.amount}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between border-b py-1 px-2 bg-slate-100">
                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                Expense Total
                            </h4>

                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                {item.currency || "BDT"}  {item?.total}
                            </h4>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                            Expense Summary
                        </h4>
                        <p className="text-gray-800 font-semibold dark:text-gray-200">
                            Category: {item.category}
                        </p>
                        <p className="text-gray-800 font-semibold dark:text-gray-200">
                            Amount: {item.currency || "BDT"} {item.amount}
                        </p>
                        <p className="text-gray-800 font-semibold dark:text-gray-200">
                            Note: {item.note || "N/A"}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-6">
                    <button
                        onClick={() => {
                            setOpenModal(false);
                            setItems(null);
                        }}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseModal;
