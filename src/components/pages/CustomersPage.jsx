'use client'
import { useEffect, useState } from "react";
import CustomerModal from "../modal/CustomerModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import EditSVG from "../svg/EditSVG";
import DeleteSVG from "../svg/DeleteSVG";


const CustomersPage = ({ c, page: p, }) => {
    const [page, setPage] = useState(p);
    const router = useRouter();
    const [activeOrg, setActiveOrg] = useState("")
    const [openModal, setOpenModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState(c)
    const handleRowClick = (customer) => {
        setSelectedCustomer(customer);
        setOpenModal(true);
    };
    useEffect(() => {
        (async () => {
            const a = await getActiveOrg();
            setActiveOrg(a);
        })()
    }, [])
    useEffect(() => {
        setCustomers(c);
    }, [c]);
    const handleDelete = async (id) => {
        const res = await fetch("/api/deletes/delete-customer", {
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
            setCustomers((prev) => {
                const filteredItems = prev.filter((i) => i._id !== id)
                return filteredItems
            })
        } else {
            toast.error(data.message)
        }
    }
    useEffect(() => {
        if (!openModal) {
            setSelectedCustomer(null)
        }
    }, [openModal])
    return (
        <div className="w-full">
            <table className="item-table">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Phone</th>
                        <th className="border border-gray-300 p-2 text-left">Company</th>
                        <th className="border border-gray-300 p-2 text-left">Total Order</th>

                        <th className="border border-gray-300 p-2 text-left">Due</th>
                        <th className="border border-gray-300 p-2 text-left">Paid</th>
                    </tr>
                </thead>
                <tbody>
                    {customers?.map((c) => (
                        <tr
                            key={c._id}
                            className="hover:bg-gray-100 cursor-pointer group"
                            onClick={() => handleRowClick(c)}
                        >
                            <td className="border border-gray-300 p-2">{c.firstName + " " + c.lastName}

                                <div className="flex gap-10 opacity-0 group-hover:opacity-100 duration-500">
                                    <button
                                        className="text-blue-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/${activeOrg}/customers/new?id=${c._id}`)
                                        }}
                                        title="Edit this customer"
                                    >
                                        <EditSVG />
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const confirmed = window.confirm("Sure to delete this customer?")
                                            if (confirmed) {
                                                handleDelete(c?._id)
                                            }
                                        }}
                                        title="Delete this customer"
                                    >
                                        <DeleteSVG />
                                    </button>
                                </div>

                            </td>
                            <td className="border border-gray-300 p-2">{c?.phone}</td>
                            <td className="border border-gray-300 p-2">{c?.companyName}</td>
                            <td className="border border-gray-300 p-2">{c?.totalOrder}</td>
                            <td className="border border-gray-300 p-2">{c?.currency || "BDT "} {c?.totalDue}</td>
                            <td className="border border-gray-300 p-2">{c?.currency || "BDT "} {c?.totalPaid}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedCustomer && (
                <CustomerModal
                    setOpenModal={setOpenModal}
                    openModal={openModal}
                    customer={selectedCustomer}
                />
            )}
        </div>

    );
};

export default CustomersPage;
