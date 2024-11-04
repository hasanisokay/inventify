import { useEffect, useState } from "react";
import Loading from "../loader/Loading";

const InvoiceModal = ({ openModal, setOpenModal, item }) => {
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState(item?.customer);

    const getInvoiceDetails = async () => {
        setLoading(true);
        const res = await fetch(`/api/gets/invoice?id=${item?._id}`);
        const data = await res.json();
        if (data.status === 200) {
            setInvoiceData(data.data);
        } else {
            console.error("Failed to fetch order data");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (item?._id) {
            getInvoiceDetails();
        }
    }, [item]);

    if (loading) {
        return <Loading loading={loading} />
    }

    if (!invoiceData) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div
                onClick={() => setOpenModal(false)}
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${
                    openModal ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            />
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all transform ${
                    openModal ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
                } p-6`}
            >
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Invoice #{invoiceData.invoiceNumber}
                    </h2>
                    <button
                        onClick={() => setOpenModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        &#10005;
                    </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(invoiceData.invoiceDate).toLocaleDateString()}
                    </p>
                    <p>
                        <span className="font-medium">Customer:</span> {customer.firstName} {customer.lastName}
                    </p>
                    <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Items:</h3>
                    <ul className="space-y-1 overflow-auto max-h-[25vh]">
                        {invoiceData.items.map((item) => (
                            <li key={item.itemId} className="text-gray-700 dark:text-gray-200">
                                <span className="font-semibold">{item.name}</span> - {item.quantity} {item.unit} @{" "}
                                <span className="font-semibold">{item.sellingPrice}</span> per {item.unit}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 border-t pt-4 space-y-1 max-h-[35vh] overflow-auto">
                        <p>
                            <span className="font-semibold">Total:</span> {invoiceData.total}
                        </p>
                        <p>
                            <span className="font-semibold">Shipping Charge:</span> {invoiceData.shippingCharge}
                        </p>
                        <p>
                            <span className="font-semibold">Discount:</span> {invoiceData.discount}
                        </p>
                        <p>
                            <span className="font-semibold">Total Tax:</span> {invoiceData.totalTax}
                        </p>
                        <p>
                            <span className="font-semibold">Due Amount:</span>{" "}
                            <span className={invoiceData.dueAmount > 0 ? "text-red-500" : ""}>
                                {invoiceData.dueAmount}
                            </span>
                        </p>
                        <p>
                            <span className="font-semibold">Paid Amount:</span> {invoiceData.paidAmount}
                        </p>
                        <p>
                            <span className="font-semibold">Payment Method:</span>{" "}
                            {invoiceData.paymentMethod || "N/A"}
                        </p>
                        <p>
                            <span className="font-semibold">Note:</span> {invoiceData.note || "N/A"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setOpenModal(false)}
                    className="mt-6 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default InvoiceModal;
