"use client"
import { useContext, useState } from "react";
import { parse } from "csv-parse/browser/esm";
import * as XLSX from "xlsx";
import decodeName from "@/utils/decodeName.mjs";
import excelSerialToDate from "@/utils/excelSerialToDate.mjs";
import toast from "react-hot-toast";
import AuthContext from "@/contexts/AuthContext.mjs";

const ImportCustomersPage = () => {
    const [file, setFile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const { currentUser, activeOrganization } = useContext(AuthContext);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    if (!uploadedFile) return;
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
        const formattedItems = jsonData.map((row) => mapRowToItem(row, "excel"));
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
        const formattedItems = jsonData.map((row) => mapRowToItem(row, "JSON"));
        setCustomers(formattedItems);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };
  
  // Helper function to map row data to the item/customer structure
  const mapRowToItem = (row, source) => {
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
      source: source,
      createdTime: excelSerialToDate(row["Created Time"]) || new Date(),
      lastModifiedTime: excelSerialToDate(row["Last Modified Time"]) || new Date(),
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
      orgId: activeOrganization?.orgId,
      ownerUsername: currentUser?.username,
    };
  };

  const handleSave = async () => {
    if(!activeOrganization.orgId) return toast.error("active org not found")
    if(!currentUser.username) return toast.error("No user")
    const res = await fetch("/api/adds/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customers),
      credentials: "include",
    });
    const data = await res.json();
    if (data?.status === 200 || data?.status === 201) {
      toast.success(data?.message);
      setFile(null);
      setCustomers([])
    }
  };
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
      {customers?.length > 0 && (
        <button onClick={handleSave} className="btn-submit">
          Save
        </button>
      )}
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
            <span className="font-semibold">Customer Name:</span> Full name of
            the customer
            <br />
            <span className="text-gray-500">Example: Rafael Hasan</span>
          </li>
          <li>
            <span className="font-semibold">Salutation:</span> Salutation
            the customer. Default will be nothing if not provided.
            <br />
            <span className="text-gray-500">Example: Mr, Mrs, Dr etc.</span>
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

export default ImportCustomersPage;