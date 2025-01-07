'use client'
import { useEffect, useState } from "react";
import CustomerModal from "../modal/CustomerModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import EditSVG from "../svg/EditSVG";
import DeleteSVG from "../svg/DeleteSVG";
import SearchBar from "../SearchBar/SearchBar";
import NotebookSVG from "../svg/NotebookSVG";
import NameSort from "../sort/NameSort";
import * as XLSX from "xlsx";
import formatDate from "@/utils/formatDate.mjs";
const CustomersPage = ({ c, page: p }) => {
    const [page, setPage] = useState(p);
    const router = useRouter();
    const [activeOrg, setActiveOrg] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState(c);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const getAllCustomers = async () => {

        setLoading(true);
        const res = await fetch(`/api/gets/all-customers?orgId=${activeOrg}`);
        const data = await res.json();
        convertCustomerDataToExcel(data?.data?.customers)
        setLoading(false);
    }


    const convertCustomerDataToExcel = (customerData) => {
        const excelData = customerData?.map((customer) => ({
            _id: customer._id,
            'Customer Type': customer.customerType,
            'Name': customer.name,
            'First Name': customer.firstName,
            'Last Name': customer.lastName,
            salutation: customer.salutation,
            phone: customer.phone,
            email: customer.email,
            note: customer.note,
            "Company Name": customer.companyName,
            status: customer.status,
            source: customer.source,
            'Created Time': customer.createdTime,
            "Last Modified": customer.lastModifiedTime,
            'Billing Address': customer.billingAddress,
            'Billing Street': customer.billingStreet,
            'Billing City': customer.billingCity,
            'Billing State': customer.billingState,
            'Billing Country': customer.billingCountry,
            'Billing Code': customer.billingCode,
            'Shipping Address': customer.shippingAddress,
            'Shipping Street': customer.shippingStreet,
            'Shipping City': customer.shippingCity,
            'Shipping State': customer.shippingState,
            'Shipping Country': customer.shippingCountry,
            'Shipping Code': customer.shippingCode,
            'Facebook Id': customer.facebookId,
            // orgId: customer.orgId,
            // ownerUsername: customer.ownerUsername,
            "Due": customer.totalDue,
            'Paid': customer.totalPaid,
            'Order': customer.totalOrder,
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Customers");

        // Generate the Excel file and trigger the download
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { bookType: "xlsx", type: "application/octet-stream" });

        // Create an anchor element to download the file
        const fileName = `customers_${formatDate(new Date())}.xlsx`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(data);
        link.download = fileName;
        link.click();
    };
    useEffect(() => {
        (async () => {
            const a = await getActiveOrg();
            setActiveOrg(a);
        })();
    }, []);

    useEffect(() => {
        setCustomers(c);
    }, [c]);

    const handleRowClick = (customer) => {
        setSelectedCustomer(customer);
        setOpenModal(true);
    };

    const handleSelectCustomer = (id) => {
        setSelectedCustomers((prev) => {
            if (prev.includes(id)) {
                return prev.filter((customerId) => customerId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedCustomers.length === customers.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers(customers.map((customer) => customer._id));
        }
    };

    const handleDeleteBulk = async () => {
        const confirmed = window.confirm("Sure to delete?")
        if (!confirmed) return;
        const res = await fetch("/api/deletes/delete-customers", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: selectedCustomers }),
            credentials: "include",
        });
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message);
            setCustomers((prev) => prev.filter((customer) => !selectedCustomers.includes(customer._id)));
            setSelectedCustomers([]);
        } else {
            toast.error(data.message);
        }
    };

    const handleDelete = async (id) => {
        const res = await fetch("/api/deletes/delete-customer", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
            credentials: "include",
        });
        const data = await res.json();
        if (data.status === 200) {
            toast.success(data.message);
            setCustomers((prev) => prev.filter((customer) => customer._id !== id));
        } else {
            toast.error(data.message);
        }
    };

    useEffect(() => {
        if (!openModal) {
            setSelectedCustomer(null);
        }
    }, [openModal]);

    return (
        <div className="w-full">
            <h1 className="text-2xl font-semibold mb-4 text-center">Customers</h1>
            <div className="text-center">
                <button disabled={loading} className="bg-blue-500 px-2 py-1 rounded text-white" onClick={getAllCustomers}>{loading ? "Loading..." : "Download Excel"}</button>
            </div>

            <SearchBar placeholder={"Search with name, phone, address, email, fbId"} />
            <div className="h-[40px]">
                {selectedCustomers.length > 0 && (
                    <div className="flex gap-4 mb-4">
                        <button
                            className=" btn-ghost"
                            onClick={handleDeleteBulk}
                            disabled={selectedCustomers.length === 0}
                        >
                            Delete Selected
                        </button>
                    </div>
                )}
            </div>

            <table className="item-table  item-table-small-first-child item-table-large-second-child">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border border-gray-300 p-2 text-left">
                            <input
                                type="checkbox"
                                checked={selectedCustomers.length === customers.length}
                                onChange={handleSelectAll}
                                className="m-0"
                            />
                        </th>
                        <th className="border border-gray-300 p-2 text-left ">
                            <NameSort name={"Name"} topValue={"name_dsc"} lowValue={"name_asc"} />
                        </th>

                        <th className="border border-gray-300 p-2 text-left">
                            <NameSort name={"Total Order"} topValue={"high_order"} lowValue={"low_order"} />
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                            <NameSort name={"Due"} topValue={"highest_debtors"} lowValue={"lowest_debtors"} />
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                            <NameSort name={"Paid"} topValue={"highest_spenders"} lowValue={"lowest_spenders"} />
                        </th>
                        <th className="border border-gray-300 p-2 text-left">Phone</th>
                        <th className="border border-gray-300 p-2 text-left">Company</th>
                        <th className="border border-gray-300 p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {customers?.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-100">
                            <td className="border border-gray-300 p-2 w-5">
                                <input
                                    type="checkbox"
                                    checked={selectedCustomers.includes(c._id)}
                                    onChange={() => handleSelectCustomer(c._id)}
                                    className="m-0"
                                />
                            </td>
                            <td className="border border-gray-300 p-2  whitespace-nowrap overflow-hidden text-ellipsis">{c.firstName + " " + c.lastName}</td>

                            <td className="border border-gray-300 p-2 whitespace-nowrap overflow-hidden text-ellipsis">{c?.totalOrder}</td>
                            <td className="border border-gray-300 p-2 whitespace-nowrap overflow-hidden text-ellipsis">{c?.currency || "BDT "} {c?.totalDue}</td>
                            <td className="border border-gray-300 p-2 whitespace-nowrap overflow-hidden text-ellipsis">{c?.currency || "BDT "} {c?.totalPaid}</td>
                            <td className="border border-gray-300 p-2 whitespace-nowrap overflow-hidden text-ellipsis">{c?.phone}</td>
                            <td className="border border-gray-300 p-2  whitespace-nowrap overflow-hidden text-ellipsis">{c?.companyName}</td>
                            <td className="border border-gray-300 p-2">
                                <div className="flex gap-4 justify-start">
                                    {/* Edit Button */}
                                    <button
                                        className="text-blue-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click from triggering modal
                                            setSelectedCustomer(c);
                                            setOpenModal(true); // Open the modal
                                        }}
                                        title="See this customer"
                                    >
                                        <NotebookSVG />
                                    </button>
                                    <button title="Edit this customer" onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/${activeOrg}/customers/new?id=${c._id}`)
                                    }} >
                                        <EditSVG />
                                    </button>
                                    {/* Delete Button */}
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const confirmed = window.confirm("Sure to delete this customer?");
                                            if (confirmed) {
                                                handleDelete(c?._id);
                                            }
                                        }}
                                        title="Delete this customer"
                                    >
                                        <DeleteSVG />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedCustomer && (
                <CustomerModal
                    setOpenModal={setOpenModal}
                    openModal={openModal}
                    customer={selectedCustomer}
                />
            )}
        </div>
    );
};

export default CustomersPage;
