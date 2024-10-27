import { useEffect, useState } from "react";

const InvoiceModal = ({ openModal, setOpenModal, item }) => {
    const [invoiceData, setInvoiceData] = useState(null); // Changed to null to handle loading state
    const [loading, setLoading] = useState(false);
    const [customer,setCustomer] = useState(item?.customer)
    console.log(item)
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
        if (item?._id) { // Ensure item is valid before fetching
            getInvoiceDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item]);

    if (loading) {
        return <div>Loading...</div>; // Optional loading state
    }

    if (!invoiceData) {
        return null; // Return null if no data and not loading
    }

    return (
        <div className="mx-auto flex w-72 items-center justify-center">
            <div onClick={() => setOpenModal(false)} className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}>
                <div onClick={(e_) => e_.stopPropagation()} className={`absolute w-fit min-w-[90%] md:min-w-[60%] max-h-[90%] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 drop-shadow-2xl ${openModal ? 'opacity-1 translate-y-0 duration-300' : '-translate-y-20 opacity-0 duration-150'}`}>
                    <div className="px-5 pb-5 pt-3 lg:pb-10 lg:pt-5 lg:px-10">
                        <h2 className="text-xl font-bold">Invoice #{invoiceData.invoiceNumber}</h2>
                        <p>Date: {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
                        <div>
                            <p>   Customer: <span className="font-semibold">{customer.firstName} {customer.lastName}</span></p>
                        </div>
                        <div>
                            <h3 className="mt-4">Items:</h3>
                            <ul>
                                {invoiceData.items.map((item) => (
                                    <li key={item.itemId}>
                                        <span className="font-semibold">{item.name}</span> - <span className="font-semibold">{item.quantity}</span> {item.unit} @ <span className="font-semibold">{item.sellingPrice.toFixed(2)}</span> per {item.unit}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-4 font-semibold">Subtotal: {invoiceData.subtotal.toFixed(2)}</p>
                            <p className="font-semibold">Discount: {invoiceData.discount.toFixed(2)}</p>
                            <p className="font-semibold">Total Tax: {invoiceData.totalTax.toFixed(2)}</p>
                            <p className="font-semibold">Due Amount: <span className={`${invoiceData.dueAmount > 0 ? "text-red-500" : ""}`}>{invoiceData.dueAmount.toFixed(2)}</span></p>
                            <p className="font-semibold">Paid Amount: {invoiceData.paidAmount.toFixed(2)}</p>
                            <p className="font-semibold">Payment Method: {invoiceData.paymentMethod || "N/A"}</p>
                            <p className="font-semibold">Note: {invoiceData.note || "N/A"}</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
