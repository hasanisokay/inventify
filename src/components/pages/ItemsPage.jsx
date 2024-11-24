'use client';
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ItemModal from "../modal/ItemModal";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { useRouter } from "next/navigation";
import EditSVG from "../svg/EditSVG";
import DeleteSVG from "../svg/DeleteSVG";
import SearchBar from "../SearchBar/SearchBar";
import NotebookSVG from "../svg/NotebookSVG";
import RangeDatepicker from "../datepickers/RangeDatepicker";
import getItems from "@/utils/getItems.mjs";
import ItemReportDownloadModal from "../modal/ItemReportDownloadModal";
import Loading from "../loader/Loading";
import AuthContext from "@/contexts/AuthContext.mjs";
import NameSort from "../sort/NameSort";

const ItemsPage = ({ i, actOrg, keyword }) => {
    const router = useRouter();
    const [openModal, setOpenModal] = useState(false);
    const [openItemReportDownloadModal, setOpenItemReportDownloadModal] = useState(false);
    const [itemsForReport, setItemsForReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState(i);
    const [activeOrg, setActiveOrg] = useState(actOrg);
    const [markedItems, setMarkedItems] = useState([]);
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());
    const { currentUser } = useContext(AuthContext);
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
        if (markedItems.length === items.length) {
            setMarkedItems([]);
        } else {
            setMarkedItems(items.map((item) => item._id));
        }
    };

    const handleDeleteBulk = async () => {
        const confirmed = window.confirm("Sure to delete?")
        if(!confirmed) return;
        const res = await fetch("/api/deletes/delete-items", {
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
            setItems((prev) => prev.filter((i) => !markedItems.includes(i._id)));
            setMarkedItems([]);
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
            body: JSON.stringify({ ids: markedItems, status }),
            credentials: 'include'
        });
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message);
            setItems((prev) =>
                prev.map((item) =>
                    markedItems.includes(item._id) ? { ...item, status: status } : item
                )
            );
            setMarkedItems([]);
        } else {
            toast.error(data.message);
        }
    };

    useEffect(() => {

        if (!actOrg) {
            (async () => {
                const a = await getActiveOrg();
                setActiveOrg(a);
            })();

        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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


    const handleStartDateChange = (date) => {
        setStartDate(date);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
    };
    const fetchData = async () => {
        const query = new URLSearchParams(window.location.search);
        query.set('startDate', startDate.toISOString());
        query.set('endDate', endDate.toISOString());
        router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
    };
    const downloadFullReport = async () => {
        setLoading(true)
        const allItems = await getItems(1, 100000000, "highest", keyword || "", "", activeOrg, startDate, endDate, true);
        setItemsForReport(allItems.items)
        setLoading(false)
        setOpenItemReportDownloadModal(true);
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4 text-center">Items</h1>
            <h3 className="text-lg text-gray-600 dark:text-gray-300 text-center mb-2">Select a Date Range for Sell Data</h3>
            <RangeDatepicker endDate={endDate} startDate={startDate} fetchData={fetchData} handleEndDateChange={handleEndDateChange} handleStartDateChange={handleStartDateChange} />
            <SearchBar placeholder={'Search with name or description'} />
            <p className="text-center mt-2"><button className="btn-ghost" onClick={downloadFullReport}>See Full Report </button></p>
            {loading && <Loading loading={loading} />}


            <div className="h-[40px]">
                {markedItems?.length > 0 && <div className="flex gap-4 mb-4">
                    <button
                        className=" btn-ghost"
                        onClick={handleDeleteBulk}
                        disabled={markedItems.length === 0}
                    >
                        Delete Selected
                    </button>
                    <button
                        className=" btn-ghost"
                        onClick={() => handleMarkInactiveBulk("Inactive")}
                        disabled={markedItems.length === 0}
                    >
                        Mark as Inactive
                    </button>
                    <button
                        className=" btn-ghost"
                        onClick={() => handleMarkInactiveBulk("Active")}
                        disabled={markedItems.length === 0}
                    >
                        Mark as Active
                    </button>
                </div>}
            </div>
            <table className="item-table table-fixed item-table-small-first-child">
                <thead>
                    <tr>
                        <th className="border w-5 border-gray-300 p-2 text-left">
                            <input
                                type="checkbox"
                                checked={markedItems?.length === items?.length}
                                onChange={handleSelectAll}
                                className="m-0"
                            />
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                        <NameSort name={"Name"} topValue={"name_dsc"} lowValue={"name_asc"}/>
                        </th>
                        <th className="border border-gray-300 p-2 text-left">

                        <NameSort  name={'Price'} topValue={"price_high"} lowValue={"price_low"}/>
                        </th>
                        <th className="border border-gray-300 p-2 text-left">Unit</th>
                        <th className="border border-gray-300 p-2 text-left">

                        <NameSort  name={'Total Sold'} topValue={"highest"} lowValue={"lowest"}/>
                        </th>
                        <th className="border border-gray-300 p-2 text-left">Status</th>
                        <th className="border border-gray-300 p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items?.map((i) => (
                        <tr key={i._id} className="hover:bg-gray-100">
                            <td className="border border-gray-300 p-2 w-5">
                                <input
                                    type="checkbox"
                                    checked={markedItems?.includes(i._id)}
                                    onChange={() => handleSelectItem(i._id)}
                                    className="m-0"
                                />
                            </td>
                            <td className="border border-gray-300 p-2  whitespace-nowrap overflow-hidden text-ellipsis">{i.name}</td>
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
                            <td className="border border-gray-300 p-2">
                                <div className="flex gap-4 justify-start">

                                    <button
                                        className="text-blue-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem(i);
                                            setOpenModal(true);
                                        }}
                                        title="See details"
                                    >
                                        <NotebookSVG />
                                    </button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/${activeOrg}/items/new?id=${i._id}`)
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

            {
                openItemReportDownloadModal && <ItemReportDownloadModal
                    setOpenModal={setOpenItemReportDownloadModal}
                    openModal={openItemReportDownloadModal}
                    items={itemsForReport}
                    endDate={endDate}
                    startDate={startDate}
                    companyName={currentUser?.name || "Sukkarshop"}
                    keyword={keyword}
                />
            }
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
