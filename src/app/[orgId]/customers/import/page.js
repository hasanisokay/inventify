"use client";
import { useState } from "react";
import { parse } from "csv-parse/browser/esm";
import * as XLSX from "xlsx";
import decodeName from "@/utils/decodeName.mjs";

const Page = () => {
  const [file, setFile] = useState(null);
  const [customers, setCustomers] = useState([]); // State to hold imported items

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
          console.log("Parsed CSV data:", output);
          // Map the parsed data to match your item structure
          const formattedItems = output.map((row) => ({
            type: row["Product Type"] || "goods",
            name: row["Item Name"],
            unit: row["Usage unit"],
            category: row["CF.Category"] || row["Category"],
            sellingPrice: row["Rate"],
            description: row["Description"],
            status: row["Status"] || "Active",
            source: "CSV",
          }));
          setCustomers(formattedItems);
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
  
        const formattedItems = jsonData.map((row) => {
          let firstName = row["First Name"] || "";
          let lastName = row["Last Name"] || "";
          const name = row["Customer Name"] || "";
          if (!firstName || !lastName) {
            const decodedName = decodeName(name);
            firstName = decodedName.firstName || firstName;
            lastName = decodedName.lastName || lastName;
          }
  
          return {
            customerType: row["Customer Type"] || "Individual",
            name: name,
            firstName,
            lastName,
            salutation: row["Salutation"] || row["salutation"] || "",
            phone: row["Phone"] || row["phone"] || "",
            email: row["Email"] || row["email"] || "",
            note: row["Note"] || row["note"] || "",
            companyName: row["Company Name"] || row["Company"] || "",
            status: row["Status"] || "Active",
            source: "excel",
            createdTime: row["Created Time"] || new Date(),
            lastModifiedTime: row["Last Modified Time"] || new Date(),
            billingAddress: row["Billing Address"] || "",
            billingStreet: row["Billing Street"] || "",
            billingCity: row["Billing City"] || "",
            billingState: row["Billing State"] || "",
            billingCountry: row["Billing Country"] || "",
            billingCode: row["Billing Code"] || "",
            shippingAddress: row["Shipping Address"] || "",
            shippingStreet: row["Shipping Street"] || "",
            shippingCity: row["Shipping City"] || "",
            shippingState: row["Shipping State"] || "",
            shippingCountry: row["Shipping Country"] || "",
            shippingCode: row["Shipping Code"] || "",
            facebookId: row["Facebook"] || "",
          };
        });
  
        setCustomers(formattedItems);
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
        console.log("Parsed JSON data:", jsonData);
        // Map the parsed data to match your item structure
        const formattedItems = jsonData.map((row) => ({
          type: row["Product Type"] || "goods",
          name: row["Item Name"],
          unit: row["Usage unit"],
          category: row["CF.Category"] || row["Category"],
          sellingPrice: row["Rate"],
          description: row["Description"],
          status: row["Status"] || "Active",
          source: "JSON",
        }));
        setCustomers(formattedItems);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  console.log(customers);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Import Customers</h1>
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
      {customers.length > 0 && <button className="btn-submit">Save</button>}
      {file && (
        <div className="my-10">
          <h2 className="text-lg font-semibold mt-4">Imported Items</h2>
          {customers.length > 0 ? (
            <ul className="list-disc pl-5">
             {customers?.map((item, index) => (
  <li key={index}>
    <span>
      <strong>Name:</strong> {item?.salutation} {item?.name}
    </span>{" "}
    {item?.billingAddress && (
      <span>
        <strong>Billing:</strong> {item?.billingAddress}
      </span>
    )}{" "}
    {item?.shippingAddress && (
      <span>
        <strong>Shipping:</strong> {item?.shippingAddress}
      </span>
    )}{" "}
    {item?.phone && (
      <span>
        <strong>Phone:</strong> {item?.phone}
      </span>
    )}{" "}
    {item?.email && (
      <span>
        <strong>Email:</strong> {item?.email}
      </span>
    )}{" "}
    {item?.note && (
      <span>
        <strong>Note:</strong> {item?.note}
      </span>
    )}{" "}
    {item?.facebookId && (
      <span>
        <strong>Fb:</strong> {item?.facebookId}
      </span>
    )}{" "}
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
            <span className="font-semibold">First Name:</span> First name of the
            customer
            <br />
            <span className="text-gray-500">Example: Rafael</span>
          </li>
          <li>
            <span className="font-semibold">Last Name:</span> Last name of the
            customer
            <br />
            <span className="text-gray-500">Example: Hasan</span>
          </li>
          <li>
            <span className="font-semibold">Customer Name:</span> Full name of
            the customer (if not using separate first and last names)
            <br />
            <span className="text-gray-500">Example: Rafael Hasan</span>
          </li>
          <li>
            <span className="font-semibold">Company Name:</span> The name of the
            company associated with the customer (optional)
            <br />
            <span className="text-gray-500">Example: Beximco ltd</span>
          </li>
          <li>
            <span className="font-semibold">Phone:</span> Contact number of the
            customer
            <br />
            <span className="text-gray-500">Example: +8801712345678</span>
          </li>
          <li>
            <span className="font-semibold">Email:</span> Email address of the
            customer (optional)
            <br />
            <span className="text-gray-500">Example: hasan@example.com</span>
          </li>
          <li>
            <span className="font-semibold">Note:</span> Additional notes
            related to the customer (optional)
            <br />
            <span className="text-gray-500">
              Example: Customer is a fraud/loyal one.
            </span>
          </li>
          <li>
            <span className="font-semibold">Status:</span> Status of the
            customer; defaults to &#34;Active&#34; if not provided
            <br />
            <span className="text-gray-500">Example: Active</span>
          </li>
          <li>
            <span className="font-semibold">Created Time:</span> The time when
            the record was created(optional)
            <br />
            <span className="text-gray-500">Example: 2024-10-19T10:00:00Z</span>
          </li>
          <li>
            <span className="font-semibold">Billing Address:</span> The full
            billing address of the customer.
            <br />
            <span className="text-gray-500">
              Example: 123 Maple St, Dhaka, Bangladesh
            </span>
          </li>
          <li>
            <span className="font-semibold">Billing Street:</span> The street of
            the billing address
            <br />
            <span className="text-gray-500">Example: 123 Maple St</span>
          </li>
          <li>
            <span className="font-semibold">Billing City:</span> The city of the
            billing address
            <br />
            <span className="text-gray-500">Example: Dhaka</span>
          </li>
          <li>
            <span className="font-semibold">Billing State:</span> The state or
            region of the billing address
            <br />
            <span className="text-gray-500">Example: Dhaka Division</span>
          </li>
          <li>
            <span className="font-semibold">Billing Country:</span> The country
            of the billing address
            <br />
            <span className="text-gray-500">Example: Bangladesh</span>
          </li>
          <li>
            <span className="font-semibold">Billing Code:</span> The postal code
            of the billing address
            <br />
            <span className="text-gray-500">Example: 1000</span>
          </li>
          <li>
            <span className="font-semibold">Shipping Address:</span> The full
            shipping address of the customer
            <br />
            <span className="text-gray-500">
              Example: 456 Elm St, Chittagong, Bangladesh
            </span>
          </li>
          <li>
            <span className="font-semibold">Shipping Street:</span> The street
            of the shipping address
            <br />
            <span className="text-gray-500">Example: 456 Elm St</span>
          </li>
          <li>
            <span className="font-semibold">Shipping City:</span> The city of
            the shipping address
            <br />
            <span className="text-gray-500">Example: Chittagong</span>
          </li>
          <li>
            <span className="font-semibold">Shipping State:</span> The state or
            region of the shipping address
            <br />
            <span className="text-gray-500">Example: Chittagong Division</span>
          </li>
          <li>
            <span className="font-semibold">Shipping Country:</span> The country
            of the shipping address
            <br />
            <span className="text-gray-500">Example: Bangladesh</span>
          </li>
          <li>
            <span className="font-semibold">Shipping Code:</span> The postal
            code of the shipping address
            <br />
            <span className="text-gray-500">Example: 4000</span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Page;
