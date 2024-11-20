'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ExpenseModal from "../modal/ExpenseModal";
import SearchBar from "../SearchBar/SearchBar";
import DeleteSVG from "../svg/DeleteSVG";
import toast from "react-hot-toast";

const ExpensesPage = ({ e }) => {
    const [expenses, setExpenses] = useState(e)

    const [hasMounted, setHasMounted] = useState(false);
    const [selectedSort, setSelectedSort] = useState("newest");
    const [openExpenseModal, setOpenExpenseModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const router = useRouter();
    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'highest_expense', label: 'Highest' },
        { value: 'lowest_expense', label: 'Lowest' },
    ];
    const handleDateSort = (s) => {
        if (s === "newest") {
            if (selectedSort === "newest") {
                setSelectedSort('lowest')
            }
            else {
                setSelectedSort('newest')
            }
        }
        if (s === "oldest") {
            if (selectedSort === "oldest") {
                setSelectedSort('newest')
            } else {
                setSelectedSort('oldest')
            }
        }
    }
    const handleAmountSort = (s) => {
        if (s === "lowest_expense") {
            if (selectedSort === "lowest_expense") {
                setSelectedSort('highest_expense')
            }
            else {
                setSelectedSort("lowest_expense")
            }
        }
        if (s === "highest_expense") {
            if (selectedSort === "highest_expense") {
                setSelectedSort('lowest_expense')
            }
            else {
                setSelectedSort("highest_expense")
            }
        }
    }

    useEffect(() => {
        if (hasMounted) {
            const query = new URLSearchParams(window.location.search);
            query.set('sort', selectedSort);
            router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
        } else {
            setHasMounted(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSort]);

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
            setExpenses((prev) => {
                const filteredItems = prev.filter((i) => i._id !== id)
                return filteredItems
            })
        } else {
            toast.error(data.message)
        }

    }

    return (
        <div className="py-6">
            <h1 className="text-2xl font-semibold mb-4">Expenses</h1>
            <div className="overflow-x-auto">
                <SearchBar placeholder={'Search with category, reference or customer'} />
                <p className="h-[40px]"></p>
                <table className="item-table">
                    <thead className="">
                        <tr>
                            <th className="text-left px-6 py-3 font-semibold">
                                <div className="flex items-center gap-2">
                                    Date
                                    <div className="flex flex-col cursor-pointer text-gray-500">
                                        <svg
                                            onClick={() => handleDateSort("newest")}
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`w-[8px] h-[8px] ${selectedSort === "newest" && "text-gray-800"}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                        </svg>
                                        <svg
                                            onClick={() => handleDateSort("oldest")}
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`w-[8px] h-[8px] ${selectedSort === "oldest" && "text-gray-800"}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </th>

                            <th className="text-left px-6 py-3 font-semibold ">Reference</th>
                            <th className="text-left px-6 py-3 font-semibold ">Customer</th>
                            <th className="text-right px-6 py-3 font-semibold ">
                                <div className="flex items-center justify-start gap-2">
                                    Amount
                                    <div className="flex flex-col cursor-pointer text-gray-500">
                                        <svg
                                            onClick={() => handleAmountSort("highest_expense")}
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`w-[8px] h-[8px] ${selectedSort === "highest_expense" && "text-gray-800"}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                        </svg>
                                        <svg
                                            onClick={() => handleAmountSort("lowest_expense")}
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`w-[8px] h-[8px] ${selectedSort === "lowest_expense" && "text-gray-800"}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </th>
                            <th className="text-left px-6 py-3 font-semibold ">Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses?.map((item) => (
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
                                <td className="px-6 py-4 ">{item.reference}</td>
                                <td className="px-6 py-4 ">
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
