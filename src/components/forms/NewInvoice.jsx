/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useState, useEffect, useRef, useContext } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NewCustomerModal from "../modal/NewCustomerModal";
import NewItemModal from "../modal/NewItemModal";
import getCustomers from "@/utils/getCustomers.mjs";
import getCustomerDetails from "@/utils/getCustomerDetails.mjs";
import getItems from "@/utils/getItems.mjs";
import DragSVG from "../svg/DragSVG";
import Image from "next/image";
import generatePDF from 'react-to-pdf';
import AuthContext from "@/contexts/AuthContext.mjs";
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
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [totalTax, setTotalTax] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [trxId, setTrxId] = useState('');
  const [paymentFromNumber, setPaymentFromNumber] = useState("");
  const invoiceRef = useRef();
  const [sameAddress, setSameAddress] = useState(true)
  const { activeOrganization } = useContext(AuthContext);
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

  const calculateTax = (item) => {
    try {
      let amountObj = item.taxes.find(i => i.type === "amount");
      let percentageObj = item.taxes.find(i => i.type === "percentage");
      let amount = amountObj ? parseFloat(amountObj.value) || 0 : 0;
      let percentage = percentageObj ? parseFloat(percentageObj.value) || 0 : 0;

      if (percentage < 1) return amount;
      if (percentage > 0) {
        const matchedItem = items.find(i => i._id === item._id);
        const quantity = matchedItem.quantity;
        const sellingPrice = parseFloat(matchedItem.sellingPrice.split(" ")[1]) || 0;
        const tax = quantity * sellingPrice * (percentage / 100);
        return tax + amount;
      }
      return amount;
    } catch {
      return 0;
    }
  }

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
    const tax = items.reduce((sum, item) => sum + calculateTax(item), 0);
    setSubtotal(total + totalTax - discount || 0);
    setTotalTax(tax)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, discount]);
  useEffect(() => {
    if (paymentMethod === "not-paid" || paymentMethod === "cash-on-delivery") {
      setPaidAmount(0)
      setDueAmount(subtotal)
    } else {
      setPaidAmount(subtotal)
      if (dueAmount > 0) {
        setDueAmount(subtotal - paidAmount)
      }
    }
  }, [subtotal, paymentMethod])

  useEffect(() => {
    if (paidAmount === subtotal) {
      setDueAmount(0)
    }
  }, [paidAmount])

  const paymentOptions = [
    { label: "Not Paid", value: "not-paid" },
    { label: "Cash", value: "cash" },
    { label: "COD", value: "cash-on-delivery" },
    { label: "Bkash", value: "bkash" },
    { label: "Nagad", value: "nagad" },
    { label: "Roket", value: "roket" },
    { label: "Bank Transfer", value: "bank-transfer" },
  ]



  const getFullAddress = (a) => {
    const parts = [
      a?.street,
      a?.city,
      a?.state,
      a?.postalCode,
      a?.country
    ].filter(Boolean);
    return parts.join(', ');
  }
  const getFullBillingAddress = (a) => {
    const parts = [
      a?.billingStreet,
      a?.billingCity,
      a?.billingState,
      a?.billingCode,
      a?.billingCountry
    ].filter(Boolean);
    return parts.join(', ');
  }
  const getFullShippingAddress = (a) => {
    const parts = [
      a?.shippingStreet,
      a?.shippingCity,
      a?.shippingState,
      a?.shippingCode,
      a?.shippingCountry
    ].filter(Boolean);
    return parts.join(', ');
  }
  const getPaymentDetails = (value) => {
    const o = paymentOptions.find(option => option.value === value);
    const option = o ? o.label : "";
    if (subtotal === paidAmount) {
      return `Paid (${option})`
    }
    if (parseInt(paidAmount) === 0) {
      return "Not Paid"
    }
    if (parseInt(subtotal) > parseInt(paidAmount)) {
      return `Partially Paid (${option})`
    }

  }
  const pdfOptions = {
    filename: `${invoiceNumber}.pdf`,
    method: "save",

    page: {
      margin: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10,
      },
      format: "A4",
      orientation: "portrait",
    },
    canvas: {
      // default is 'image/jpeg' for better size performance
      mimeType: "image/png",
      qualityRatio: 1,
    },
    overrides: {
      // see https://artskydj.github.io/jsPDF/docs/jsPDF.html for more options
      pdf: {
        compress: true,
      },
      // see https://html2canvas.hertzen.com/configuration for more options
      canvas: {
        useCORS: true,
      },
    },
  };

  const openPDF = () => {
    generatePDF(() => document.getElementById("invoice-wrapper"), pdfOptions);
  };
  const handleSave = () => {

  }
  return (
    <div className="invoice-form p-2">

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
      {customerOptions?.firstName && <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={sameAddress}
          onChange={() => setSameAddress(!sameAddress)}
          className="mr-2"
        />
        <label className="font-semibold">Shipping address same as billing address</label>
      </div>}

      <div ref={invoiceRef} id="invoice-wrapper" className="p-2">
        <div id="invoice-top" className="justify-between flex">
          <div className="flex justify-between items-start">
            <div className="text-start w-[230px] h-auto mb-6 space-y-1">
              {activeOrganization?.logoUrl && <Image src={activeOrganization.logoUrl || ""} alt="Company Logo" width={100} height={100} />}
              <h1 className="text-xl font-semibold">{activeOrganization?.name}</h1>
              <p>{getFullAddress(activeOrganization?.address)}</p>
              <p>{activeOrganization?.phone}</p>
              <p>{activeOrganization?.website}</p>
              <p>{activeOrganization?.email}</p>
            </div>
          </div>
          {customerOptions?.firstName && <div className="flex flex-col flex-wrap items-start">
            <div className="flex flex-col gap-1 text-[14px]">
              <div className="flex font-semibold">
                <p className="w-[60px]">Invoice:</p> <p>{invoiceNumber}</p>
              </div>
              <div className="flex font-semibold">
                <p className="w-[60px]">Date: </p>
                <p>{invoiceDate?.toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

            </div>


            <div className="space-y-1 my-4">
              <p className="text-lg"><span className="font-bold"></span> {customerOptions.firstName} {customerOptions.lastName}</p>
              <h2 className="text-base font-semibold">Billing Address</h2>
              <p className="text-sm"><span className="font-semibold">Address:</span> {customerOptions.billingAddress || getFullBillingAddress(customerOptions) || "Not Provided"}</p>
              {
                customerOptions?.phone?.length > 0 && <p className="text-sm"><span className="font-semibold">Phone:</span> {customerOptions.phone}</p>
              }
              {
                customerOptions.companyName && <p className="text-sm"><span className="font-semibold">Company:</span> {customerOptions.companyName}</p>
              }
            </div>

            {!sameAddress && <div className="space-y-1 my-4">
              <h2 className="text-base font-semibold">Shipping Address</h2>
              <p className="text-sm"><span className="font-semibold">Address:</span> {customerOptions.shippingAddress || getFullShippingAddress(customerOptions) || "Not provided"}</p>
              {customerOptions?.phone?.length > 0 && <p className="text-sm"><span className="font-semibold">Phone:</span> {customerOptions.phone}</p>}
              {
                customerOptions.companyName && <p className="text-sm"><span className="font-semibold">Company:</span> {customerOptions.companyName}</p>
              }
            </div>}
          </div>}
        </div>
        {/* Item Table */}
        <div id="invoice-table-part" className="item-table mb-4 min-h-[100px]">
          {items?.length > 0 && <table className="min-w-full table-auto">
            <thead>
              <tr className="">
                <th>SL</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Tax</th>
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
                  <td className="group w-[50px]">
                    <div className="flex items-center">
                      {index + 1}.
                      <span
                        className="cursor-move w-[24px] inline-block opacity-0 group-hover:opacity-100"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                      >
                        <DragSVG />
                      </span>
                    </div>
                  </td>
                  <td className="group ">
                    <div className="flex items-center">
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
                      className="rounded bg-inherit focus:outline-none w-[70px] font-semibold pl-4"
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
                  <td>{item?.taxes?.length > 0 ? parseFloat(calculateTax(item)).toFixed(2) : 0}</td>
                  <td>{(item.quantity * parseFloat(item.sellingPrice.split(" ")[1])).toFixed(2)}</td>
                </tr>
              ))}
              {discount > 0 && <tr className="table-last-item">
                <td colSpan={6} className="text-right font-semibold">Discount:</td>
                <td>{discount.toFixed(2)}</td>
              </tr>}

              {dueAmount > 0 && <tr className="table-last-item">
                <td colSpan={6} className="text-right font-semibold">Due:</td>
                <td>{dueAmount}</td>
              </tr>}
              {paymentMethod && <tr className="table-last-item">
                <td colSpan={6} className="text-right font-semibold">Payment Status:</td>
                <td className="w-[230px]">{getPaymentDetails(paymentMethod)}</td>
              </tr>}

              <tr className="table-last-item">
                <td colSpan={6} className="text-right font-semibold">Subtotal:</td>
                <td>{subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>}
        </div>
        <div id="invoice-footer" className="my-4">
          {note?.trim()?.length > 0 && <p className="text-sm">*{note}</p>}
        </div>
      </div>
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
      {/* Subtotal and Discount */}
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
      <div className=" input-container ">
        <label htmlFor="invoiceDate" className="font-semibold w-[100px]">Date: </label>
        <DatePicker
          id="invoiceDate"
          selected={invoiceDate}
          onChange={(date) => setInvoiceDate(date)}
          dateFormat="do MMM yyyy"
          className="bg-inherit focus:outline-none outline-none border-none p-2 font-medium"
        />
      </div>
      <div className="mb-4 input-container">
        <label htmlFor="paymentMethod" className="form-label">Payment Method</label>
        <Select
          id="paymentMethod"
          options={paymentOptions}
          placeholder="Select Payment Method"
          onChange={(option) => setPaymentMethod(option.value)}
          className="min-w-[250px]"
        />
      </div>
      <div className="mb-4 input-container">
        <label htmlFor="paidAmount" className="form-label">Paid Amount</label>
        <input
          type="number"
          id="paidAmount"
          value={paidAmount}
          // min={0}
          onChange={(e) => {
            if (parseInt(e.target.value) > subtotal) return
            const paid = parseFloat(e.target.value) || 0;
            setPaidAmount(paid);
            const newDue = subtotal - paid;
            setDueAmount(newDue > 0 ? newDue : 0);
          }}
          className="text-input"
        />
      </div>
      <div className="mb-4 input-container">
        <label htmlFor="discount" className="form-label">Discount</label>
        <input
          type="number"
          id="discount"
          value={discount}
          onChange={(e) => setTrxId(e.target.value)}
          className="text-input"
        />
      </div>
      <div className="input-container">
        <label htmlFor="invoiceNumber" className="w-[100px] font-semibold">Invoice: </label>
        <input
          type="text"
          id="invoiceNumber"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="bg-white font-medium p-2"
        />
      </div>
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



      {/* Save and Save & Print Buttons */}
      <div className="flex space-x-4">
        <button
          className="bg-blue-500 p-2 rounded"
          onClick={handleSave}
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
