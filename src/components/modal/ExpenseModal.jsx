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
                onClick={(e) => e.stopPropagation()} // Prevent closing modal on inner click
                className={`relative w-full max-w-lg max-h-[96%] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 ${openModal ? "translate-y-0 opacity-100 scale-100" : "-translate-y-20 opacity-0 scale-95"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        Expense Details
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

                {/* Content */}
                <div className="mt-6 space-y-4">
                    {/* General Details */}
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Reference</p>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{item.reference}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Date</p>
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                            {new Date(item.date).toLocaleDateString("en-GB")}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Total Amount</p>
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                            {item.total} {item.currency || "BDT"}
                        </p>
                    </div>

                    {item.itemized ? (
                        // Itemized Details
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Itemized Expenses</h4>
                            <ul className="space-y-2">
                                {item?.itemizedExpenses?.map((expense, index) => (
                                    <li
                                        key={index}
                                        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                                    >
                                        <p>
                                            <span className="font-semibold">Category:</span> {expense.category}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Amount:</span> {expense.amount} {item.currency || "BDT"}
                                        </p>
                                        {expense.note && (
                                            <p>
                                                <span className="font-semibold">Note:</span> {expense.note}
                                            </p>
                                        )}
                                        {expense.tax > 0 && <p>
                                            <span className="font-semibold">Tax:</span> {expense.tax} {item.currency || "BDT"}
                                        </p>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        // Non-Itemized Details
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Non-Itemized Expense</h4>
                            <p>
                                <span className="font-semibold">Category:</span> {item.category}
                            </p>
                            <p>
                                <span className="font-semibold">Note:</span> {item.note || "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold">Tax:</span> {item.tax} {item.currency || "BDT"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6">
                    <button
                        onClick={() => {
                            setOpenModal(false);
                            setItems(null);
                        }}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseModal;
