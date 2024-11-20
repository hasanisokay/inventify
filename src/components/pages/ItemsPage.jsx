'use client';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ItemModal from "../modal/ItemModal";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { useRouter } from "next/navigation";
import EditSVG from "../svg/EditSVG";
import DeleteSVG from "../svg/DeleteSVG";
import SearchBar from "../SearchBar/SearchBar";
import NotebookSVG from "../svg/NotebookSVG";

const ItemsPage = ({ i }) => {
    const router = useRouter();
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState(i);
    const [activeOrg, setActiveOrg] = useState();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setOpenModal(true);
    };

    const handleSelectItem = (id) => {
        setSelectedItems((prev) => {
            if (prev.includes(id)) {
                return prev.filter((itemId) => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map((item) => item._id));
        }
    };

    const handleDeleteBulk = async () => {
        const res = await fetch("/api/deletes/delete-items", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ids: selectedItems }),
            credentials: 'include'
        });
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message);
            setItems((prev) => prev.filter((i) => !selectedItems.includes(i._id)));
            setSelectedItems([]);
        } else {
            toast.error(data.message);
        }
    };

    const handleMarkInactiveBulk = async (status) => {
        const res = await fetch("/api/updates/mark-items-as-inactive", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ids: selectedItems, status }),
            credentials: 'include'
        });
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message);
            setItems((prev) =>
                prev.map((item) =>
                    selectedItems.includes(item._id) ? { ...item, status: status } : item
                )
            );
            setSelectedItems([]);
        } else {
            toast.error(data.message);
        }
    };

    useEffect(() => {
        (async () => {
            const a = await getActiveOrg();
            setActiveOrg(a);
        })();
    }, []);

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
        });
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message);
            setItems((prev) => {
                const filteredItems = prev.filter((i) => i._id !== id);
                return filteredItems;
            });
        } else {
            toast.error(data.message);
        }
    };

    useEffect(() => {
        if (!openModal) {
            setSelectedItem(null);
        }
    }, [openModal]);

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Items</h1>
            <SearchBar placeholder={'Search with name or description'} />

            {/* Bulk Actions */}
            <div className="h-[40px]">
                {selectedItems?.length > 0 && <div className="flex gap-4 mb-4">
                    <button
                        className=" btn-ghost"
                        onClick={handleDeleteBulk}
                        disabled={selectedItems.length === 0}
                    >
                        Delete Selected
                    </button>
                    <button
                        className=" btn-ghost"
                        onClick={() => handleMarkInactiveBulk("Inactive")}
                        disabled={selectedItems.length === 0}
                    >
                        Mark as Inactive
                    </button>
                    <button
                        className=" btn-ghost"
                        onClick={() => handleMarkInactiveBulk("Active")}
                        disabled={selectedItems.length === 0}
                    >
                        Mark as Active
                    </button>
                </div>}
            </div>
            <table className="item-table item-table-small-first-child">
                <thead>
                    <tr>
                        <th className="border w-5 border-gray-300 p-2 text-left">
                            <input
                                type="checkbox"
                                checked={selectedItems.length === items.length}
                                onChange={handleSelectAll}
                                className="m-0"
                            />
                        </th>
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Price</th>
                        <th className="border border-gray-300 p-2 text-left">Unit</th>
                        <th className="border border-gray-300 p-2 text-left">Total Sold</th>
                        <th className="border border-gray-300 p-2 text-left">Status</th>
                        <th className="border border-gray-300 p-2 text-left">Actions</th> {/* Add action column */}
                    </tr>
                </thead>
                <tbody>
                    {items?.map((i) => (
                        <tr key={i._id} className="hover:bg-gray-100">
                            <td className="border border-gray-300 p-2 w-5">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(i._id)}
                                    onChange={() => handleSelectItem(i._id)}
                                    className="m-0"
                                />
                            </td>
                            <td className="border border-gray-300 p-2">{i.name}</td>
                            <td className="border border-gray-300 p-2">{i?.sellingPrice?.split(" ")[1] || 0}</td>
                            <td className="border border-gray-300 p-2">{i?.unit}</td>
                            <td className="border border-gray-300 p-2">{i?.totalOrder}</td>
                            <td className="border border-gray-300 p-2">
                                <span
                                    className={`font-semibold ${i.status === "Active" ? "text-green-500" : "text-red-500"}`}
                                >
                                    {i?.status}
                                </span>
                            </td>
                            {/* Action Buttons Column */}
                            <td className="border border-gray-300 p-2">
                                <div className="flex gap-4 justify-start">
                         
                                    <button
                                        className="text-blue-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click from triggering modal
                                            setSelectedItem(i);
                                            setOpenModal(true); // Open the modal
                                        }}
                                        title="See details"
                                    >
                                        <NotebookSVG />
                                    </button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/${activeOrg}/items/new?id=${i._id }`)
                                    }} >
                                        <EditSVG />
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const confirmed = window.confirm("Sure to delete this item?");
                                            if (confirmed) {
                                                handleDelete(i?._id);
                                            }
                                        }}
                                        title="Delete this item"
                                    >
                                        <DeleteSVG />
                                    </button>
                                </div>
                            </td>
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
