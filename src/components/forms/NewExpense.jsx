'use client'
import React, { useContext } from "react";
import { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import NewCustomerModal from "../modal/NewCustomerModal";
import getCustomers from "@/utils/getCustomers.mjs";
import NewExpenseCategoryModal from "../modal/NewExpenseCategoryModal";
import toast from "react-hot-toast";
import calculateTax from "@/utils/calculateTax.mjs";
import AuthContext from "@/contexts/AuthContext.mjs";


const NewExpense = ({ activeOrg, id, uniqueIds }) => {
  const [loading, setLoading] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [customers, setCustomers] = useState([]);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [taxes, setTaxes] = useState([]);
  const [totalTax, setTotalTax] = useState(0);
  const [selectedTaxes, setSelectedTaxes] = useState([]);
  const [taxValues, setTaxValues] = useState({ percentage: '', amount: '' });
  const [customer, setCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [showItemized, setShowItemized] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [itemizedExpenses, setItemizedExpenses] = useState([{
    "category": "",
    "amount": "",
    "note": "",
    "tax": ""
  }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openNewCategoryModal, setOpenNewCategoryModal] = useState(false)
  const [savedCustomers, setSavedCustomers] = useState([]);
  const router = useRouter();


  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(null);

  const handleCustomerChange = (option) => {
    if (option.value === "add-new-customer") {
      setOpenCustomerModal(true);
    } else {
      setSelectedCustomer(option);
    }
  };

  useEffect(() => {
    (async () => {
      setLoadingCustomer(true)
      const c = await getCustomers(1, 10000, "newest", "", true, activeOrg)
      setSavedCustomers(c);
      setLoadingCustomer(false)
    })()
  }, [])

  const handleTaxChange = (selectedOptions) => {
    setSelectedTaxes(selectedOptions);
    const updatedValues = { ...taxValues };
    selectedOptions.forEach((tax) => {
      if (!updatedValues[tax.value]) {
        updatedValues[tax.value] = '';
      }
    });
    setTaxValues(updatedValues);
  };
  const [taxOptions, setTaxOptions] = useState([
    { value: 'percentage', label: 'Percentage' },
    { value: 'amount', label: 'Amount' },
  ]);

  useEffect(() => {
    if (amount > 0) {
      const c = calculateTax(amount, taxValues.percentage || 0, taxValues.amount || 0)
      setTotalTax(c)
    }
  }, [amount, taxValues])

  const handleSave = async (reset = false) => {
    if (!selectedCustomer) return toast.error("Select Customer");

    const nonItemizedFormData = {
      date: expenseDate,
      itemized: showItemized,
      category,
      amount: parseFloat(amount),
      customerId: selectedCustomer?.value,
      currency,
      note,
      tax: totalTax || 0,
      reference,
      total: parseFloat(amount) + parseFloat(totalTax),
      ownerUsername: currentUser?.username,
      orgId: activeOrg,
    };

    const newItemizedExpense = itemizedExpenses.map(i => ({ ...i, amount: parseFloat(i.amount) || 0, tax: parseFloat(i.tax) || 0 }))
    const totalExpense = newItemizedExpense.reduce((accumulator, currentValue) => parseFloat(accumulator) + parseFloat(currentValue.amount) + parseFloat(currentValue.tax), 0);

    const itemizedFormData = {
      date: expenseDate,
      itemized: showItemized,
      reference,
      total: totalExpense,
      itemizedExpenses: newItemizedExpense,
      customerId: selectedCustomer?.value,
      ownerUsername: currentUser?.username,
      orgId: activeOrg,
    };

    // Updated checkEmptyFields function
    const checkEmptyFields = (formData) => {
      // Check for fields in non-itemized data
      for (const key in formData) {
        if (
          key !== "reference" &&
          key !== "note" &&
          (formData[key] === "" || formData[key] === null || formData[key] === undefined)
        ) {
          return key;
        }
      }

      // If itemized expenses are present, check each item in the array for missing categories
      if (formData.itemizedExpenses && formData.itemizedExpenses.length > 0) {
        for (let i = 0; i < formData.itemizedExpenses.length; i++) {
          const item = formData.itemizedExpenses[i];
          if (!item.category || item.category === "" || item.category === null) {
            return `Category for item ${i + 1}`; // Show which item is missing category
          }
          if (!item.amount || item.amount === "" || item.amount === null) {
            return `Amount for item ${i + 1}`; // Show which item is missing category
          }
        }
      }

      return null;
    };

    const formData = showItemized ? itemizedFormData : nonItemizedFormData;

    const emptyField = checkEmptyFields(formData);

    if (emptyField) {
      return toast.error(`${emptyField} is required`);
    }

    const res = await fetch("/api/adds/expense", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();

    if (data?.status === 200 || data?.status === 201) {
      if (reset) {
        resetForm();
      }
      toast.success(data?.message);
    }
    else {
      toast.error(data?.message)
    }
  };

  const handleItemizedChange = (index, field, value) => {
    const updatedItemized = [...itemizedExpenses];
    updatedItemized[index][field] = value;
    setItemizedExpenses(updatedItemized);
  };


  const fetchCategories = async () => {
    const res = await fetch("/api/gets/expense-categories");
    const data = await res.json()

    if (data.status === 200) {
      setAvailableCategories(data.data);
    } else {
      setAvailableCategories([])
    }
  };
  useEffect(() => {
    fetchCategories()
  }, [])
  const handleAddItemizedRow = () => {
    setItemizedExpenses((prev) => [
      ...prev,
      { category: "", amount: "", note: "", tax: "" },
    ]);
  };
  const handleRemoveItemizedRow = (index) => {
    setItemizedExpenses((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };



  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
  };

  const resetForm = () => {
    setCategory(null);
    setExpenseDate(new Date());
    setAmount("");
    setCurrency("USD");
    setReference("");
    setNote("");
    setTaxes([]);
    setSelectedTaxes([]);
    setTaxValues({});
    setCustomer(null);
    setShowItemized(false);
    setItemizedExpenses([]);
  };

  const handleItemizedCheckboxChange = () => {
    setShowItemized(!showItemized);
    if (showItemized) {
      setOpenNewCategoryModal(false);
      setCurrentCategoryIndex(null);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl mb-6">New Expense</h1>
      <div className="mt-20 pb-10 border-t-2 pt-10 border-gray-500 input-container ">
        <label htmlFor="customer" className="form-label2">Select Customer</label>
        <Select
          className="md:w-[420px] select-react z-20"
          instanceId={uniqueIds[3]}
          id={uniqueIds[3]}
          theme={{ borderRadius: '10px' }}
          options={[
            { label: "Add New Customer", value: "add-new-customer" },
            ...savedCustomers?.map((c) => ({
              label: `${c.firstName} ${c.lastName}`,
              value: c._id,
            })),
          ]}
          value={selectedCustomer || { value: "", label: loadingCustomer ? "Loading Customers..." : "Select or search" }}
          placeholder={loadingCustomer ? "Loading Customers..." : "Select or Add Customer"}
          onChange={handleCustomerChange}
        />
      </div>
      <div className="input-container pt-4">
        <label htmlFor="expenseDate" className="form-label">Date: </label>
        <DatePicker
          id="expenseDate"
          selected={expenseDate}
          onChange={(date) => setExpenseDate(date)}
          dateFormat="do MMM yyyy"
          className="text-input2 focus:outline-none outline-none border-none"
        />
      </div>


      <div onClick={() => setShowItemized(!showItemized)} className="input-container w-fit my-3">
        <label className="form-label">Itemized:</label>
        <input
          type="checkbox"
          checked={showItemized}
          onChange={handleItemizedCheckboxChange}
        />
      </div>
      {!showItemized && <>


        <div className='input-container my-3'>
          <label className="form-label">Category:</label>
          <Select
            value={{ value: category || "", label: category || "" }}
            className='w-[320px] select-react'
            placeholder={availableCategories.length > 0 ? "Select Category" : "No category available"}
            options={[{ value: "add-new-category", label: "Add New" }, ...availableCategories.map(cat => ({ value: cat, label: cat }))]}
            instanceId={uniqueIds[0]}
            id={uniqueIds[0]}
            // ...availableCategories?.map((cat) => ({ value: cat, label: cat }))
            onChange={(selectedOption) => {
              if (selectedOption.value === "add-new-category") {
                return setOpenNewCategoryModal(true);
              }
              setCategory(selectedOption.value)
            }}
          />
          <NewExpenseCategoryModal
            openModal={openNewCategoryModal}
            setCategory={setCategory}
            category={category}
            setOpenModal={setOpenNewCategoryModal}
          />
        </div>


        <div className='input-container'>
          <label className="form-label">Amount:</label>
          <div className="flex">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className=" rounded select-react px-2 py-1 border border-gray-300 "
            >
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-black focus:outline-2 focus:outline-blue-500 w-[249px]"
            />
          </div>
        </div>



        <div className="mb-4 input-container my-3">
          <label className="form-label">Note:</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className=" resize min-w-[320px] p-2 focus:outline-none rounded text-black;"
            placeholder="Add a note"
          />
        </div>

        <div >
          <div className='input-container'>
            <label className="form-label">Tax:</label>
            <Select
              isMulti
              options={taxOptions}
              instanceId={uniqueIds[1]}
              id={uniqueIds[1]}
              onChange={handleTaxChange}
              className="min-w-[320px] w-fit mb-2 select-react"
            />
          </div>
          {selectedTaxes.map((tax) => (
            <div key={tax.value} className='input-container space-y-2'>
              <label className="form-label">
                {tax.label}:
              </label>
              <input
                type="number"
                value={taxValues[tax.value] || ''}
                onChange={(e) => setTaxValues({ ...taxValues, [tax.value]: e.target.value })}
                className="text-input"
                placeholder={`Enter ${tax.label} value`}
              />
            </div>
          ))}
          {totalTax > 0 && <p className="input-container"><span className="form-label font-semibold">Total Tax:</span> {totalTax}</p>}
        </div>

      </>}

      {/* itemized */}
      {showItemized && (
        <div>
          <table className="item-table2">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Note</th>
                <th>Tax</th>
              </tr>
            </thead>
            <tbody>
              {itemizedExpenses.map((item, index) => (
                <React.Fragment key={index}>
                  <tr className="my-1" >
                    <td>
                      <Select
                        instanceId={uniqueIds[2]}
                        id={uniqueIds[2]}
                        value={{ value: item.category || "", label: item.category || "" }}
                        onChange={(selectedOption) => {
                          if (selectedOption.value === "add-new-category") {
                            setCurrentCategoryIndex(index)
                            return setOpenNewCategoryModal(true);

                          }
                          handleItemizedChange(index, 'category', selectedOption?.value || '')
                        }}
                        options={[{ value: "add-new-category", label: "Add New" }, ...availableCategories.map(cat => ({ value: cat, label: cat })),]}
                        className="select-react w-[200px]"
                        placeholder="Select Category"
                      />
                      <NewExpenseCategoryModal
                        openModal={index >= 0 && currentCategoryIndex === index && showItemized}
                        setCategory={(newCategory) => handleItemizedChange(index, 'category', newCategory)}
                        category={itemizedExpenses[index].category}
                        setOpenModal={() => setCurrentCategoryIndex(null)}
                      />
                    </td>
                    <td className="">
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          handleItemizedChange(index, 'amount', e.target.value)
                        }
                        className="text-input"
                        placeholder="Amount"
                      />
                    </td>
                    <td className="">

                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) =>
                          handleItemizedChange(index, 'note', e.target.value)
                        }
                        className="text-input"
                        placeholder="Note"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.tax}
                        onChange={(e) =>
                          handleItemizedChange(index, 'tax', e.target.value)
                        }
                        className="text-input"
                        placeholder="Tax"
                      />
                      <span className="text-red-500 absolute text-lg cursor-pointer" onClick={() => handleRemoveItemizedRow(index)}>&#10008;</span>
                    </td>

                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={handleAddItemizedRow}
            className="btn btn-secondary mt-3"
          >
            Add Another Row
          </button>
        </div>
      )}
      {/* itemized */}


      <div className="mb-4 input-container my-2">
        <label className="form-label">Reference:</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="px-2 py-1 w-[320px] border border-gray-300 rounded text-black focus:outline-2 focus:outline-blue-500"
          placeholder="Reference #"
        />
      </div>
      <div className="flex items-center justify-center gap-10">
        <button
          type="button"
          onClick={()=>handleSave(false)}
          className="btn btn-ghost bg-green-500 text-white hover:bg-green-600 rounded-lg shadow-md transition ease-in-out duration-200"
        >
          Save
        </button>
        <button
          type="button"
          onClick={()=>handleSave(true)}
          className="btn btn-ghost bg-yellow-500 text-slate-800 hover:bg-yellow-600 rounded-lg shadow-md transition ease-in-out duration-200"
        >
          Save & New
        </button>
      </div>







      <NewCustomerModal
        openModal={openCustomerModal}
        setOpenModal={setOpenCustomerModal}
        onSaveCustomer={setCustomerDetails}
      />
    </div>
  );
};

export default NewExpense;
