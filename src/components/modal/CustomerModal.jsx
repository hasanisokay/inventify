import { defaultSortOptions } from "@/constants/options.mjs";
import markAsPaid from "@/utils/markAsPaid.mjs";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from 'react-select';

const CustomerModal = ({ openModal, setOpenModal, customer }) => {
    const [customerOrderDetails, setCustomerOrderDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState(-1);

    const handleBringCustomerOrderData = async (id) => {
        setLoading(true);
        const res = await fetch(`/api/gets/customer-orders?id=${id}&&sortOrder=${sortOrder}`);
        const data = await res.json();

        if (data.status === 200) {
            setCustomerOrderDetails(data.data);
        } else {
            console.error("Failed to fetch order data");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (customerOrderDetails.length < 1) return;
        handleBringCustomerOrderData(customer?._id);
    }, [sortOrder]);

    return (
        <div className="mx-auto flex w-72 items-center justify-center">
            <div
                onClick={() => {
                    setOpenModal(false);
                    setCustomerOrderDetails([]);
                }}
                className={`fixed z-[100] flex items-center justify-center ${
                    openModal ? 'opacity-1 visible' : 'invisible opacity-0'
                } inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}
            >
                <div
                    onClick={(e_) => e_.stopPropagation()}
                    className={`absolute rounded-lg bg-white dark:bg-gray-900 shadow-lg max-h-[90%] min-h-[50%] min-w-[50%] max-w-[90%] overflow-y-auto border border-gray-300 dark:border-gray-700 ${
                        openModal ? 'opacity-1 translate-y-0 duration-300' : '-translate-y-20 opacity-0 duration-150'
                    }`}
                >
                    <div className="px-5 pb-5 pt-3 lg:pb-10 lg:pt-5 lg:px-10">
                        <h1 className="pb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                            {customer.firstName + " " + customer.lastName}
                        </h1>
                        {customer?.company && <p><span className="font-medium text-gray-700 dark:text-gray-400">Company:</span> {customer.company}</p>}
                        {customer?.phone && <p><span className="font-medium text-gray-700 dark:text-gray-400">Phone:</span> {customer.phone}</p>}
                        {customer?.totalPaid && <p><span className="font-medium text-gray-700 dark:text-gray-400">Paid:</span> {customer.totalPaid}</p>}
                        <p>
                            <span className="font-medium text-gray-700 dark:text-gray-400">Due:</span> {customer.totalDue}
                        </p>
                        {customer?.totalOrder && <p><span className="font-medium text-gray-700 dark:text-gray-400">Total Order:</span> {customer.totalOrder}</p>}
                        
                        {customer?.totalOrder > 0 && customerOrderDetails.length === 0 && !loading && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleBringCustomerOrderData(customer._id);
                                }}
                                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mt-4"
                            >
                                See Orders
                            </button>
                        )}
                    </div>

                    <div className="px-5 pb-5 pt-3 lg:pb-10 lg:pt-5 lg:px-10">
                        {customerOrderDetails.length > 0 && (
                            <Select
                                options={defaultSortOptions}
                                value={defaultSortOptions.find((u) => u.value === sortOrder)}
                                onChange={(selectedOption) => setSortOrder(selectedOption.value)}
                                className='select-react w-fit mb-2'
                            />
                        )}
                        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2">
                            {loading && <p className="my-4 text-center">Loading...</p>}
                            {customerOrderDetails.length > 0 && !loading &&
                                customerOrderDetails.map((order, index) => (
                                    <div
                                        key={order.invoiceNumber}
                                        className={`mb-2 bg-gray-100 dark:bg-gray-800 group border p-4 rounded-md shadow-md transition duration-200 ease-in-out hover:shadow-lg`}
                                    >
                                        <h2 className="font-bold text-lg">Order: {order.invoiceNumber}</h2>
                                        <p>
                                            <span className="font-medium text-gray-700 dark:text-gray-400">Date:</span>{" "}
                                            {new Date(order.invoiceDate).toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                                hour12: true,
                                            })}
                                        </p>
                                        <p><span className="font-medium text-gray-700 dark:text-gray-400">Discount:</span> {order.discount}</p>
                                        <p className={`${order?.dueAmount && "text-red-600 font-semibold "} mt-2`}>
                                            <span className="font-medium text-gray-700 dark:text-gray-400">Due Amount:</span> {order.dueAmount} {
                                                order.dueAmount > 0 && (
                                                    <button 
                                                        className="ml-4 text-sm text-green-600 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition duration-150 hover:bg-green-50 hover:text-green-700"
                                                        onClick={() => markAsPaid(order)}
                                                    >
                                                        Mark As Paid
                                                    </button>
                                                )
                                            }
                                        </p>
                                        <p><span className="font-medium text-gray-700 dark:text-gray-400">Paid Amount:</span> {order.paidAmount}</p>
                                        {order.paymentMethod && <p><span className="font-medium text-gray-700 dark:text-gray-400">Payment:</span> {order.paymentMethod}</p>}
                                        {order.paymentFromNumber && <p><span className="font-medium text-gray-700 dark:text-gray-400">Payment From:</span> {order.paymentFromNumber}</p>}
                                        {order.trxId && <p><span className="font-medium text-gray-700 dark:text-gray-400">Trx ID:</span> {order.trxId}</p>}
                                        <h3 className="mt-4 mb-1 font-semibold text-lg text-center text-gray-800 dark:text-gray-200">Items</h3>
                                        <ul className="list-inside">
                                            {order.items.map((item) => (
                                                <li key={item.itemId} className="text-gray-700 dark:text-gray-300">
                                                    <span className="font-semibold">{item.name}</span> - {item.quantity} {item.unit} @ {item.sellingPrice} each
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal;
