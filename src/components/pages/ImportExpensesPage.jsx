"use client"
import { useContext, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import AuthContext from "@/contexts/AuthContext.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import getCustomers from "@/utils/getCustomers.mjs";
import Loading from "../loader/Loading";

const ImportExpensesPage = () => {
    const [file, setFile] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const { currentUser } = useContext(AuthContext); ``
    const [savedCustomers, setSavedCustomers] = useState([]);
    const [activeOrg, setActiveOrg] = useState("")
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true)
            const c = await getCustomers(1, 10000, "newest", "", true, activeOrg)
            const mergedCustomers = c?.map(customer => ({
                ...customer,
                name: `${customer.firstName} ${customer.lastName}`
            }))
            setSavedCustomers(mergedCustomers);
            setLoading(false)
        })()
    }, [activeOrg])

    useEffect(() => {
        (async () => {
            const a = await getActiveOrg();
            setActiveOrg(a);
        })()
    }, [])

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
        if (!uploadedFile) return;
        if (savedCustomers?.length < 1) return;


        const fileType = uploadedFile.type;
        if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
            handleExcel(uploadedFile);
        } else {
            toast.error("Unsupported file type");
        }
    };



    const handleExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target.result;
            try {
                const workbook = XLSX.read(arrayBuffer, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                // Object to store invoices grouped by Expense Reference ID
                const groupedInvoices = {};

                jsonData.forEach((row) => {
                    const refId = row["Expense Reference ID"];
                    const mappedItem = mapRowToItem(row, "excel");

                    if (groupedInvoices[refId]) {
                        // If the reference ID already exists, group it with the previous one
                        groupedInvoices[refId].itemizedExpenses.push({
                            category: mappedItem.category,
                            amount: mappedItem.amount,
                            note: mappedItem.note,
                            tax: mappedItem.tax,
                        });
                        // Update the total sum for itemized expenses
                        groupedInvoices[refId].total += mappedItem.amount;
                        groupedInvoices[refId].itemized = true; // Mark as itemized
                    } else {
                        // Otherwise, create a new entry with itemized flag as false initially
                        groupedInvoices[refId] = {
                            ...mappedItem,
                            itemized: false,  // Will be updated if more items are added under the same refId
                            itemizedExpenses: [
                                {
                                    category: mappedItem.category,
                                    amount: mappedItem.amount,
                                    note: mappedItem.note,
                                    tax: mappedItem.tax,
                                },
                            ],
                        };
                    }
                });
                const cleanedExpenses = Object.values(groupedInvoices).map(item => {
                    if (item.itemized) {
                        delete item.note
                        delete item.amount;
                        delete item.category;
                        delete item.refId;
                    } else {
                        delete item.itemizedExpenses;
                        delete item.refId;
                    }

                    return item;
                });

                // Set the cleaned expenses to state
                setExpenses(cleanedExpenses);

            } catch (error) {
                console.error("Error reading Excel file:", error);
            }
        };
        reader.readAsArrayBuffer(file);
    };



    function parseDateInput(input) {
        // Check if the input is a number (likely an Excel serial date)
        if (typeof input === 'number') {
            return excelSerialToDate(input);
        }

        // Check if the input is a valid MM/DD/YYYY string
        if (typeof input === 'string' && /^[0-1]?\d\/[0-3]?\d\/\d{4}$/.test(input)) {
            return parseDate(input);
        }

        throw new Error("Invalid input format. Please provide either a valid Excel serial number or MM/DD/YYYY date string.");
    }

    // Function to convert Excel serial date to JavaScript Date
    function excelSerialToDate(serial) {
        const startDate = new Date(1900, 0, 1); // Excel starts from January 1, 1900
        // Excel has a leap year bug for the year 1900, so adjust the serial number if necessary
        if (serial > 60) {
            serial--; // Fix for Excel's incorrect leap year in 1900
        }
        const daysInMs = serial * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        return new Date(startDate.getTime() + daysInMs);
    }

    // Function to convert MM/DD/YYYY date string to JavaScript Date
    function parseDate(dateString) {
        const [month, day, year] = dateString.split('/').map(Number);
        if (
            isNaN(month) || month < 1 || month > 12 ||
            isNaN(day) || day < 1 || day > 31 ||
            isNaN(year) || year < 1000 || year > 9999
        ) {
            throw new Error("Invalid date format");
        }
        return new Date(year, month - 1, day); // JavaScript months are 0-based
    }

    const mapRowToItem = (row, source) => {
        const defaultCustomer = savedCustomers.find(c => c.name === "Default Customer");
        const customer = savedCustomers.find(customer => customer.name === row["Customer Name"]);
        const customerId = customer ? customer?._id : defaultCustomer._id;

        const item = {
            category: row["Expense Category"] || '',
            date: parseDateInput(row["Expense Date"]) || new Date(),
            customerId: customerId,
            reference: row["Reference#"] || row["Reference"] || "",
            note: row["Expense Description"] || "",
            amount: parseFloat(row["Total"]) || 0,
            total: parseFloat(row["Total"]) || 0,
            tax: parseInt(row["Expense Tax Amount"]) || 0,
            refId: row["Expense Reference ID"] || null,
            note: row["Notes"] || "",
            orgId: activeOrg,
            ownerUsername: currentUser?.username,
            itemized: false,  // Default to false, will be updated in handleExcel logic
            itemizedExpenses: [],  // Will be populated in handleExcel
        };

        // If the expense is itemized, initialize itemizedExpenses with the current row's data
        if (row["Expense Reference ID"] && row["Expense Category"] && row["Total"]) {
            item.itemized = false; // By default, it's not itemized unless grouped later
            item.itemizedExpenses.push({
                category: item.category,
                amount: item.amount,
                note: item.note,
                tax: item.tax,
            });
        }

        return item;
    };
    function excelSerialToDate(serial) {
        const startDate = new Date(1900, 0, 1); // Excel starts counting from January 1, 1900
        const daysInMs = serial * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        const excelDate = new Date(startDate.getTime() + daysInMs);
        return excelDate;
    }
    const handleSave = async () => {
        if (!activeOrg) return toast.error("active org not found")
        if (!currentUser.username) return toast.error("No user")
        setLoading(true)
        const res = await fetch("/api/adds/expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(expenses),
            credentials: "include",
        });
        const data = await res.json();
        setLoading(false);
        if (data?.status === 200 || data?.status === 201) {
            toast.success(data?.message);
            setFile(null);
            setExpenses([])
        } else {
            toast.error(data?.message || "reload the page and try again")
        }
    };
    if (loading) return <Loading />
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Import Expenses</h1>

            {!file && (
                <div className="mb-4">
                    <h3 className="font-semibold text-lg">Required Fields for Import:</h3>
                    <ul className="list-disc pl-5">
                        <li><strong>Expense Reference ID:</strong> Unique identifier for the expense. Example: EXP-12345</li>
                        <li><strong>Expense Category:</strong> The category of the expense. Example: Travel, Supplies</li>
                        <li><strong>Expense Date:</strong> The date of the expense. Example: 2024-11-23</li>
                        <li><strong>Customer Name:</strong> The customer the expense is associated with.</li>
                        <li><strong>Expense Description:</strong> A description of the expense.</li>
                        <li><strong>Total Amount:</strong> The total expense amount. Example: 1000</li>
                    </ul>
                </div>
            )}

            <p>
                Supported file formats:{" "}
                <span className="font-semibold">xlsx</span>
            </p>
            <input
                type="file"
                accept=".xlsx, .xls,"
                onChange={handleFileUpload}
                className="block mb-4"
            />
            {file && <p>File selected: {file.name}</p>}
            {expenses?.length > 0 && <button onClick={handleSave} className="btn-ghost bg-blue-700 text-white mt-4">
                Save
            </button>}
            {expenses?.length > 0 && (
                <div>
                    <h3 className="mt-4 font-semibold">Processed Expenses:</h3>
                    <ul className="list-disc pl-5">
                        {expenses.map((expense, index) => (
                            <li key={index}>
                                <strong>Reference:</strong> {expense.reference} <br />
                                <strong>Total:</strong> {expense.total} <br />
                                {expense.itemized ? (
                                    <div>
                                        <strong>Itemized Details:</strong>
                                        <ul>
                                            {expense.itemizedExpenses.map((item, idx) => (
                                                <li key={idx}>
                                                    <strong>Category:</strong> {item.category}, <strong>Amount:</strong> {item.amount}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p>No itemized details available.</p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSave} className="btn-ghost bg-blue-700 text-white mt-4">
                        Save
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImportExpensesPage;