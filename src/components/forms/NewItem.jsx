'use client'
import getItem from '@/utils/getItem.mjs';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Select from 'react-select';

const NewItem = ({ id, setOpenModal=undefined, onAddItem=undefined }) => {
  const [loading, setLoading] = useState(false);
  const [updateable, setUpdateable] = useState(false)
  const [type, setType] = useState('goods');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [description, setDescription] = useState('');
  const [taxOptions, setTaxOptions] = useState([
    { value: 'percentage', label: 'Percentage' },
    { value: 'amount', label: 'Amount' },
  ]);
  const [selectedTaxes, setSelectedTaxes] = useState([]);
  const [taxValues, setTaxValues] = useState({ percentage: '', amount: '' });

  const units = [
    { value: 'box', label: 'Box' },
    { value: 'pcs', label: 'Pcs' },
    { value: 'm', label: 'Meter' },
    { value: 'ltr', label: 'Liter' },
    { value: 'kg', label: 'Kg' },
    { value: 'g', label: 'Gram' },
  ];

  const fetchCategories = async () => {
    const res = await fetch("/api/gets/categories");
    const data = await res.json()

    if (data.status === 200) {
      setCategories(data.data);
    } else {
      setCategories([])
    }
  };
  useEffect(() => {
    (async () => {
      if (id) {
        setLoading(true)
        const item = await getItem(id);
        setLoading(false)

        if (item?.type?.length > 0) {
          setUpdateable(true);
          setType(item.type);
          setName(item.name);
          setUnit(item.unit);
          setCategory(item.category);
          setSellingPrice(item.sellingPrice.split(' ')[1]);
          setCurrency(item.sellingPrice.split(' ')[0]);
          setDescription(item.description);
          setSelectedTaxes(item.taxes.map((tax) => ({
            value: tax.type,
            label: tax.type.charAt(0).toUpperCase() + tax.type.slice(1)
          })));
          setTaxValues({
            percentage: item.taxes.find(t => t.type === 'percentage')?.value || '',
            amount: item.taxes.find(t => t.type === 'amount')?.value || ''
          });
        }
      }
    })();
  }, [id]);
  const resetStates = () => {
    setLoading(false);
    setUpdateable(false);
    setType('goods');
    setName('');
    setUnit('');
    setCategories([]);
    setCategory('');
    setSellingPrice('');
    setCurrency('BDT');
    setDescription('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = {
      type,
      name,
      unit,
      category,
      sellingPrice: `${currency} ${sellingPrice}`,
      description,
      taxes: selectedTaxes.map((tax) => ({
        type: tax.value,
        value: taxValues[tax.value] || '',
      })),
      status: "Active",
    };
    let apiUrl = "/api/adds/new-item"
    let method = "POST";
    
    if (updateable) {
      formData.id = id
      apiUrl = "/api/updates/item"
      method = "PUT"
    }
    
    const res = await fetch(apiUrl, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData),
      credentials: "include"
    })
    const data = await res.json();
    setLoading(false);
    if (data.status === 201 || data.status === 200) {
      toast.success(data?.message)
      if (setOpenModal && onAddItem) {
        const itemDetailForModal = {
          _id: data._id,
          name,
          unit,
          sellingPrice: formData.sellingPrice,
          taxes: formData.taxes
        }
        onAddItem(itemDetailForModal)
        resetStates()
        setOpenModal(false)
      }
    } else {
      toast.error(data?.message)
    }

  };

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

  return (<div className="container text-black dark:text-white mx-auto p-8">
    <form onSubmit={handleSubmit} className={`${loading ? "form-disabled" : ""} space-y-4`}>
      <div className='flex gap-2 items-center'>
        <label className="font-semibold w-[100px]">Type:</label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="type"
              value="goods"
              checked={type === 'goods'}
              onChange={() => setType('goods')}
              className="form-radio"
            />
            <span>Goods</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="type"
              value="service"
              checked={type === 'service'}
              onChange={() => setType('service')}
              className="form-radio"
            />
            <span>Service</span>
          </label>
        </div>
      </div>
      <div className='flex flex-wrap md:gap-10'>
        <div className='space-y-2'>
          <div className="input-container">
            <label className="form-label">Name:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-input"
            />
          </div>

          <div className="input-container">
            <label className="form-label">Unit:</label>
            <Select
              className='w-[200px] select-react'
              options={units}
              value={units.find((u) => u.value === unit)}
              onChange={(selectedOption) => setUnit(selectedOption.value)}
            />
          </div>



          <div className='flex flex-wrap items-center gap-2'>
            <label className="w-[100px] block font-semibold">Selling Price:</label>
            <div className="flex space-x-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className=" px-2 rounded select-react"
              >
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="text-input"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="form-label">Category:</label>
          <div className='min-h-[10px]'>
            {!categories?.length > 0 && <button
              type="button"
              onClick={fetchCategories}
              className="my-2 btn-submit "
            >
              Load Categories
            </button>}
          </div>
          <div className='input-container'>
            {categories?.length > 0 && (
              <Select
                className='w-[200px] select-react'
                options={categories.map((cat) => ({ value: cat, label: cat }))}
                onChange={(selectedOption) => setCategory(selectedOption.value)}
              />
            )}
            <input
              type="text"
              placeholder="Or enter new category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-input"
            />
          </div>
        </div>
      </div>
      <div >
        <div className='input-container'>
          <label className="form-label">Tax:</label>
          <Select
            isMulti
            options={taxOptions}
            onChange={handleTaxChange}
            className="min-w-[200px] w-fit mb-2 select-react"
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
      </div>
      <div className='input-container'>
        <label className="form-label">Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textarea"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-[100px] font-semibold px-2 py-1 bg-green-500 rounded"
      >
        {updateable ? "Update" : "Save"}
      </button>
    </form>
  </div>
  );
};

export default NewItem;
