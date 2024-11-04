/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NewCustomerModal from "../modal/NewCustomerModal";
import NewItemModal from "../modal/NewItemModal";
import getCustomers from "@/utils/getCustomers.mjs";
import getCustomerDetails from "@/utils/getCustomerDetails.mjs";
import getItems from "@/utils/getItems.mjs";
import DragSVG from "../svg/DragSVG";


import AuthContext from "@/contexts/AuthContext.mjs";
import toast from "react-hot-toast";
import CrossSVG from "../svg/CrossSVG";
import CustomerModal from "../modal/CustomerModal";
import PrintInvoiceModal from "../modal/PrintInvoiceModal";
import Loading from "../loader/Loading";
const NewInvoice = ({ activeOrg, id }) => {
  const [openCustomerDetailsModal, setOpenCustomerDetailsModal] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(0)
  const [currency, setCurrency] = useState("BDT")
  const [loading, setLoading] = useState(false);
  const [selectedItemOnchangeHolder, setSelectedItemOnchangeHolder] = useState(null);
  const [updateable, setUpdateable] = useState(false);
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
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("");
  const [trxId, setTrxId] = useState('');
  const [paymentFromNumber, setPaymentFromNumber] = useState("");
  const [openPrintInvoiceModal, setOpenPrintInvoiceModal] = useState(false)
  const [sameAddress, setSameAddress] = useState(true)
  const { activeOrganization, currentUser } = useContext(AuthContext);
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

  const getPreviousInvoiceData = async (id) => {
    try {
      const res = await fetch(`/api/gets/invoice?id=${id}`)
      const data = await res.json();
      if (data.status === 200) {
        return data.data;
      } else {
        return []
      }
    } catch {
      return []
    } finally {
    }

  }
  useEffect(() => {
    (async () => {
      if (id && savedItems?.length > 0) {
        setLoading(true)
        const data = await getPreviousInvoiceData(id)
        if (data._id) {
          const c = await getCustomerDetails(data.customerId)
          setCustomerOptions(c);

          const itemsWithQuantity = data.items.map(i => ({
            itemId: i.itemId,
            quantity: i.quantity,
            tax: i.tax,
            sellingPrice: i.sellingPrice
          }));

          const itemsWithDetails = savedItems
            .filter(item => itemsWithQuantity.some(k => k.itemId === item._id))
            .map(item => {
              const foundItem = itemsWithQuantity.find(k => k.itemId === item._id);
              return {
                ...item,
                quantity: foundItem ? foundItem.quantity : 1,
                tax: foundItem ? foundItem.tax : 1,
                sellingPrice: foundItem ? foundItem.sellingPrice : 0
              };
            });
          setItems(itemsWithDetails);
          setCurrency(data?.currency || "BDT");
          setNote(data.note);
          setSubtotal(data.subtotal)
          setTotal(data.total)
          setShippingCharge(data.shippingCharge);
          setPaidAmount(data.paidAmount);
          setDueAmount(data.dueAmount);
          setDiscount(data.discount)
          setPaymentFromNumber(data.paymentFromNumber);
          setPaymentMethod(data.paymentMethod);
          setInvoiceDate(new Date(data.invoiceDate));
          setInvoiceNumber(data.invoiceNumber);
          setTotalTax(data.totalTax);
          setTrxId(data.trxId);
          setUpdateable(true);
        }
        setLoading(false);
      }
    })()
  }, [id, savedItems])

  useEffect(() => {
    (async () => {
      setLoading(true)
      const c = await getCustomers(1, 10000, "newest", "", true, activeOrg)
      setSavedCustomers(c);
      const i = await getItems(1, 10000, "newest", "", true, activeOrg)
      setSavedItems(i);
      setLoading(false)
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
        const sellingPrice = matchedItem.sellingPrice;
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
      setSelectedItemOnchangeHolder(option)
      const isPreviouslyAdded = items.find(i => i._id === option.value)
      if (isPreviouslyAdded) {

        setItems((prev) => items.map((item, index) => item._id === option.value ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        const selectedItem = savedItems.find((item) => item._id === option.value);
        const { taxes, ...itemsWithoutTaxes } = selectedItem;
        setItems((prevItems) => {
          const modifiedItem = [
            ...prevItems,
            {
              ...itemsWithoutTaxes, quantity: 1,
              tax: calculateTax(selectedItem),
              sellingPrice: parseFloat(selectedItem?.sellingPrice?.split(" ")[1]) || 0,
            },
          ]
          return modifiedItem

        });
      }
      // setSelectedItemOnchangeHolder(null)
      setTimeout(() => {
        setSelectedItemOnchangeHolder(null)
      }, 300);
    }
  };
  const handleAddItemFromModal = (item) => {
    setItems((prevItems) => [
      ...prevItems,
      { ...item, quantity: 1 },
    ]);
  }
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
    const tax = items.reduce((sum, item) => sum + item.tax, 0);
    setSubtotal(total + totalTax || 0);
    setTotal(total + totalTax + shippingCharge - discount || 0);
    setTotalTax(tax)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, totalTax]);

  useEffect(() => {
    setTotal(subtotal + shippingCharge - discount)
  }, [shippingCharge, discount])
  useEffect(() => {
    if (paidAmount === total) {
      setDueAmount(0)
    }else if(paidAmount===0){
      setDueAmount(total)
    }
     else {
      setDueAmount(total - paidAmount)
    }
  }, [paidAmount,items, total])

  const paymentOptions = [
    { label: "Not Paid", value: "not-paid" },
    { label: "Cash", value: "cash" },
    { label: "COD", value: "cash-on-delivery" },
    { label: "Bkash", value: "bkash" },
    { label: "Nagad", value: "nagad" },
    { label: "Rocket", value: "rocket" },
    { label: "Bank Transfer", value: "bank-transfer" },
  ]

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
  const getPaymentLabel = (value) => {
    const o = paymentOptions.find(option => option.value === value);
    const option = o ? o.label : "";
    return option;
  }


  const resetStates = () => {
    setSelectedCustomer(null);
    setInvoiceNumber(generateInvoiceNumber());
    setInvoiceDate(new Date());
    setItems([]);
    setSubtotal(0);
    setDiscount(0);
    setNote("");
    setPaidAmount(0);
    setDueAmount(0);
    setPaymentMethod("");
    setTrxId("");
    setPaymentFromNumber("");
    setSameAddress(true);
    setUpdateable(false);
    setShippingCharge(0)
  };

  const handleSave = async (createPdf = false) => {
    if (!customerOptions._id) return toast.error("No Customer Found.")
    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      customerId: customerOptions._id,
      items: items.map(item => ({
        itemId: item?._id,
        name: item?.name,
        quantity: item?.quantity,
        unit: item?.unit,
        sellingPrice: item.sellingPrice,
        tax: item.tax,
      })),
      subtotal,
      shippingCharge,
      total,
      discount,
      totalTax,
      dueAmount,
      paidAmount,
      paymentMethod,
      trxId,
      paymentFromNumber,
      note,
      ownerUsername: currentUser?.username,
      orgId: activeOrg,
    };

    try {
      let apiUrl = '/api/adds/new-invoice';
      let method = 'POST'
      if (updateable) {
        apiUrl = '/api/updates/invoice';
        method = "PUT";
      }
      const res = await fetch(apiUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(invoiceData)
      })
      const data = await res.json()
      if (data.status === 200 || data.status === 201) {
        toast.success(data.message);
        if (createPdf) {
          setOpenPrintInvoiceModal(true)
        } else {
          resetStates()
        }

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error("Error saving invoice:", error);

    }
  };

  return (
    <div className="invoice-form p-2 mt-10">
      {loading && <Loading loading={loading} />}
      <div className="mb-4 input-container ">
        <label htmlFor="customer" className="form-label2">Select Customer</label>
        <Select
          className="md:w-[420px] w-[] select-react z-50"
          id="customer"
          theme={{ borderRadius: '10px' }}
          options={[
            { label: "Add New Customer", value: "add-new-customer" },
            ...savedCustomers?.map((c) => ({
              label: `${c.firstName} ${c.lastName}`,
              value: c._id,
            })),
          ]}
          placeholder={loading ? "Loading Customers..." : "Select or Add Customer"}
          onChange={handleCustomerChange}
        />
      </div>

      <div className="flex flex-wrap justify-between my-4 md:mx-10 mx-2">
        <div className={`space-y-1 transition-transform duration-1000 transform ${customerOptions.firstName ? 'translate-x-0' : '-translate-x-full'}`}>
          <p className="text-xl font-bold">{customerOptions.firstName} {customerOptions.lastName}</p>
          {customerOptions?.billingAddress && <h2 className="text-base font-semibold">Billing Address</h2>}
          {customerOptions.firstName && <p className="text-sm"><span className="font-semibold"></span> {customerOptions.billingAddress || getFullBillingAddress(customerOptions) || ""}</p>}
          {customerOptions?.shippingAddress && !sameAddress && <h2 className="text-base font-semibold">Shipping Address</h2>}
          {customerOptions.firstName && !sameAddress && <p className="text-sm"><span className="font-semibold"></span> {customerOptions.shippingAddress || getFullShippingAddress(customerOptions)}</p>}

          {customerOptions?.phone?.length > 0 && <p className="text-sm"><span className="font-semibold">Phone:</span> {customerOptions.phone}</p>}
          {customerOptions.companyName && <p className="text-sm"><span className="font-semibold">Company:</span> {customerOptions.companyName}</p>}
        </div>

        <div className={`transition-transform duration-1000 transform ${customerOptions.firstName ? 'translate-x-0' : 'translate-x-full'}`}>
          {customerOptions.firstName && (
            <button
              className="btn-gray"
              onClick={() => setOpenCustomerDetailsModal(true)}
              title={`See Details of ${customerOptions.firstName} ${customerOptions.lastName}`}
            >
              {customerOptions.firstName} {customerOptions.lastName}
            </button>
          )}
        </div>
      </div>

      {customerOptions?.billingAddress?.length > 0 && customerOptions?.shippingAddress?.length > 0 && <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={sameAddress}
          onChange={() => setSameAddress(!sameAddress)}
          className="mr-2"
        />
        <label className="font-semibold">Shipping address same as billing address</label>
      </div>}



      <div className="input-container">
        <label htmlFor="invoiceNumber" className="form-label2">Invoice: </label>
        <input
          type="text"
          id="invoiceNumber"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="text-input2"
        />
      </div>

      <div className="input-container pt-4">
        <label htmlFor="invoiceDate" className="form-label2">Invoice Date: </label>
        <DatePicker
          id="invoiceDate"
          selected={invoiceDate}
          onChange={(date) => setInvoiceDate(date)}
          dateFormat="do MMM yyyy"
          className="text-input2 focus:outline-none outline-none border-none"
        />
      </div>

      <h2 className="text-center text-lg font-semibold">Items Table</h2>
      <div id="invoice-table-part" className="md:w-[90%] mx-auto item-table min-h-[100px] mb-10 mt-4">
        {<table className="table-auto">
          <thead>
            <tr>
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

                <td className="w-[400px] ">
                  <>
                    <div className="relative">
                      <span
                        className="cursor-move absolute top-0 -left-8 w-[24px] block text-gray-400 "
                        draggable
                        onDragStart={() => handleDragStart(index)}
                      >
                        <DragSVG />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{item.name}</span>
                      <button
                        className=" w-[40px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItems((prev) => prev.filter((i) => i._id !== item?._id));
                        }}
                      >
                        <CrossSVG />
                      </button>
                    </div>
                  </>

                </td>
                <td className="w-[150px]">
                  <input
                    type="number"
                    className="rounded bg-inherit focus:outline-blue-600 focus:outline-offset-4 font-semibold w-[100px] px-1"
                    value={item.quantity}
                    min={1}
                    minLength={0.1}
                    onChange={(e) =>
                      setItems((prevItems) =>
                        prevItems.map((it, i) =>
                          i === index ? { ...it, quantity: parseFloat(e.target.value) || 0 } : it
                        )
                      )
                    }
                  />
                </td>

                <td className="w-[150px]">

                  <input
                    type="text"
                    className="rounded bg-inherit focus:outline-blue-600 focus:outline-offset-4 font-semibold w-[100px] px-1"
                    value={item.unit}
                    onChange={(e) =>
                      setItems((prevItems) =>
                        prevItems.map((it, i) =>
                          i === index ? { ...it, unit: e.target.value || "" } : it
                        )
                      )
                    }
                  />
                </td>
                <td className="w-[150px]">
                  <input
                    type="number"
                    className="rounded bg-inherit focus:outline-blue-600 focus:outline-offset-4 font-semibold w-[100px] px-1"
                    onChange={(e) => setItems(prev => prev.map((it, i) => i === index ? { ...it, sellingPrice: parseFloat(e.target.value) || 0 } : it))}

                    value={item.sellingPrice}
                  />

                </td>
                <td className="w-[150px]">
                  <input
                    type="number"
                    className="rounded bg-inherit focus:outline-blue-600 focus:outline-offset-4 font-semibold w-[100px] px-1"
                    onChange={(e) => setItems(prev => prev.map((it, i) => i === index ? { ...it, tax: parseFloat(e.target.value) || 0 } : it))}

                    value={item.tax}
                  />


                </td>
                <td className="w-[150px]">{(item.quantity * item.sellingPrice) + item.tax}</td>
              </tr>
            ))}
            <tr className="w-[400px]">

              <Select
                className="w-[400px]  select-react"
                id="item"
                options={[
                  { label: "Add New Item", value: "add-new-item" },
                  ...savedItems?.map((item) => ({
                    label: item.name,
                    value: item._id,
                  })),

                ]}
                value={selectedItemOnchangeHolder}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (provided, state) => ({
                    ...provided,
                    padding: '10px',
                    minHeight: '50px',
                    backgroundColor: '#fefefe',
                    border: 'none',
                    width: "100%",
                    borderRadius: '0px',
                    zIndex: 40,
                  }),
                  indicatorsContainer: (provided) => ({
                    display: 'none',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    padding: '10px',
                  }),
                  input: (provided) => ({
                    ...provided,
                    padding: '10px',
                  }),
                }}
                placeholder={loading ? "Loading Items..." : "Select or Search Item"}
                onChange={handleItemChange}
              />

            </tr>
          </tbody>
        </table>}
      </div>

      <div className="md:w-[90%] relative min-h-[480px] mb-4">
        <div className="absolute md:right-0">
          <div className="border rounded py-6 px-4 shadow-lg bg-gray-100 md:w-[600px]">
            <p className="flex justify-between mb-3"><span className="font-semibold">Subtotal</span> <span className="w-[200px] font-semibold pl-[8px] py-[4px]">{subtotal}</span> </p>
            <div className="mb-4 input-container flex-wrap flex justify-between">
              <label htmlFor="shippingCharge" className="form-label">Shipping Charge</label>
              <input
                type="number"
                min={0}
                id="shippingCharge"
                value={shippingCharge}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
          
                    setShippingCharge(value);
                  }
                }}
                className="text-input3"
              />
            </div>
            <div className="mb-4 input-container flex justify-between">
              <label htmlFor="discount" className="form-label">Discount</label>
              <input
                type="number"
                min={0}
                id="discount"
                value={discount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setDiscount(value);
                  }
                }}
                className="text-input3"
              />
            </div>
            <div className="mb-4 input-container flex justify-between">
              <label htmlFor="paymentMethod" className="form-label">Payment Method</label>
              <Select
                id="paymentMethod"
                options={paymentOptions}
                selected={paymentMethod}
                placeholder="Select"
                onChange={(option) => setPaymentMethod(option.value)}
                className="min-w-[200px] select-react"
              />
            </div>

            <div className="mb-4 input-container flex-wrap flex justify-between">
              <label htmlFor="paidAmount" className="form-label">Paid Amount</label>
              <input
                type="number"
                id="paidAmount"
                value={paidAmount}
                onChange={(e) => {
                  if (parseInt(e.target.value) > total) return;
                  const paid = parseFloat(e.target.value) || 0;
                  setPaidAmount(paid);
                  const newDue = subtotal - paid;
                  setDueAmount(newDue > 0 ? newDue : 0);
                }}
                className="text-input3"
              />
            </div>

            {paymentMethod !== "not-paid" && paymentMethod !== "cash-on-delivery" && paymentMethod !== "cash" && paymentMethod && (
              <div className="mb-4 input-container flex-wrap flex justify-between">
                <label htmlFor="trxId" className="form-label">Trx Id</label>
                <input
                  type="text"
                  id="trxId"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="text-input3"
                />
              </div>
            )}

            {(paymentMethod === "bkash" || paymentMethod === "nagad" || paymentMethod === "rocket") && (
              <div className="mb-4 input-container flex-wrap flex justify-between">
                <label htmlFor="trxNumber" className="form-label">{getPaymentLabel(paymentMethod)} Number</label>
                <input
                  type="text"
                  id="trxNumber"
                  value={paymentFromNumber}
                  onChange={(e) => setPaymentFromNumber(e.target.value)}
                  className="text-input3"
                />
              </div>
            )}
            <hr className="border-t border-gray-400 my-4" />
            <div className="flex justify-between flex-wrap">
              <h3 className="font-bold text-xl">Total ({currency})</h3>
              <p className="w-[200px] font-bold text-xl px-[8px]">{total}</p>
            </div>





          </div>
        </div>
      </div>
      <div className="mb-4 input-container md:w-[90%] mx-auto">
        <label htmlFor="note" className="form-label">Note</label>
        <textarea
          id="note"
          placeholder="Any notes about this order will appear in the footer of the invoice."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="form-textarea"
        />
      </div>
      <div className="flex space-x-4 mb-10 justify-center items-center text-white">
        <button
          className="bg-blue-500 p-2 rounded"
          onClick={() => handleSave(false)}
        >
          {updateable ? "Update" : "Save"}
        </button>
        <button className="bg-blue-500 p-2 rounded" onClick={() => handleSave(true)}>{updateable ? "Update" : "Save"} & Print PDF</button>
      </div>

      {/* Modals */}
      <NewCustomerModal
        openModal={openCustomerModal}
        setOpenModal={setOpenCustomerModal}
        onSaveCustomer={setCustomerOptions}
      />
      <CustomerModal
        setOpenModal={setOpenCustomerDetailsModal}
        openModal={openCustomerDetailsModal}
        customer={customerOptions}
      />
      <NewItemModal
        openModal={openItemModal}
        setOpenModal={setOpenItemModal}
        onAddItem={(item) => handleAddItemFromModal(item)}
      />
      <PrintInvoiceModal
        customerInfo={customerOptions}
        paidAmount={paidAmount}
        total={total}
        shippingCharge={shippingCharge}
        items={items}
        note={note}
        subtotal={subtotal}
        discount={discount}
        totalTax={totalTax}
        orgInfo={activeOrganization}
        openModal={openPrintInvoiceModal}
        setOpenModal={setOpenPrintInvoiceModal}
        currency={currency}
        invoiceDate={invoiceDate}
        resetStates={resetStates}
        invoiceNumber={invoiceNumber}
      />
    </div>
  );
};

export default NewInvoice;
