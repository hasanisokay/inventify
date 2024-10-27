'use client'
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ItemModal from "../modal/ItemModal";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { useRouter } from "next/navigation";

const ItemsPage = ({ i }) => {
    const router = useRouter();
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState(i)
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
        const res = await fetch("/api/deletes/delete-item", {
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
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Price</th>
                        <th className="border border-gray-300 p-2 text-left">Unit</th>
                        <th className="border border-gray-300 p-2 text-left">Total Sold</th>
                    </tr>
                </thead>
                <tbody>
                    {items?.map((i) => (
                        <tr
                            key={i._id}
                            className="hover:bg-gray-100 cursor-pointer group"
                            onClick={() => handleRowClick(i)}
                        >
                            <td className="border border-gray-300 p-2">{i.name}

                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100">
                                    <button
                                        className="text-blue-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/${activeOrg}/items/new?id=${i._id}`)
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(i?._id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>

                            </td>
                            <td className="border border-gray-300 p-2">{i?.sellingPrice?.split(" ")[1] || 0}</td>
                            <td className="border border-gray-300 p-2">{i?.unit}</td>
                            <td className="border border-gray-300 p-2">{i?.totalOrder}</td>
                            {/* <td className="border border-gray-300 p-2">{c?.currency || "BDT "} {c?.totalPaid}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedItem && (
                <ItemModal
                    setOpenModal={setOpenModal}
                    openModal={openModal}
                    item={selectedItem}
                />
            )}
        </div>
    );
};

export default ItemsPage;