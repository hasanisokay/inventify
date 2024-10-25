import { defaultSortOptions } from "@/constants/options.mjs";
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
            // Handle error (optional)
            console.error("Failed to fetch order data");
        }
        setLoading(false);
    };
    useEffect(() => {
        if (customerOrderDetails.length < 1) return;
        else {
            handleBringCustomerOrderData(customer?._id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortOrder])


    const markAsPaid = async (order) => {
        const formData = {
            invoiceNumber: order.invoiceNumber,
            newPaidAmount: order.subtotal,
            newDueAmount: order.newDueAmount,
            paymentFromNumber: order.paymentFromNumber,
            trxId: order.trxId,
            paymentMethod: order.paymentMethod ==="not-paid" ? "": order.paymentMethod 
        }
        const res = await fetch('/api/updates/mark-invoice-as-paid', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        })
        const data = await res.json()
        if (data.status === 200) {
            toast.success(data.message)
        } else {
            toast.error(data.message)
        }
    }

    return (
        <div className="mx-auto flex w-72 items-center justify-center">
            <div
                onClick={() => setOpenModal(false)}
                className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}
            >
                <div
                    onClick={(e_) => e_.stopPropagation()}
                    className={`absolute rounded-lg bg-white dark:bg-gray-900 drop-shadow-2xl h-[90%] w-[90%] overflow-y-auto ${openModal ? 'opacity-1 translate-y-0 duration-300' : '-translate-y-20 opacity-0 duration-150'}`}
                >
                    <form className="px-5 pb-5 pt-3 lg:pb-10 lg:pt-5 lg:px-10">
                        <h1 className="pb-8 text-xl">{customer.firstName + " " + customer.lastName}</h1>
                        {customer?.company && <p><span className="inline-block w-[100px]">Company:</span>{customer.company}</p>}
                        {customer?.phone && <p><span className="inline-block w-[100px]">Phone:</span>{customer.phone}</p>}
                        {customer?.totalPaid && <p><span className="inline-block w-[100px]">Paid:</span>{customer.totalPaid}</p>}
                        {customer?.totalDue && <p><span className="inline-block w-[100px]">Total Due:</span>{customer.totalDue}</p>}
                        {customer?.totalOrder && <p><span className="inline-block w-[100px] mb-4">Total Order:</span>{customer.totalOrder}</p>}
                        {customer?.totalOrder > 0 && customerOrderDetails.length === 0 && !loading && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleBringCustomerOrderData(customer._id);
                                }}
                                className="btn-purple"
                            >
                                See Orders
                            </button>
                        )}
                    </form>

                    <div className="px-5 pb-5 pt-3 lg:pb-10 lg:pt-5 lg:px-10">
                        {customerOrderDetails.length > 0 && <Select
                            options={defaultSortOptions}
                            value={defaultSortOptions.find((u) => u.value === sortOrder)}
                            onChange={(selectedOption) => setSortOrder(selectedOption.value)}
                            className='select-react w-fit mb-2'
                        />}
                        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2">
                            {loading && <p className="my-4 text-center">Loading...</p>}
                            {customerOrderDetails.length > 0 && !loading &&
                                customerOrderDetails.map((order, index) => <div key={order.invoiceNumber} className={`mb-2 ${index % 2 === 0 ? "bg-slate-300" : "bg-gray-200"} group border p-3 rounded`}>
                                    <h2 className="font-bold">Order: {order.invoiceNumber}</h2>
                                    <p>
                                        <span className="inline-block w-[100px] font-medium" >Date:</span> {new Date(order.invoiceDate).toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: true,
                                        })}
                                    </p>
                                    <p><span className="inline-block w-[100px] font-medium">Discount:</span> {order.discount}</p>
                                    <p className={`${order?.dueAmount && "text-red-500 font-semibold "} `}><span className="inline-block w-[100px] font-medium">Due Amount:</span> {order.dueAmount} {
                                        order.dueAmount > 0 && <button className="group-hover:opacity-100 ml-4 opacity-0 text-green-500" onClick={() => markAsPaid(order)}>Mark As Paid</button>
                                    } </p>
                                    <p><span className="inline-block w-[100px] font-medium">Paid Amount:</span> {order.paidAmount}</p>
                                    {order.paymentMethod && <p><span className="inline-block w-[100px] font-medium">Payment:</span> {order.paymentMethod}</p>}
                                    {order.paymentFromNumber && <p><span className="inline-block w-[100px] font-medium">Payment From:</span> {order.paymentFromNumber}</p>
                                    }
                                    {order.trxId && <p>Trx ID: {order.trxId}</p>
                                    }
                                    <h3 className="mt-4 mb-1 font-semibold text-lg text-center">Items</h3>
                                    <ul>
                                        {order.items.map((item) => (
                                            <li key={item.itemId}>
                                                <span className="font-semibold">{item.name}</span> - {item.quantity} {item.unit} @ {item.sellingPrice} each
                                            </li>
                                        ))}
                                    </ul>
                                </div>)
                            }
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal;
