'use client'
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import Link from "next/link";
import InvoiceModal from "../modal/InvoiceModal";
import AuthContext from "@/contexts/AuthContext.mjs";
import PrintInvoiceModal from "../modal/PrintInvoiceModal";
import markAsPaid from "@/utils/markAsPaid.mjs";
import EditSVG from "../svg/EditSVG";
import DeleteSVG from "../svg/DeleteSVG";
import PrintSVG from "./PrintSVG";
import CheckSVG from "./CheckSVG";
import Loading from "../loader/Loading";
import SearchBar from "../SearchBar/SearchBar";
import NameSort from "../sort/NameSort";
import * as XLSX from "xlsx";
import formatDate from "@/utils/formatDate.mjs";

const InvoicePage = ({ invoices: i }) => {
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [invoices, setInvoices] = useState(i);
    const [loading, setLoading] = useState(false);
    const [activeOrg, setActiveOrg] = useState()
    const { activeOrganization } = useContext(AuthContext);
    const [markedItems, setMarkedItems] = useState([]);
    const [openInvoicePrintModal, setOpenInvoicePrintModal] = useState(false);
    const [loadingAll, setLoadingAll] = useState(false);

    const getAllInvoices = async () => {
        setLoadingAll(true);
        const res = await fetch(`/api/gets/all-invoices?orgId=${activeOrg}`);
        const data = await res.json();
        convertInvoiceDataToExcel(data?.data?.invoices)
        setLoadingAll(false);
    }

    const convertInvoiceDataToExcel = (invoiceData) => {
        // Prepare the data to export to Excel
        const excelData = invoiceData?.map((invoice) => {
            // Flatten items and append to invoice fields
            const itemDetails = invoice?.items?.map((item) => ({
                itemId: item?.itemId,
                itemName: item?.name,
                itemQuantity: item?.quantity,
                itemUnit: item?.unit,
                itemSellingPrice: item?.sellingPrice,
                itemTax: item?.tax,
            }));
            const customer = invoice?.customer || {};
            // Create a flattened structure with invoice and item details
            const flattenedInvoice = itemDetails.map((item) => ({
                _id: invoice._id,
                'Invoice Number': invoice?.invoiceNumber,
                'Invoice Date': invoice?.invoiceDate,
                'Customer Name': customer?.firstName + customer?.lastName || '',
                'Billing Address': customer.billingAddress || '',
                'Shipping Charge': invoice?.shippingCharge,
                subtotal: invoice?.subtotal,
                total: invoice?.total,
                discount: invoice?.discount,
                'Total Tax': invoice?.totalTax,
                'Due Amount': invoice?.dueAmount,
                'Paid Amount': invoice?.paidAmount,
                'Payment Method': invoice?.paymentMethod,
                trxId: invoice?.trxId,
                note: invoice?.note,
                'Payment From Number': invoice?.paymentFromNumber,
                itemId: item?.itemId,
                'Item Name': item?.itemName,
                'Item Quantity': item?.itemQuantity,
                'Item Unit': item?.itemUnit,
                'Item Selling Price': item?.itemSellingPrice,
                'Item Tax': item?.itemTax,
            }));

            return flattenedInvoice;
        }).flat(); // Flatten the result to get one row per item


        const ws = XLSX.utils.json_to_sheet(excelData);

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Invoices");

        // Generate the Excel file and trigger the download
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { bookType: "xlsx", type: "application/octet-stream" });

        // Create an anchor element to download the file
        const fileName = `invoices_${formatDate(new Date())}.xlsx`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(data);
        link.download = fileName;
        link.click();
    };



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
        if (markedItems.length === invoices.length) {
            setMarkedItems([]);
        } else {
            setMarkedItems(invoices.map((item) => item._id));
        }
    };

    const handleDeleteBulk = async () => {
        const confirmed = window.confirm("Sure to delete?")
        if (!confirmed) return;
        const res = await fetch("/api/deletes/delete-invoices", {
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
            setInvoices((prev) => prev.filter((i) => !markedItems.includes(i._id)));
            setMarkedItems([]);
        } else {
            toast.error(data.message);
        }
    };

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setOpenInvoiceModal(true);
    };
    const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null)
    useEffect(() => {
        (async () => {
            const a = await getActiveOrg();
            setActiveOrg(a);
        })()
    }, [])

    useEffect(() => {
        setInvoices(i);
    }, [i]);
    const handleDelete = async (id) => {
        const res = await fetch("/api/deletes/delete-invoice", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ invoiceNumber: id }),
            credentials: 'include'
        })
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message)
            setInvoices((prev) => {
                const filteredItems = prev.filter((i) => i._id !== id)
                return filteredItems
            })
        } else {
            toast.error(data.message)
        }

    }
    useEffect(() => {
        if (!openInvoiceModal) {

            setSelectedItem(null)
        }
    }, [openInvoiceModal])
    const handlePrint = async (inv) => {
        setLoading(true)
        const res = await fetch(`/api/gets/invoice?id=${inv?._id}`);
        const data = await res.json();
        if (data.status === 200) {
            setSelectedInvoiceForPrint({ ...data.data, ...inv });
        } else {
            console.error("Failed to fetch order data");
        }
        setLoading(false)
    }
    useEffect(() => {
        if (selectedInvoiceForPrint) {
            setOpenInvoicePrintModal(true)
        }
    }, [selectedInvoiceForPrint])

    return (
        <div className="w-full">
            {loading && <Loading loading={loading} />}
            <h1 className="text-2xl font-semibold mb-4 text-center">Invoices</h1>
            <div className="text-center">
                <button disabled={loading} className="bg-blue-500 px-2 py-1 rounded text-white" onClick={getAllInvoices}>{loading ? "Loading" : "Download Excel"}</button>
            </div>
            <SearchBar placeholder={"Search with items, customer or order number"} />
            <div className="h-[40px]">
                {markedItems?.length > 0 && <div className="flex gap-4 mb-4">
                    <button
                        className=" btn-ghost"
                        onClick={handleDeleteBulk}
                        disabled={markedItems.length === 0}
                    >
                        Delete Selected
                    </button>
                </div>}
            </div>

            <table className="item-table  item-table-small-first-child item-table-large-second-child  duration-300">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border w-5 border-gray-300 p-2 text-left">
                            <input
                                type="checkbox"
                                checked={markedItems?.length === invoices?.length}
                                onChange={handleSelectAll}
                                className="m-0"
                            />
                        </th>
                        <th className="border border-gray-300 p-2 text-left">

                            <NameSort name={"Customer"} topValue={"name_dsc"} lowValue={"name_asc"} />
                        </th>
                        <th className="border border-gray-300 p-2 text-left">Invoice</th>
                        <th className="border border-gray-300 p-2 text-left">Order No</th>
                        <th className="border border-gray-300 p-2 text-left">
                            <NameSort name={'Date'} topValue={"newest"} lowValue={"oldest"} />
                        </th>
                        {/* <th className="border border-gray-300 p-2 text-left">Tax</th> */}
                        {/* <th className="border border-gray-300 p-2 text-left">
                            <NameSort name={'Paid'} topValue={"top-paid"} lowValue={"top-due"} />

                        </th> */}
                        <th className="border border-gray-300 p-2 text-left">
                            <NameSort name={'Due'} topValue={"top-due"} lowValue={"top-paid"} />
                        </th>
                        <th className="border border-gray-300 p-2 text-left">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices?.map((i) => (
                        <tr
                            key={i._id}
                            className="hover:bg-gray-100  group"
                        >
                            <td className="border border-gray-300 p-2 w-5">
                                <input
                                    type="checkbox"
                                    checked={markedItems?.includes(i._id)}
                                    onChange={() => handleSelectItem(i._id)}
                                    className="m-0"
                                />
                            </td>

                            <td className="border border-gray-300 px-2 py-3">
                                {i.customer.firstName} {i.customer.lastName}

                                <div className="flex justify-between opacity-0 group-hover:opacity-100 duration-500">

                                    <Link
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-blue-500 hover:underline"
                                        href={`/${activeOrg}/invoices/new?id=${i._id}`}
                                        title="Edit this invoice"
                                    >
                                        <EditSVG />
                                    </Link>
                                    <button
                                        className="text-green-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrint(i)
                                        }}
                                        title="Print This Invoice"
                                    >
                                        <PrintSVG />
                                    </button>

                                    <button
                                        className="text-green-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (i.dueAmount === 0) return toast.error("No Due.")
                                            const confirmed = window.confirm("Sure to mark as fully paid?")
                                            if (confirmed) {
                                                markAsPaid(i)
                                            }
                                        }}
                                        title="Mark As Fully Paid"
                                    >
                                        <CheckSVG />
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const confirmed = window.confirm("Sure to delete this invoice?")
                                            if (confirmed) {
                                                handleDelete(i?.invoiceNumber)
                                            }
                                        }}
                                        title="Delete This Invoice"
                                    >
                                        <DeleteSVG />
                                    </button>

                                </div>

                            </td>
                            <td onClick={() => handleRowClick(i)} className="border border-gray-300 p-2 cursor-pointer">{i.invoiceNumber}</td>
                            <td onClick={() => handleRowClick(i)} className="border border-gray-300 p-2 cursor-pointer">{i.orderNumber}</td>
                            <td className="border border-gray-300 p-2 cursor-pointer">{new Date(i.invoiceDate).toLocaleString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                            })}</td>
                            {/* <td   onClick={() => handleRowClick(i)} className="border border-gray-300 p-2 cursor-pointer">{i?.totalTax}</td> */}
                            <td onClick={() => handleRowClick(i)} className="border border-gray-300 font-semibold dark:text-yellow-400 text-red-500 p-2 cursor-pointer">{i?.dueAmount}</td>
                            <td onClick={() => handleRowClick(i)} className="border border-gray-300 p-2 cursor-pointer font-semibold">{i?.total}</td>
                            {/* <td   onClick={() => handleRowClick(i)} className="border border-gray-300 p-2 cursor-pointer font-semibold">{i?.paidAmount}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedItem && (
                <InvoiceModal
                    setOpenModal={setOpenInvoiceModal}
                    openModal={openInvoiceModal}
                    item={selectedItem}
                />
            )}
            {openInvoicePrintModal && <PrintInvoiceModal
                customerInfo={selectedInvoiceForPrint?.customer}
                paidAmount={selectedInvoiceForPrint?.paidAmount}
                total={selectedInvoiceForPrint?.total}
                shippingCharge={selectedInvoiceForPrint?.shippingCharge}
                items={selectedInvoiceForPrint?.items}
                note={selectedInvoiceForPrint?.note}
                subtotal={selectedInvoiceForPrint?.subtotal}
                discount={selectedInvoiceForPrint?.discount}
                totalTax={selectedInvoiceForPrint?.totalTax}
                orgInfo={activeOrganization}
                openModal={openInvoicePrintModal}
                setOpenModal={setOpenInvoicePrintModal}
                currency={selectedInvoiceForPrint?.currency}
                invoiceDate={selectedInvoiceForPrint?.invoiceDate}
                resetStates={setSelectedInvoiceForPrint}
                invoiceNumber={selectedInvoiceForPrint?.invoiceNumber}
            />}
        </div>
    );
};

export default InvoicePage;
