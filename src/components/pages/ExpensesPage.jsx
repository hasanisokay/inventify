'use client'

import { useState } from "react";
import ExpenseModal from "../modal/ExpenseModal";
import SearchBar from "../SearchBar/SearchBar";
import DeleteSVG from "../svg/DeleteSVG";
import toast from "react-hot-toast";
import NameSort from "../sort/NameSort";


const ExpensesPage = ({ e }) => {

    const [openExpenseModal, setOpenExpenseModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const handleRowClick = (item) => {
        setSelectedExpense(item);
        setOpenExpenseModal(true);
    };
    const handleDelete = async (id) => {
        const res = await fetch("/api/deletes/delete-expense", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id }),
            credentials: 'include'
        })
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message)
            e = e.filter((i) => i._id !== id);
            // setExpenses((prev) => {
            //     const filteredItems = prev.filter((i) => i._id !== id)
            //     return filteredItems
            // })
        } else {
            toast.error(data.message)
        }

    }

    return (
        <div className="py-6">
            <h1 className="text-2xl font-semibold mb-4 text-center">Expenses</h1>
            <div className="overflow-x-auto">
                <SearchBar placeholder={'Search with category, reference or customer'} />
                <p className="h-[40px]"></p>
                <table className="item-table table-fixed">
                    <thead className="">
                        <tr>
                            <th className="text-left px-6 py-3 font-semibold">
                                <NameSort name={"Date"} topValue={"newest"} lowValue={"oldest"} />
                            </th>

                            <th className="text-left px-6 py-3 font-semibold max-w-[200px] whitespace-nowrap h-auto max-h-[200px] ">Reference</th>
                            <th className="text-left px-6 py-3 font-semibold ">
                                <NameSort name={"Customer"} topValue={"name_dsc"} lowValue={"name_asc"} />
                            </th>
                            <th className="text-right px-6 py-3 font-semibold ">
                                <NameSort name={"Amount"} topValue={"highest_expense"} lowValue={"lowest_expense"} />
                            </th>
                            <th className="text-left px-6 py-3 font-semibold ">Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {e?.map((item) => (
                            <tr onClick={() => handleRowClick(item)} key={item._id} className="border-b cursor-pointer group dark:text-white text-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-500">
                                <td className="px-6 py-4 ">

                                    <div className="flex items-center justify-between">
                                        <p> {new Date(item.date).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })}</p>
                                        <button
                                            className="text-red-500 opacity-0 group-hover:opacity-100  "
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const confirmed = window.confirm("Sure to delete this item?")
                                                if (confirmed) {
                                                    handleDelete(item?._id)
                                                }

                                            }}
                                            title="Delete this item"
                                        >
                                            <DeleteSVG height={'16px'} width={"16px"} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 max-w-[200px]  whitespace-nowrap overflow-hidden text-ellipsis max-h-[200px] ">{item.reference}</td>
                                <td className="px-6 py-4  whitespace-nowrap overflow-hidden text-ellipsis">
                                    {item.customer.firstName} {item.customer.lastName}
                                </td>
                                <td className="px-6 py-4 text-right ">{item.total} BDT</td>
                                <td className="px-6 py-4 ">
                                    {item.itemized ? "Itemized" : item.category || "N/A"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <ExpenseModal
                    setOpenModal={setOpenExpenseModal}
                    openModal={openExpenseModal}
                    item={selectedExpense}
                    setItems={setSelectedExpense}
                />
            </div>
        </div>
    );
};

export default ExpensesPage;
