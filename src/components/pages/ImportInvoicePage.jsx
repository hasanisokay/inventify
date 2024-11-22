"use client"
import { useContext, useEffect, useState } from "react";
import { parse } from "csv-parse/browser/esm";
import * as XLSX from "xlsx";
import decodeName from "@/utils/decodeName.mjs";
import excelSerialToDate from "@/utils/excelSerialToDate.mjs";
import toast from "react-hot-toast";
import AuthContext from "@/contexts/AuthContext.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import getCustomers from "@/utils/getCustomers.mjs";
import getItems from "@/utils/getItems.mjs";
import Loading from "../loader/Loading";

const ImportInvoicePage = () => {
    const [file, setFile] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const { currentUser } = useContext(AuthContext); ``
    const [savedCustomers, setSavedCustomers] = useState([]);
    const [savedItems, setSavedItems] = useState([]);
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
            const i = await getItems(1, 10000, "newest", "", true, activeOrg)
            setSavedItems(i);
            setLoading(false)
        })()
    }, [activeOrg])

    useEffect(() => {
        (async () => {
            const a = await getActiveOrg();
            setActiveOrg(a);
        })()
    }, [])
    function generateInvoiceNumber() {
        const timestamp = Date.now();
        return `INV-${timestamp}`;
    }
    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
        if (!uploadedFile) return;
        if (savedCustomers?.length < 1) return;
        if (savedItems?.length < 1) return;

        const fileType = uploadedFile.type;
        if (fileType.includes("csv")) {
            handleCSV(uploadedFile);
        } else if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
            handleExcel(uploadedFile);
        } else if (fileType.includes("json")) {
            handleJSON(uploadedFile);
        } else {
            console.error("Unsupported file type");
        }
    };

    const handleCSV = (file) => {
        const reader = new FileReader();
        reader.onload = () => {
            parse(reader.result, { columns: true }, (err, output) => {
                if (err) {
                    console.error("Error parsing CSV:", err);
                } else {
                    const formattedItems = output.map((row) => mapRowToItem(row, "CSV"));
                    setInvoices(formattedItems);
                }
            });
        };
        reader.readAsText(file);
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

                // Object to store invoices grouped by Invoice Number
                const groupedInvoices = {};

                jsonData.forEach((row) => {
                    const invoiceNumber = row["Invoice Number"];
                    const mappedItem = mapRowToItem(row, "excel");
                    // If the invoice already exists, append the item to its items array
                    if (groupedInvoices[invoiceNumber]) {
                        groupedInvoices[invoiceNumber].items.push(...mappedItem.items);
                    } else {
                        // Otherwise, create a new invoice entry with this item
                        groupedInvoices[invoiceNumber] = mappedItem;
                    }
                });

                // Convert the groupedInvoices object into an array and set it as customers (or invoices)
                const formattedInvoices = Object.values(groupedInvoices);
                setInvoices(formattedInvoices);
            } catch (error) {
                console.error("Error reading Excel file:", error);
            }
        };
        reader.readAsArrayBuffer(file);
    };
    const handleJSON = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                const formattedItems = jsonData.map((row) => mapRowToItem(row, "JSON"));
                setInvoices(formattedItems);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };
        reader.readAsText(file);
    };

    const mapRowToItem = (row, source) => {
        const customer = savedCustomers.find(customer => customer.name === row["Customer Name"]);
        const customerId = customer ? customer?._id : null;
        const item = {
            itemId: savedItems.find(item => item.name === row["Item Name"])?._id,
            name: row["Item Name"],
            quantity: row["Quantity"],
            unit: row["Usage unit"],
            sellingPrice: row["Item Price"],
            tax: 0
        };
        return {
            invoiceNumber: row["Invoice Number"] || generateInvoiceNumber(),
            invoiceDate: excelSerialToDate(row["Invoice Date"]) || "",
            customerId: customerId,
            items: [item],
            subtotal: row["SubTotal"] || "",
            shippingCharge: row["Shipping Charge"] || 0,
            total: row["Total"] || 0,
            discount: parseInt(row["Entity Discount Amount"]) || 0,
            totalTax: 0,
            dueAmount: 0,
            paidAmount: row["Total"],
            paymentMethod: "cash",
            trxId: "",
            paymentFromNumber: "",
            note: row["Notes"] || "",
            adjustmentDescription: row["Adjustment Description"] || "",
            adjustmentAmount: row["Adjustment"] || "",
            orderNumber: "",
            orgId: activeOrg,
            ownerUsername: currentUser?.username,
        };
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
        const res = await fetch("/api/adds/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(invoices),
            credentials: "include",
        });
        const data = await res.json();
        setLoading(false);
        if (data?.status === 200 || data?.status === 201) {
            toast.success(data?.message);
            setFile(null);
            setInvoices([])
        }
    };
    if (loading) return <Loading />
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Import Invoices</h1>
            <div className="mb-4">
                <h3 className="font-semibold text-lg">Required Fields for Import:</h3>
                <ul className="list-disc pl-5">
                    <li><strong>Invoice Number:</strong> Unique identifier for the invoice. Example: INV-12345</li>
                    <li><strong>Invoice Date:</strong> The date the invoice was issued. Example: 2024-11-23</li>
                    <li><strong>Customer Name:</strong> The customer the invoice is for. This should match an existing customer. Example: Abdullah</li>
                    <li><strong>Item Name:</strong> The name of the item being invoiced. Example: Modhu</li>
                    <li><strong>Quantity:</strong> Number of items. Example: 2</li>
                    <li><strong>Item Price:</strong> The price of each item. Example: 500</li>
                    <li><strong>SubTotal:</strong> Total price before shipping and taxes. Example: 1000</li>
                    <li><strong>Shipping Charge:</strong> The cost of shipping. Example: 50</li>
                    <li><strong>Total:</strong> Total invoice amount after shipping and taxes. Example: 1050</li>
                </ul>
            </div>
            <p>
                Supported file formats:{" "}
                <span className="font-semibold">xlsx, csv, json</span>
            </p>
            <input
                type="file"
                accept=".csv, .xlsx, .xls, .json"
                onChange={handleFileUpload}
                className="block mb-4"
            />
            {file && <p>File selected: {file.name}</p>}
            {invoices?.length > 0 && (
                <button onClick={handleSave} className="btn-submit">
                    Save
                </button>
            )}
        </div>
    );
};

export default ImportInvoicePage;