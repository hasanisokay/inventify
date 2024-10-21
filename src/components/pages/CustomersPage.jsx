'use client'
import { useState } from "react";
import CustomerModal from "../modal/CustomerModal";

const CustomersPage = ({ customers }) => {
    const [openModal, setOpenModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleRowClick = (customer) => {
        setSelectedCustomer(customer);
        setOpenModal(true);
    };

    return (
        <div className="w-full">
            <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Phone</th>
                        <th className="border border-gray-300 p-2 text-left">Company</th>
                        <th className="border border-gray-300 p-2 text-left">Due</th>
                        <th className="border border-gray-300 p-2 text-left">Paid</th>
                    </tr>
                </thead>
                <tbody>
                    {customers?.map((c) => (
                        <tr
                            key={c._id}
                            className="hover:bg-gray-100 cursor-pointer group"
                            onClick={() => handleRowClick(c)}
                        >
                            <td className="border border-gray-300 p-2">{c.firstName + " " + c.lastName}

                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100">
                                    <button
                                        className="text-blue-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Handle edit action here
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Handle delete action here
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>

                            </td>
                            <td className="border border-gray-300 p-2">{c.phone}</td>
                            <td className="border border-gray-300 p-2">{c.companyName}</td>
                            <td className="border border-gray-300 p-2">{c?.currency ||"BDT "} {c?.totalDue}</td>
                            <td className="border border-gray-300 p-2">{c?.currency ||"BDT "} {c?.totalPaid}</td>
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
