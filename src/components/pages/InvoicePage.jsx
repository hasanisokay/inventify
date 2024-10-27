'use client'
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InvoiceModal from "../modal/InvoiceModal";

const ItemsPage = ({ invoices: i }) => {
    const router = useRouter();
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [invoices, setItems] = useState(i)
    const [activeOrg, setActiveOrg] = useState()
    const handleRowClick = (item) => {
        setSelectedItem(item);
        setOpenModal(true);
    };

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
        if (!openModal) {

            setSelectedItem(null)
        }
    }, [openModal])

    return (
        <div className="w-full">
            <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border border-gray-300 p-2 text-left">Customer</th>
                        <th className="border border-gray-300 p-2 text-left">Invoice</th>
                        <th className="border border-gray-300 p-2 text-left">Date</th>
                        <th className="border border-gray-300 p-2 text-left">Tax</th>
                        <th className="border border-gray-300 p-2 text-left">Paid</th>
                        <th className="border border-gray-300 p-2 text-left">Due</th>
                        <th className="border border-gray-300 p-2 text-left">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices?.map((i) => (
                        <tr
                            key={i._id}
                            className="hover:bg-gray-100 cursor-pointer group"
                            onClick={() => handleRowClick(i)}
                        >
                            <td className="border border-gray-300 p-2">
                                {i.customer.firstName} {i.customer.lastName}

                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100">
                                    <Link
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-blue-500 hover:underline"
                                        href={`/${activeOrg}/invoices/new?id=${i._id}`}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(i?.invoiceNumber)
                                        }}
                                    >
                                        Delete
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
                            <td className="border border-gray-300 font-semibold text-red-500 p-2">{i?.dueAmount}</td>
                            <td className="border border-gray-300 p-2 font-semibold">{i?.subtotal}</td>
                            {/* <td className="border border-gray-300 p-2">{c?.currency || "BDT "} {c?.totalPaid}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedItem && (
                <InvoiceModal
                    setOpenModal={setOpenModal}
                    openModal={openModal}
                    item={selectedItem}
                />
            )}
        </div>
    );
};

export default ItemsPage;
