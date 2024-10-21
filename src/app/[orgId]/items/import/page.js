"use client";
import { useContext, useState } from "react";
import { parse } from "csv-parse/browser/esm";
import * as XLSX from "xlsx";
import AuthContext from "@/contexts/AuthContext.mjs";
import toast from "react-hot-toast";

const Page = () => {
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const { currentUser, activeOrganization } = useContext(AuthContext);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    if (!uploadedFile) return;

    const fileType = uploadedFile.type;

    // Determine the file type and handle accordingly
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
          setItems(formattedItems);
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
        const formattedItems = jsonData.map((row) =>
          mapRowToItem(row, "excel")
        );
        setItems(formattedItems);
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
        setItems(formattedItems);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  // Helper function to map row data to the item structure
  const mapRowToItem = (row, source) => {
    return {
      type: row["Product Type"] || "goods",
      name: row["Item Name"],
      unit: row["Usage unit"],
      category: row["CF.Category"] || row["Category"],
      sellingPrice: row["Rate"],
      description: row["Description"],
      status: row["Status"] || "Active",
      source: source,
      taxes: parseTaxes(row),
      orgId: activeOrganization?.orgId,
      ownerUsername: currentUser?.username,
    };
  };

  // Utility function to parse taxes from a row of data
  const parseTaxes = (row) => {
    const taxes = [];
    const taxPercentage =
      row["Tax1 Percentage"]?.trim() || row["Tax Percentage"]?.trim();
    const taxAmount = row["Tax1 Amount"]?.trim() || row["Tax Amount"]?.trim();
    const tax = row["Tax"]?.trim();

    if (taxPercentage) {
      taxes.push({
        type: "percentage",
        value: taxPercentage,
      });
    }

    if (taxAmount) {
      taxes.push({
        type: "amount",
        value: taxAmount,
      });
    }

    if (tax) {
      taxes.push({
        type: "amount",
        value: tax,
      });
    }

    return taxes.length > 0 ? taxes : [];
  };
  const handleSave = async () => {
    if (!activeOrganization.orgId) return toast.error("active org not found");
    if (!currentUser.username) return toast.error("No user");
    const res = await fetch("/api/adds/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
      credentials: "include",
    });
    const data = await res.json();
    if (data?.status === 200 || data?.status === 201) {
      toast.success(data?.message);
    setFile(null)
    setItems([])
    }
  };
  console.log(items);
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Import Items</h1>
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
      {items?.length > 0 && (
        <button onClick={handleSave} className="btn-submit">
          Save
        </button>
      )}
      {file && (
        <div className="my-10">
          <h2 className="text-lg font-semibold mt-4">Imported Items</h2>
          {items.length > 0 ? (
            <ul className="list-disc pl-5">
              {items.map((item, index) => (
                <li key={index}>
                  <span>Name: {item.name}</span>{" "}
                  <span>Price: {item.sellingPrice}</span>{" "}
                  <span>Unit: {item.unit}</span>{" "}
                  <span>Category: {item.category}</span>{" "}
                  <span>Description: {item.description}</span>{" "}
                </li>
              ))}
            </ul>
          ) : (
            <p>No items imported yet.</p>
          )}
        </div>
      )}

      {!file && (
        <p className="font-semibold my-2">
          For a better import make sure your file has these fields:
        </p>
      )}
      {!file && (
        <ul className="list-disc list-inside">
          <li>
            <span className="font-semibold">Item Name:</span> Name of the item
            <br />
            <span className="text-gray-500">Example: Sundarbaner Modhu</span>
          </li>
          <li>
            <span className="font-semibold">Product Type:</span> Type of the
            product (e.g., goods or service)
            <br />
            <span className="text-gray-500">Example: goods</span>
          </li>
          <li>
            <span className="font-semibold">Rate:</span> Selling price of the
            item
            <br />
            <span className="text-gray-500">Example: BDT 330.00</span>
          </li>
          <li>
            <span className="font-semibold">CF.Category Or Category:</span>{" "}
            Category of the item
            <br />
            <span className="text-gray-500">Example: Honey</span>
          </li>
          <li>
            <span className="font-semibold">Usage unit:</span> Unit of
            measurement (e.g., kg, piece)
            <br />
            <span className="text-gray-500">Example: kg</span>
          </li>
          <li>
            <span className="font-semibold">Description:</span> Optional
            description of the item
            <br />
            <span className="text-gray-500">
              Example: Traditional sweet made from palm sugar.
            </span>
          </li>
          <li>
            <span className="font-semibold">
              Tax1 Percentage Or Tax Percentage:
            </span>{" "}
            Tax percentage applicable to the item (if any)
            <br />
            <span className="text-gray-500">Example: 15</span>
          </li>
          <li>
            <span className="font-semibold">Tax1 Amount Or Tax Amount:</span>{" "}
            Tax amount applicable to the item (if any)
            <br />
            <span className="text-gray-500">Example: BDT 49.50</span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Page;
