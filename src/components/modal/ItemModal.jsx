import { useEffect, useState } from "react";
import Select from "react-select";
import { defaultSortOptions } from "@/constants/options.mjs";

const ItemModal = ({ openModal, setOpenModal, item }) => {
    const [sortOrder, setSortOrder] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [itemsInvoices, setItemsInvoices] = useState([]);

    const getItemsInvoices = async (id) => {
        setLoading(true);
        const res = await fetch(`/api/gets/item-orders?id=${id}&&sortOrder=${sortOrder}`);
        const data = await res.json();
        if (data.status === 200) {
            setItemsInvoices(data.data);
        } else {
            console.error("Failed to fetch order data");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (itemsInvoices.length < 1) return;
        getItemsInvoices(item?._id);
    }, [sortOrder]);

    return (
        <div className="fixed inset-0 z-[100]  flex items-center justify-center">
            <div
                onClick={() => setOpenModal(false)}
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${openModal ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full overflow-y-auto max-h-[99%] max-w-3xl bg-white dark:bg-gray-900 rounded-lg shadow-lg transform transition-all ${openModal ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
                    } p-6`}
            >
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{item.name}</h2>
                    <button
                        onClick={() => setOpenModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        &#10005;
                    </button>
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Price: {item?.sellingPrice} per {item.unit}</p>
                <p className="text-gray-600 dark:text-gray-300">Total Sold: {item.totalOrder}</p>

                <div className="my-4">
                    {itemsInvoices?.length < 1 && item.totalOrder > 0 && (
                        <button
                            onClick={() => getItemsInvoices(item._id)}
                            className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            See Orders
                        </button>
                    )}
                </div>

                {loading && <p className="text-center text-lg mt-4">Loading...</p>}

                {itemsInvoices?.length > 0 && (
                    <>
                        <Select
                            options={defaultSortOptions}
                            value={defaultSortOptions.find((u) => u.value === sortOrder)}
                            onChange={(selectedOption) => setSortOrder(selectedOption.value)}
                            className="w-48 mb-4 select-react"
                        />
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">

                            {itemsInvoices.map((i, index) => (
                                <div key={i._id} className="border p-4 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-auto">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                        Order #{i.invoiceNumber}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Date:</span>{" "}
                                        {new Date(i.invoiceDate).toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: true,
                                        })}
                                    </p>
                                    <div className="mt-2">
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Customer:</span>{" "}
                                            {i?.customerDetails?.name ||
                                                `${i.customerDetails?.firstName} ${i.customerDetails?.lastName}`}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Phone:</span>{" "}
                                            {i.customerDetails?.phone || "Not Provided"}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Billing:</span>{" "}
                                            {i.customerDetails?.billingAddress || "Not Provided"}
                                        </p>
                                    </div>
                                    <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-200">
                                        <p>
                                            <span className="font-medium">Total:</span> {i?.total}
                                        </p>
                        
                                        <p>
                                            <span className="font-medium">Paid Amount:</span> {i.paidAmount}
                                        </p>
                                        <p>
                                            <span className="font-medium">Due Amount:</span>{" "}
                                            <span className={i.dueAmount > 0 ? "text-red-500" : ""}>{i.dueAmount}</span>
                                        </p>
                                        {i.paymentMethod && (
                                            <p>
                                                <span className="font-medium">Payment:</span> {i.paymentMethod}
                                            </p>
                                        )}
                                        {i.paymentFromNumber && (
                                            <p>
                                                <span className="font-medium">Payment From:</span> {i.paymentFromNumber}
                                            </p>
                                        )}
                                        {i.trxId && <p>Trx ID: {i.trxId}</p>}
                                    </div>
                                    <h4 className="mt-4 font-semibold text-center">Items</h4>
                                    <ul className="text-gray-600 dark:text-gray-300">
                                        {i.items.map((item) => (
                                            <li key={item.itemId}>
                                                <span className="font-semibold">{item.name}</span> - {item.quantity}{" "}
                                                {item.unit} @ {item.sellingPrice} each
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ItemModal;






