import { defaultSortOptions } from "@/constants/options.mjs";
import { useEffect, useState } from "react";

import Select from 'react-select';
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
            // Handle error (optional)
            console.error("Failed to fetch order data");
        }
        setLoading(false);
    }

    useEffect(() => {
        if (itemsInvoices.length < 1) return;
        else {
            getItemsInvoices(item?._id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortOrder])

    return (
        <div className="mx-auto flex w-72 items-center justify-center">
            <div onClick={() => setOpenModal(false)} className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}>
                <div onClick={(e_) => e_.stopPropagation()} className={`absolute w-[90%] max-h-[90%] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 drop-shadow-2xl ${openModal ? 'opacity-1 translate-y-0 duration-300' : '-translate-y-20 opacity-0 duration-150'}`}>
                    <div className="px-5 pb-5 pt-3 lg:pb-10 lg:pt-5 lg:px-10">
                        <p className="text-lg font-semibold">{item.name}</p>
                        <p><span>Price: </span> <span>{item?.sellingPrice}</span> <span>per {item.unit}</span> </p>
                        <p><span>Total Sold:</span> <span>{item.totalOrder}</span></p>
                        <div className="my-4">
                            {itemsInvoices?.length < 1 && <button onClick={() => getItemsInvoices(item._id)} className="btn-purple">See Orders</button>}
                        </div>
                        {loading && <p className="text-center text-lg mt-4">Loading...</p>}
                        <div>
                            {itemsInvoices?.length > 0 && <Select
                                options={defaultSortOptions}
                                value={defaultSortOptions.find((u) => u.value === sortOrder)}
                                onChange={(selectedOption) => setSortOrder(selectedOption.value)}
                                className='select-react w-fit mb-2'
                            />}
                        </div>
                        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2">
                            {itemsInvoices?.length > 0 && itemsInvoices?.map((i, index) => <div key={i._id} className={`border p-3 rounded mb-2 ${index % 2 === 0 ? "bg-slate-300" : "bg-gray-200"} `}>
                                <h2 ><span className="inline-block w-[100px] font-medium">Order: </span> <span className="font-bold">{i.invoiceNumber}</span></h2>
                                <p>
                                    <span className="inline-block w-[100px] font-medium" >Date:</span> {new Date(i.invoiceDate).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: true,
                                    })}
                                </p>

                                <div className="my-2">
                                    <h2><span className="inline-block w-[100px] font-medium">Customer: </span> {i?.customerDetails?.name ? i?.customerDetails?.name : i.customerDetails?.firstName + " " + i.customerDetails?.lastName}</h2>
                                    <p><span className="inline-block w-[100px] font-medium">Phone </span>  {i.customerDetails?.phone || "Not Provided"}</p>
                                    <p><span className="inline-block w-[100px] font-medium">Billing: </span>{i.customerDetails?.billingAddress || "Not Provided"}</p>
                                </div>
                                <p><span className="inline-block w-[100px] font-medium">Paid Amount:</span> {i.paidAmount}</p>
                                <p><span className="inline-block w-[100px] font-medium">Due Amount:</span> {i.dueAmount}</p>
                                {i.paymentMethod && <p><span className="inline-block w-[100px] font-medium">Payment:</span> {i.paymentMethod}</p>}
                                {i.paymentFromNumber && <p><span className="inline-block w-[100px] font-medium">Payment From:</span> {i.paymentFromNumber}</p>
                                }
                                {i.trxId && <p>Trx ID: {i.trxId}</p>
                                }
                                <h3 className="mt-4 mb-1 font-semibold text-lg text-center">Items</h3>
                                <ul>
                                    {i.items.map((item) => (
                                        <li key={item.itemId}>
                                            <span className="font-semibold">{item.name}</span> - {item.quantity} {item.unit} @ {item.sellingPrice} each
                                        </li>
                                    ))}
                                </ul>
                            </div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ItemModal;