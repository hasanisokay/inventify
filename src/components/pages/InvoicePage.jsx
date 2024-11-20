'use client'
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import Link from "next/link";
import InvoiceModal from "../modal/InvoiceModal";
import AuthContext from "@/contexts/AuthContext.mjs";
import PrintInvoiceModal from "../modal/PrintInvoiceModal";
import markAsPaid from "@/utils/markAsPaid.mjs";
import EditSVG from "../svg/EditSVG";
import DeleteSVG from "../svg/DeleteSVG";
import PrintSVG from "./PrintSVG";
import CheckSVG from "./CheckSVG";
import Loading from "../loader/Loading";
import { useRouter } from "next/navigation";
import SearchBar from "../SearchBar/SearchBar";

const InvoicePage = ({ invoices: i }) => {
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [invoices, setItems] = useState(i);
    const [loading, setLoading] = useState(false);
    const [activeOrg, setActiveOrg] = useState()
    const { activeOrganization } = useContext(AuthContext);
    const [selectedSort, setSelectedSort] = useState('newest');

    const [openInvoicePrintModal, setOpenInvoicePrintModal] = useState(false);
    const handleRowClick = (item) => {
        setSelectedItem(item);
        setOpenInvoiceModal(true);
    };
    const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null)
    useEffect(() => {
        (async () => {
            const a = await getActiveOrg();
            setActiveOrg(a);
        })()
    }, [])

    useEffect(() => {
        setItems(i);
    }, [i]);
    const handleDelete = async (id) => {
        const res = await fetch("/api/deletes/delete-invoice", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ invoiceNumber: id }),
            credentials: 'include'
        })
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message)
            setItems((prev) => {
                const filteredItems = prev.filter((i) => i._id !== id)
                return filteredItems
            })
        } else {
            toast.error(data.message)
        }

    }
    useEffect(() => {
        if (!openInvoiceModal) {

            setSelectedItem(null)
        }
    }, [openInvoiceModal])
    const handlePrint = async (inv) => {
        setLoading(true)
        const res = await fetch(`/api/gets/invoice?id=${inv?._id}`);
        const data = await res.json();
        if (data.status === 200) {
            setSelectedInvoiceForPrint({ ...data.data, ...inv });
        } else {
            console.error("Failed to fetch order data");
        }
        setLoading(false)
    }
    useEffect(() => {
        if (selectedInvoiceForPrint) {
            setOpenInvoicePrintModal(true)
        }
    }, [selectedInvoiceForPrint])

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
        if (s === "top-due") {
            if (selectedSort === "top-due") {
                setSelectedSort('top-paid')
            }
            else {
                setSelectedSort("top-due")
            }
        }
        if (s === "top-paid") {
            if (selectedSort === "top-paid") {
                setSelectedSort('top-due')
            }
            else {
                setSelectedSort("top-paid")
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


    return (
        <div className="w-full">
            {loading && <Loading loading={loading} />}
            <h1 className="text-2xl font-semibold mb-4">Invoices</h1>
            <SearchBar placeholder={"Search with items or customer name"}/>
            <table className="item-table item-table-large-first-child duration-300">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border border-gray-300 p-2 text-left">Customer</th>
                        <th className="border border-gray-300 p-2 text-left">Invoice</th>
                        <th className="border border-gray-300 p-2 text-left">
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
                        <th className="border border-gray-300 p-2 text-left">Tax</th>
                        <th className="border border-gray-300 p-2 text-left">

                            <div className="flex items-center justify-start gap-2">
                                Paid
                                <div className="flex flex-col cursor-pointer text-gray-500">
                                    <svg
                                        onClick={() => handleAmountSort("top-paid")}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`w-[8px] h-[8px] ${selectedSort === "top-paid" && "text-gray-800"}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                    </svg>
                                    <svg
                                        onClick={() => handleAmountSort("top-due")}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`w-[8px] h-[8px] ${selectedSort === "top-due" && "text-gray-800"}`}
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
                        <th className="border border-gray-300 p-2 text-left">
                        <div className="flex items-center justify-start gap-2">
                                Due
                                <div className="flex flex-col cursor-pointer text-gray-500">
                                    <svg
                                        onClick={() => handleAmountSort("top-due")}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`w-[8px] h-[8px] ${selectedSort === "top-due" && "text-gray-800"}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                    </svg>
                                    <svg
                                        onClick={() => handleAmountSort("top-paid")}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`w-[8px] h-[8px] ${selectedSort === "top-paid" && "text-gray-800"}`}
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
                        <th className="border border-gray-300 p-2 text-left">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices?.map((i) => (
                        <tr
                            key={i._id}
                            className="hover:bg-gray-100 cursor-pointer group"
                            onClick={() => handleRowClick(i)}
                        >
                            <td className="border border-gray-300 px-2 py-3">
                                {i.customer.firstName} {i.customer.lastName}

                                <div className="flex justify-between opacity-0 group-hover:opacity-100 duration-500">

                                    <Link
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-blue-500 hover:underline"
                                        href={`/${activeOrg}/invoices/new?id=${i._id}`}
                                        title="Edit this invoice"
                                    >
                                        <EditSVG />
                                    </Link>
                                    <button
                                        className="text-green-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrint(i)
                                        }}
                                        title="Print This Invoice"
                                    >
                                        <PrintSVG />
                                    </button>

                                    <button
                                        className="text-green-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (i.dueAmount === 0) return toast.error("No Due.")
                                            const confirmed = window.confirm("Sure to mark as fully paid?")
                                            if (confirmed) {
                                                markAsPaid(i)
                                            }
                                        }}
                                        title="Mark As Fully Paid"
                                    >
                                        <CheckSVG />
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const confirmed = window.confirm("Sure to delete this invoice?")
                                            if (confirmed) {
                                                handleDelete(i?.invoiceNumber)
                                            }
                                        }}
                                        title="Delete This Invoice"
                                    >
                                        <DeleteSVG />
                                    </button>

                                </div>

                            </td>
                            <td className="border border-gray-300 p-2">{i.invoiceNumber}</td>
                            <td className="border border-gray-300 p-2">{new Date(i.invoiceDate).toLocaleString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                            })}</td>
                            <td className="border border-gray-300 p-2">{i?.totalTax}</td>
                            <td className="border border-gray-300 p-2 font-semibold">{i?.paidAmount}</td>
                            <td className="border border-gray-300 font-semibold dark:text-yellow-400 text-red-500 p-2">{i?.dueAmount}</td>
                            <td className="border border-gray-300 p-2 font-semibold">{i?.total}</td>
                            {/* <td className="border border-gray-300 p-2">{c?.currency || "BDT "} {c?.totalPaid}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedItem && (
                <InvoiceModal
                    setOpenModal={setOpenInvoiceModal}
                    openModal={openInvoiceModal}
                    item={selectedItem}
                />
            )}
            {openInvoicePrintModal && <PrintInvoiceModal
                customerInfo={selectedInvoiceForPrint.customer}
                paidAmount={selectedInvoiceForPrint.paidAmount}
                total={selectedInvoiceForPrint.total}
                shippingCharge={selectedInvoiceForPrint.shippingCharge}
                items={selectedInvoiceForPrint.items}
                note={selectedInvoiceForPrint.note}
                subtotal={selectedInvoiceForPrint.subtotal}
                discount={selectedInvoiceForPrint.discount}
                totalTax={selectedInvoiceForPrint.totalTax}
                orgInfo={activeOrganization}
                openModal={openInvoicePrintModal}
                setOpenModal={setOpenInvoicePrintModal}
                currency={selectedInvoiceForPrint.currency}
                invoiceDate={selectedInvoiceForPrint.invoiceDate}
                resetStates={setSelectedInvoiceForPrint}
                invoiceNumber={selectedInvoiceForPrint.invoiceNumber}
            />}
        </div>
    );
};

export default InvoicePage;
