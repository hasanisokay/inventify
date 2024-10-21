'use client'
import React, { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NewCustomerModal from "../modal/NewCustomerModal";
import NewItemModal from "../modal/NewItemModal";
import getCustomers from "@/utils/getCustomers.mjs";
import getCustomerDetails from "@/utils/getCustomerDetails.mjs";
import getItems from "@/utils/getItems.mjs";
import Drag from "../svg/Drag";

const NewInvoice = ({ activeOrg }) => {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [openItemModal, setOpenItemModal] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [sameAddress, setSameAddress] = useState(true);
  const [draggingIndex, setDraggingIndex] = useState(null);

  // Handle drag start
  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };

  // Handle drag over
  const handleDragOver = (index) => {
    if (index !== draggingIndex) {
      const reorderedItems = [...items];
      const draggedItem = reorderedItems[draggingIndex];
      reorderedItems.splice(draggingIndex, 1);
      reorderedItems.splice(index, 0, draggedItem);
      setItems(reorderedItems);
      setDraggingIndex(index);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  function generateInvoiceNumber() {
    const timestamp = Date.now();
    return `INV-${timestamp}`;
  }

  useEffect(() => {
    (async () => {
      const c = await getCustomers(1, 10000, "newest", "", true, activeOrg)
      setSavedCustomers(c);
      const i = await getItems(1, 10000, "newest", "", true, activeOrg)
      setSavedItems(i);
    })()
  }, [])

  // Fetch customer details on selection
  useEffect(() => {
    (async () => {
      if (selectedCustomer) {
        const c = await getCustomerDetails(selectedCustomer?.value)
        setCustomerOptions(c);
      }
    })()
  }, [selectedCustomer]);

  // Handle customer selection, including the "Add customer" option
  const handleCustomerChange = (option) => {
    if (option.value === "add-new-customer") {
      setOpenCustomerModal(true);
    } else {
      setSelectedCustomer(option);
    }
  };

  // Handle item selection or addition
  const handleItemChange = (option) => {
    if (option.value === "add-new-item") {
      setOpenItemModal(true);
    } else {
      const selectedItem = savedItems.find((item) => item._id === option.value);
      setItems((prevItems) => [
        ...prevItems,
        { ...selectedItem, quantity: 1 },
      ]);
    }
  };

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.quantity * (parseFloat(item.sellingPrice.split(" ")[1]).toFixed(2)), 0);
    setSubtotal(total || 0);
  }, [items]);
  console.log(items)
  return (
    <div className="invoice-form">
      <div className="input-container mb-4">
        <label htmlFor="invoiceNumber" className="form-label">Invoice: </label>
        <input
          type="text"
          id="invoiceNumber"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="text-input"
        />
      </div>

      <div className="mb-4 input-container">
        <label htmlFor="invoiceDate" className="form-label">Invoice Date</label>
        <DatePicker
          id="invoiceDate"
          selected={invoiceDate}
          onChange={(date) => setInvoiceDate(date)}
          dateFormat="do MMM yyyy"
          className="text-input"
        />
      </div>

      <div className="mb-4 input-container">
        <label htmlFor="customer" className="form-label">Customer</label>
        <Select
          className="min-w-[250px]"
          id="customer"
          options={[
            { label: "Add New Customer", value: "add-new-customer" },
            ...savedCustomers?.map((c) => ({
              label: `${c.firstName} ${c.lastName}`,
              value: c._id,
            })),

          ]}
          placeholder="Select or Add Customer"
          onChange={handleCustomerChange}
        />
      </div>

      {/* Item Selection */}
      <div className="mb-4 input-container">
        <label htmlFor="item" className="form-label">Item</label>
        <Select
          className="min-w-[250px]"
          id="item"
          options={[
            { label: "Add New Item", value: "add-new-item" },
            ...savedItems?.map((item) => ({
              label: item.name,
              value: item._id,
            })),

          ]}
          placeholder="Select or Add Item"
          onChange={handleItemChange}
        />
      </div>

      {/* Item Table */}
      <div className="item-table mb-4">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="">
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item, index) => (
              <tr key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={() => handleDragOver(index)}
                onDragEnd={handleDragEnd}
                className={draggingIndex === index ? "bg-gray-400" : ""}
              >
                <td className="group ">
                  <div className="flex items-center">
                    <span
                      className="cursor-move inline-block opacity-0 group-hover:opacity-100"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                    >
                      <Drag />
                    </span>
                    <span>{item.name}</span>
                    <button
                      className="text-red-500 hover:underline group-hover:opacity-100 opacity-0 pl-2 font-semibold text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItems((prev) => prev.filter((i) => i._id !== item?._id));
                      }}
                    >
                      Delete
                    </button>
                  </div>

                </td>
                <td>
                  <input
                    type="number"
                    className="rounded bg-gray-100 focus:outline-none w-[70px] font-semibold pl-4"
                    value={item.quantity}
                    min={1}
                    minLength={0.1}
                    onChange={(e) =>
                      setItems((prevItems) =>
                        prevItems.map((it, i) =>
                          i === index ? { ...it, quantity: parseFloat(e.target.value) } : it
                        )
                      )
                    }
                  />
                </td>
                <td>{item.unit}</td>
                <td>{parseFloat(item.sellingPrice.split(" ")[1]).toFixed(2)}</td>
                <td>{(item.quantity * parseFloat(item.sellingPrice.split(" ")[1])).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subtotal and Discount */}
      <div className="mb-4">
        <label htmlFor="subtotal" className="font-semibold">Subtotal: BDT {subtotal.toFixed(2)}</label>
      </div>
      <div className="mb-4 input-container">
        <label htmlFor="discount" className="form-label">Discount</label>
        <input
          type="number"
          id="discount"
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value))}
          className="text-input"
        />
      </div>

      {/* Note */}
      <div className="mb-4 input-container">
        <label htmlFor="note" className="form-label">Note</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="text-input resize"
        />
      </div>
      {/* shipping details here */}
      <div className="flex flex-wrap items-start gap-6 md:ml-4">
        <div className="space-y-1 my-4">
          <h2 className="text-lg font-semibold">Billing Address</h2>
          <p className="text-sm"><span className="font-semibold">Name:</span> {customerOptions.firstName} {customerOptions.lastName}</p>
          <p className="text-sm"><span className="font-semibold">Address:</span> {customerOptions.billingAddress || "Not Provided"}</p>
          <p className="text-sm"><span className="font-semibold">Phone:</span> {customerOptions.phone}</p>
          {
            customerOptions.companyName && <p className="text-sm"><span className="font-semibold">Company:</span> {customerOptions.companyName}</p>
          }
        </div>
        <div className="space-y-1 my-4">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <p className="text-sm"><span className="font-semibold">Name:</span> {customerOptions.salutation} {customerOptions.firstName} {customerOptions.lastName}</p>
          <p className="text-sm"><span className="font-semibold">Address:</span> {customerOptions.shippingAddress || "Not provided"}</p>
          <p className="text-sm"><span className="font-semibold">Phone:</span> {customerOptions.phone}</p>
          {
            customerOptions.companyName && <p className="text-sm"><span className="font-semibold">Company:</span> {customerOptions.companyName}</p>
          }
        </div>      </div>
      {/* Save and Save & Print Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => {
            // Handle saving the invoice
            console.log("Saving invoice...");
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            // Handle saving and printing the invoice
            console.log("Saving and printing invoice...");
            // Optionally trigger print logic here
          }}
        >
          Save & Print
        </button>
      </div>

      {/* Modals */}
      <NewCustomerModal
        openModal={openCustomerModal}
        setOpenModal={setOpenCustomerModal}
      />
      <NewItemModal
        openModal={openItemModal}
        setOpenModal={setOpenItemModal}
        onAddItem={(item) => handleAddItem(item)}
      />
    </div>
  );
};

export default NewInvoice;
