'use client'
import { useEffect, useMemo, useState } from "react";
import ExpenseModal from "../modal/ExpenseModal";
import SearchBar from "../SearchBar/SearchBar";
import DeleteSVG from "../svg/DeleteSVG";
import toast from "react-hot-toast";
import NameSort from "../sort/NameSort";
import Link from "next/link";
import EditSVG from "../svg/EditSVG";
import NotebookSVG from "../svg/NotebookSVG";
import * as XLSX from "xlsx";
import formatDate from "@/utils/formatDate.mjs";
import getExpenses from "@/utils/getExpenses.mjs";

const ExpensesPage = ({ e, activeOrg }) => {
    const [openExpenseModal, setOpenExpenseModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [expenses, setExpenses] = useState(e);
    const [markedItems, setMarkedItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const filteredExpenses = useMemo(() => {
        return expenses;
    }, [expenses]);


    const getAllExpenses = async () => {
        setLoading(true);
        const expenses = await getExpenses(1, 9999999999, 'newest', "", activeOrg);
        exportToExcel(expenses?.expenses);
        setLoading(false);
    }
    const exportToExcel = (data, filename = `expense_report_${formatDate(new Date())}.xlsx`) => {
        const formattedData = data.map((item) => {
            if (item.itemized) {
                return item.itemizedExpenses.map((expense) => ({
                    _id: item._id,
                    date: item.date,
                    reference: item.reference,
                    total: item.total,
                    category: expense.category,
                    amount: expense.amount,
                    note: expense.note,
                    tax: expense.tax,
                    customer: item.customer?.firstName + item.customer?.lastName || "",
                    billingAddress: item.customer?.billingAddress || "",
                    phone: item.customer?.phone || "",
                }));
            } else {
                return {
                    _id: item._id,
                    date: item.date,
                    reference: item.reference,
                    total: item.total,
                    category: item.category,
                    amount: item.amount,
                    note: item.note,
                    tax: item.tax,
                    customer: item.customer?.firstName + item.customer?.lastName || "",
                    billingAddress: item.customer?.billingAddress || "",
                    phone: item.customer?.phone || "",
                };
            }
        });
        const flattenedData = formattedData.flat();
        const worksheet = XLSX.utils.json_to_sheet(flattenedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

        // Write the file
        XLSX.writeFile(workbook, filename);
    };


    const handleRowClick = (item) => {
        setSelectedExpense(item);
        setOpenExpenseModal(true);
    };
    useEffect(() => {
        setExpenses(e);
    }, [e])


    const handleSelectItem = (id) => {
        setMarkedItems((prev) => {
            if (prev.includes(id)) {
                return prev.filter((itemId) => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };
    const handleSelectAll = () => {
        if (markedItems.length === expenses.length) {
            setMarkedItems([]);
        } else {
            setMarkedItems(expenses.map((item) => item._id));
        }
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
            // e = e.filter((i) => i._id !== id);
            setExpenses((prev) => {
                const filteredItems = prev.filter((i) => i._id !== id)
                return filteredItems
            })
        } else {
            toast.error(data.message)
        }
    }
    const handleDeleteBulk = async () => {
        const confirmed = window.confirm("Sure to delete?")
        if (!confirmed) return;
        const res = await fetch("/api/deletes/delete-expenses", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ids: markedItems }),
            credentials: 'include'
        });
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message);
            setExpenses((prev) => prev.filter((i) => !markedItems.includes(i._id)));
            setMarkedItems([]);
        } else {
            toast.error(data.message);
        }
    };

    return (
        <div className="py-6">
            <h1 className="text-2xl font-semibold mb-4 text-center">Expenses</h1>
            <div className="overflow-x-auto">
                <div className="text-center">
                    <button disabled={loading} className="bg-blue-500 px-2 py-1 rounded text-white" onClick={getAllExpenses}>{loading ? "Loading..." : "Download Excel"}</button>
                </div>
                <SearchBar placeholder={'Search with category, reference or customer'} />
                <div className="h-[40px]">
                    {markedItems?.length > 0 && <div className="flex gap-4 mb-4">
                        <button
                            className=" btn-ghost"
                            onClick={handleDeleteBulk}
                            disabled={markedItems.length === 0}
                        >
                            Delete Selected
                        </button>
                    </div>}
                </div>
                <table className="item-table  item-table-small-first-child item-table-large-second-child table-fixed">
                    <thead className="">
                        <tr>
                            <th className="border w-5 border-gray-300 p-2 text-left">
                                <input
                                    type="checkbox"
                                    checked={markedItems?.length === expenses?.length}
                                    onChange={handleSelectAll}
                                    className="m-0"
                                />
                            </th>
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

                            <th className="px-6 py-3 font-semibold">
                                <NameSort name={"Category"} topValue={"category_asc"} lowValue={"category_dsc"} />
                            </th>

                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses?.map((item) => (
                            <tr key={item._id} className="border-b  group dark:text-white text-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-500">

                                <td className="border border-gray-300 p-2 w-5">
                                    <input
                                        type="checkbox"
                                        checked={markedItems?.includes(item?._id)}
                                        onChange={() => handleSelectItem(item?._id)}
                                        className="m-0"
                                    />
                                </td>
                                <td className="px-6 py-4 ">

                                    <div className="flex items-center justify-between">
                                        <p> {new Date(item.date).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })}</p>
                                        <div className="flex gap-6 items-center">
                                            <button className="text-red-500 opacity-30 group-hover:opacity-100  " onClick={() => handleRowClick(item)}>
                                                <NotebookSVG height={'16px'} width={"16px"} />
                                            </button>
                                            <Link
                                                onClick={(e) => e.stopPropagation()}
                                                className=" opacity-30 group-hover:opacity-100 "
                                                href={`/${activeOrg}/expenses/new?id=${item?._id}`}
                                                title="Edit this expense"
                                            >
                                                <EditSVG height={'16px'} width={'16px'} />
                                            </Link>
                                            <button
                                                className="text-red-500 opacity-30 group-hover:opacity-100  "
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
                                    </div>
                                </td>
                                <td className="px-6 py-4 max-w-[200px]  whitespace-nowrap overflow-hidden text-ellipsis max-h-[200px] ">{item.reference}</td>
                                <td className="px-6 py-4   whitespace-nowrap overflow-hidden text-ellipsis" >
                                    {item.customer.firstName} {item.customer.lastName}
                                </td>
                                <td className="px-6 py-4  text-right ">{item.total} BDT</td>
                                <td className="px-6 py-4">
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
