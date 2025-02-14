/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useState, useEffect, useContext, useMemo } from "react";
import Select from "react-select";
import DatePicker from 'react-date-picker';
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

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';


const NewInvoice = ({ activeOrg, id }) => {
  const [openCustomerDetailsModal, setOpenCustomerDetailsModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("")
  const [shippingCharge, setShippingCharge] = useState(0)
  const [currency, setCurrency] = useState("BDT")
  const [adjustmentDescription, setAdjustmentDescription] = useState("bKash")
  const [adjustmentAmount, setAdjustmentAmount] = useState(10)
  const [loading, setLoading] = useState(false);
  const [selectedItemOnchangeHolder, setSelectedItemOnchangeHolder] = useState(null);
  const [updateable, setUpdateable] = useState(false);
  const [customerDetails, setCustomerDetails] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState([]);
  const [openItemModal, setOpenItemModal] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [savedItems, setSavedItems] = useState([]);

  const memoizedSavedCustomers = useMemo(() => savedCustomers, [savedCustomers]);
  const memoizedSavedItems = useMemo(() => savedItems, [savedItems]);


  const [draggingIndex, setDraggingIndex] = useState(null);
  const [totalTax, setTotalTax] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [total, setTotal] = useState(0)
  const [paidAmount, setPaidAmount] = useState(total);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [trxId, setTrxId] = useState('');
  const [paymentFromNumber, setPaymentFromNumber] = useState("");
  const [openPrintInvoiceModal, setOpenPrintInvoiceModal] = useState(false)
  const [sameAddress, setSameAddress] = useState(true)
  const { activeOrganization, currentUser } = useContext(AuthContext);
  const [isPaidChecked, setIsPaidChecked] = useState(true);
  const [dynamicOptions, setDynamicOptions] = useState([]);
  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };

  // Handle drag over
  const handleDragOver = (index) => {
    if (index !== draggingIndex) {
      const reorderedItems = [...selectedItems];
      const draggedItem = reorderedItems[draggingIndex];
      reorderedItems.splice(draggingIndex, 1);
      reorderedItems.splice(index, 0, draggedItem);
      setSelectedItems(reorderedItems);
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
          setCustomerDetails(c);

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
          setSelectedItems(itemsWithDetails);
          setCurrency(data?.currency || "BDT");
          setNote(data.note);
          setOrderNumber(data?.orderNumber || "")
          setSubtotal(data?.subtotal)
          setTotal(data?.total)
          setShippingCharge(data?.shippingCharge);
          setPaidAmount(data?.paidAmount);
          setDueAmount(data?.dueAmount);
          setDiscount(data?.discount)
          setPaymentFromNumber(data?.paymentFromNumber);
          setPaymentMethod(data?.paymentMethod);
          setInvoiceDate(new Date(data?.invoiceDate));
          setInvoiceNumber(data?.invoiceNumber);
          setTotalTax(data?.totalTax);
          setTrxId(data?.trxId);
          setAdjustmentAmount(data?.adjustmentAmount || null)
          setAdjustmentDescription(data?.adjustmentDescription || '')
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
      setDynamicOptions([
        { label: "Add New Item", value: "add-new-item" },
        ...i?.map((item) => ({
          label: item.name,
          value: item._id,
        })),
      ])
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
        const matchedItem = selectedItems.find(i => i._id === item._id);
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

        setCustomerDetails(c);
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

  const handleAddItemFromModal = (item) => {
    setSelectedItems((prevItems) => [
      ...prevItems,
      { ...item, quantity: 1 },
    ]);
  }
  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
    const tax = selectedItems.reduce((sum, item) => sum + item.tax, 0);
    setSubtotal(total + totalTax || 0);
    setTotal(total + totalTax + (adjustmentAmount || 0) + shippingCharge - discount || 0);
    if (isPaidChecked) {
      setPaidAmount(total + totalTax + shippingCharge + adjustmentAmount - discount || 0)
    }
    setTotalTax(tax)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems, totalTax]);

  useEffect(() => {
    setTotal(subtotal + shippingCharge - discount + (adjustmentAmount || 0))
    if (isPaidChecked) {
      setPaidAmount(subtotal + shippingCharge - discount + (adjustmentAmount || 0))
    }
  }, [shippingCharge, discount])
  useEffect(() => {
    if (paidAmount === total) {
      setDueAmount(0)
    } else if (paidAmount === 0) {
      setDueAmount(total)
    }
    else {
      setDueAmount(total - paidAmount)
    }
  }, [paidAmount, selectedItems, total])

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

  const customFilter = (option, inputValue) => {
    if (!inputValue) return true;
    return option.label.toLowerCase().startsWith(inputValue.toLowerCase());
  };
  const resetStates = () => {
    setSelectedCustomer(null);
    setInvoiceNumber(generateInvoiceNumber());
    setInvoiceDate(new Date());
    setSelectedItems([]);
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
    setSelectedCustomer(null)
    setCustomerDetails([]);
  };

  const handleSave = async (createPdf = false) => {
    if (!customerDetails._id) return toast.error("No Customer Found.")
    try {
      let selectedItemsUpdated = selectedItems;
      const newItems = selectedItems
        .filter((item) => item.isNew)
        .map((item) => ({
          type: "goods",
          name: item.name,
          unit: item.unit,
          category: item.name,
          sellingPrice: `BDT ${item?.sellingPrice}`,
          description: "",
          taxes: [],
          status: "Active",
          ownerUsername: currentUser?.username,
          orgId: activeOrg,
          source: "invoice",
          tax: item.tax,
          quantity: item.quantity,
        }));
      if (newItems.length > 0) {
        const res = await fetch('/api/adds/items-from-invoice', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: newItems }),
        });

        const data = await res.json();
        if (data?.status !== 200 && data.status !== 201) {
          toast.error(data.message || "Failed to save new items.");
          return;
        }
        // setSavedItems(prev=> ...prev, ...da)
        const savedItemsWithIds = data.savedItems;
        setSavedItems(prev => [...prev, ...data.savedItems]);

        selectedItemsUpdated = selectedItems.map((item) => {
          if (item.isNew) {
            const savedItem = savedItemsWithIds.find(
              (saved) => saved.name === item.name
            );
            return {
              ...item,
              _id: savedItem._id,
              isNew: false,
            };
          }
          return item;
        });
      }


      const invoiceData = {
        invoiceNumber,
        invoiceDate,
        orderNumber,
        customerId: customerDetails._id,
        items: selectedItemsUpdated.map(item => ({
          itemId: item?._id,
          name: item?.name,
          quantity: item?.quantity,
          unit: item?.unit,
          sellingPrice: typeof (item.sellingPrice) === "number" ? item.sellingPrice : parseInt(i?.sellingPrice?.split(" ")[1]),
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
        adjustmentDescription,
        adjustmentAmount: adjustmentAmount === undefined ? 0 : adjustmentAmount,
        ownerUsername: currentUser?.username,
        orgId: activeOrg,
      };
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


  const handleItemChange = (option) => {
    if (option.isNew) {
      const newItem = { name: option.label.split("Add")[1].trim(), _id: option.value, isNew: true };

      const isPreviouslyAdded = selectedItems.find(i => i._id === option.value)
      if (isPreviouslyAdded) {
        return setSelectedItems((prev) => selectedItems.map((item, index) => item._id === option.value ? { ...item, quantity: item.quantity + 1 } : item))
      }

      setSelectedItems((prevItems) => [
        ...prevItems,
        {

          ...newItem,
          unit: "kg",
          tax: 0,
          quantity: 1,
          sellingPrice: 0,



        },
      ]);
      setDynamicOptions([
        { label: "Add New Item", value: "add-new-item" },
        ...memoizedSavedItems.map((item) => ({
          label: item.name,
          value: item._id,
        })),
      ]);

      setSelectedItemOnchangeHolder(newItem);
      setTimeout(() => {
        setSelectedItemOnchangeHolder(null);
      }, 300);
    } else if (option.value === "add-new-item") {
      setOpenItemModal(true);
    } else {
      setSelectedItemOnchangeHolder(option)
      const isPreviouslyAdded = selectedItems.find(i => i._id === option.value)
      if (isPreviouslyAdded) {
        setSelectedItems((prev) => selectedItems.map((item, index) => item._id === option.value ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        const selectedItem = savedItems.find((item) => item._id === option.value);
        const { taxes, ...itemsWithoutTaxes } = selectedItem;
        setSelectedItems((prevItems) => {
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


  const handleInputChange = (value) => {

    const isExistingOption = dynamicOptions.some(
      (option) => option.label.toLowerCase() === value.toLowerCase()
    );

    if (value && !isExistingOption) {
      setDynamicOptions(prev => [...prev, { label: `Add ${value}`, value, isNew: true }]);
    } else {
      setDynamicOptions([
        { label: "Add New Item", value: "add-new-item" },
        ...savedItems.map((item) => ({
          label: item.name,
          value: item._id,
        })),
      ]);
    }
  };

  return (
    <div className="invoice-form p-2 mt-10">
      {loading && <Loading loading={loading} />}
      <div className="mb-4 input-container ">
        <label htmlFor="customer" className="form-label2">Select Customer</label>
        <Select
          className="md:w-[420px] w-[] select-react "
          id="customer"
          theme={{ borderRadius: '10px' }}
          options={[
            { label: "Add New Customer", value: "add-new-customer" },
            ...memoizedSavedCustomers?.map((c) => ({
              label: `${c.firstName} ${c.lastName}`,
              value: c._id,
            })),
          ]}
          value={selectedCustomer}
          placeholder={loading ? "Loading Customers..." : "Select or Add Customer"}
          onChange={handleCustomerChange}
        />
      </div>

      <div className="flex flex-wrap justify-between my-4 md:mx-10 mx-2">
        <div className={`space-y-1 transition-transform duration-1000 transform ${customerDetails.firstName ? 'translate-x-0' : '-translate-x-full'}`}>
          <p className="text-xl font-bold">{customerDetails.firstName} {customerDetails.lastName}</p>
          {customerDetails?.billingAddress && <h2 className="text-base font-semibold">Billing Address</h2>}
          {customerDetails.firstName && <p className="text-sm"><span className="font-semibold"></span> {customerDetails.billingAddress || getFullBillingAddress(customerDetails) || ""}</p>}
          {customerDetails?.shippingAddress && !sameAddress && <h2 className="text-base font-semibold">Shipping Address</h2>}
          {customerDetails.firstName && !sameAddress && <p className="text-sm"><span className="font-semibold"></span> {customerDetails.shippingAddress || getFullShippingAddress(customerDetails)}</p>}

          {customerDetails?.phone?.length > 0 && <p className="text-sm"><span className="font-semibold">Phone:</span> {customerDetails.phone}</p>}
          {customerDetails.companyName && <p className="text-sm"><span className="font-semibold">Company:</span> {customerDetails.companyName}</p>}
        </div>

        <div className={`transition-transform duration-1000 transform ${customerDetails.firstName ? 'translate-x-0' : 'translate-x-full'}`}>
          {customerDetails.firstName && (
            <button
              className="btn-gray"
              onClick={() => setOpenCustomerDetailsModal(true)}
              title={`See Details of ${customerDetails.firstName} ${customerDetails.lastName}`}
            >
              {customerDetails.firstName} {customerDetails.lastName}
            </button>
          )}
        </div>
      </div>

      {customerDetails?.billingAddress?.length > 0 && customerDetails?.shippingAddress?.length > 0 && <div className="flex items-center mb-4">
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
      `   <div className="input-container">
        <label htmlFor="orderNumber" className="form-label2">Order Number: </label>
        <input
          type="text"
          id="orderNumber"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="text-input2"
        />
      </div>`

      <div className="input-container mb-10">
        <label htmlFor="invoiceDate" className="form-label2">Invoice Date: </label>

        <div className="text-[14px]">
          <DatePicker
            id="invoiceDate"
            onChange={(date) => setInvoiceDate(date)}
            value={invoiceDate}
            // className="react-date-picker "
            className="border-none outline-none"
            clearIcon={null}
          />
        </div>
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
            {selectedItems?.map((item, index) => (
              <tr key={index}
                className={draggingIndex === index ? "bg-gray-400" : ""}
              >
                <td className="w-[400px] ">
                  <>
                    <div className="relative"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={() => handleDragOver(index)}
                      onDragEnd={handleDragEnd}
                    >
                      <span
                        className="cursor-move absolute -left-[5%] w-[24px] block text-gray-800 "
                      >
                        <DragSVG
                        />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="pl-2">{item.name}</span>
                      <button
                        className=" w-[40px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItems((prev) => prev.filter((i) => i._id !== item?._id));
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
                      setSelectedItems((prevItems) =>
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
                    className="rounded bg-inherit focus:outline-blue-600 focus:outline-offset-4 font-semibold min-w-[100px] px-1"
                    value={item.unit}
                    onChange={(e) =>
                      setSelectedItems((prevItems) =>
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
                    className="rounded bg-inherit focus:outline-blue-600 focus:outline-offset-4 font-semibold min-w-[100px] px-1"
                    onChange={(e) => setSelectedItems(prev => prev.map((it, i) => i === index ? { ...it, sellingPrice: parseFloat(e.target.value) || 0 } : it))}

                    value={item.sellingPrice}
                  />

                </td>
                <td className="w-[150px]">
                  <input
                    type="number"
                    className="rounded bg-inherit focus:outline-blue-600 focus:outline-offset-4 font-semibold min-w-[100px] px-1"
                    onChange={(e) => setSelectedItems(prev => prev.map((it, i) => i === index ? { ...it, tax: parseFloat(e.target.value) || 0 } : it))}

                    value={item.tax}
                  />


                </td>
                <td className="min-w-[150px]">{(item.quantity * item.sellingPrice) + item.tax}</td>
              </tr>
            ))}
            <tr className="md:w-[400px] w-[200px]">
              <td className="no-padding">
                <Select
                  className="md:w-[400px] w-[200px]"
                  id="item"
                  options={dynamicOptions}
                  value={selectedItemOnchangeHolder}
                  menuPortalTarget={document.body}
                  filterOption={customFilter}
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 5,
                      position: 'absolute',
                    }),
                    control: (provided, state) => ({
                      ...provided,
                      padding: '10px',
                      minHeight: '50px',
                      backgroundColor: '#fefefe',
                      border: 'none',
                      width: "100%",
                      borderRadius: '0px',
                      zIndex: 5,
                    }),
                    option: (provided) => ({
                      ...provided, color: "black"
                    })
                    ,
                    indicatorsContainer: (provided) => ({
                      display: 'none',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      padding: '10px',
                    }),
                    input: (provided) => ({
                      ...provided,
                      paddingTop: "10px",
                      paddingBottom: "10px"
                    }),
                  }}
                  placeholder={loading ? "Loading Items..." : "Select or Search Item"}
                  onChange={handleItemChange}
                  onInputChange={handleInputChange}
                />
              </td>
            </tr>
          </tbody>
        </table>}
      </div>

      <div className="md:w-[90%] relative min-h-[480px] mb-4 text-black">
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
            <div className="mb-4 input-container flex-wrap flex justify-between">
              <input
                type="text"
                id="adjustmentDescription"
                value={adjustmentDescription}
                placeholder="Any Adjustment"
                onChange={(e) => setAdjustmentDescription(e.target.value)}
                className="text-input3"
              />
              <input
                type="number"
                id="adjustmentAmount"
                placeholder="Adjustment Amount"
                value={adjustmentAmount}
                onChange={(e) => {
                  const value = parseFloat(e?.target?.value || 0);
                  setAdjustmentAmount(value);

                  setTotal(prevTotal => {
                    if (adjustmentAmount > 0) {
                      return prevTotal + value - adjustmentAmount;
                    } else {
                      return prevTotal + value;
                    }
                  });

                  setPaidAmount(prevPaid => {
                    if (adjustmentAmount > 0) {
                      return prevPaid + value - adjustmentAmount;
                    } else {
                      return prevPaid + value;
                    }
                  });

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
                value={paymentOptions.find(o => o.value === paymentMethod)}
                placeholder="Select"
                onChange={(option) => setPaymentMethod(option.value)}
                className="min-w-[200px] select-react"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="paidCheck"
                checked={isPaidChecked}
                onChange={(e) => setIsPaidChecked(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="paidCheck" className="form-label">Paid</label>
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
        onSaveCustomer={setCustomerDetails}
      />
      <CustomerModal
        setOpenModal={setOpenCustomerDetailsModal}
        openModal={openCustomerDetailsModal}
        customer={customerDetails}
      />
      <NewItemModal
        openModal={openItemModal}
        setOpenModal={setOpenItemModal}
        onAddItem={(item) => handleAddItemFromModal(item)}
      />
      <PrintInvoiceModal
        customerInfo={customerDetails}
        paidAmount={paidAmount}
        total={total}
        shippingCharge={shippingCharge}
        items={selectedItems}
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