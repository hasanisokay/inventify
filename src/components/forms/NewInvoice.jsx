'use client'
import React, { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NewCustomerModal from "../modal/NewCustomerModal";
import NewItemModal from "../modal/NewItemModal";
import getCustomers from "@/utils/getCustomers.mjs";
import getCustomerDetails from "@/utils/getCustomerDetails.mjs";


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


  // Generate a random invoice number
  function generateInvoiceNumber() {
    return `INV-${Math.floor(Math.random() * 1000000)}`;
  }

  useEffect(() => {
    // const getCustomers = async (page, limit, sort, keyword = "", titleOnly="")
    (async () => {
      const c = await getCustomers(1, 10000, "newest", "", true, activeOrg)
      setSavedCustomers(c);
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
  console.log(customerOptions)
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
  useEffect(() => { })

  // Update subtotal whenever items or discount change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    setSubtotal(total);
  }, [items]);

  return (
    <div className="invoice-form">
      {/* Customer Select */}
      <div className="mb-4">
        <label htmlFor="customer">Customer</label>
        <Select
          className="w-[300px] pl-1 ml-2"
          id="customer"
          options={[
            ...savedCustomers?.map((c) => ({
              label: `${c.firstName} ${c.lastName}`,
              value: c._id,
            })),
            { label: "Add New Customer", value: "add-new-customer" },
          ]}
          placeholder="Select or Add Customer"
          onChange={handleCustomerChange}
        />
      </div>

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

      {/* Item Selection */}
      <div className="mb-4">
        <label htmlFor="item">Item</label>
        <Select
          className="w-[300px] pl-1 ml-2"
          id="item"
          options={[
            ...savedItems?.map((item) => ({
              label: item.name,
              value: item._id,
            })),
            { label: "Add New Item", value: "add-new-item" },
          ]}
          placeholder="Select or Add Item"
          onChange={handleItemChange}
        />
      </div>

      {/* Item Table */}
      <div className="item-table mb-4">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      setItems((prevItems) =>
                        prevItems.map((it, i) =>
                          i === index ? { ...it, quantity: parseInt(e.target.value) } : it
                        )
                      )
                    }
                  />
                </td>
                <td>{item.unit}</td>
                <td>{item.rate}</td>
                <td>{(item.quantity * item.rate).toFixed(2)}</td>
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
