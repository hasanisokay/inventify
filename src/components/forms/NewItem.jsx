'use client'
import { useState } from 'react';
import Select from 'react-select';

const NewItem = () => {
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
    // Simulate API call
    const availableCategories = ['Electronics', 'Furniture', 'Clothing', 'Food'];
    setCategories(availableCategories);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
      // lastSyncTime: new Date(),
      status: "Active",
    };
    console.log('Item Data:', formData);
    // Handle the form submission logic (e.g., send to API)
  };

  const handleTaxChange = (selectedOptions) => {
    setSelectedTaxes(selectedOptions);
    // Reset tax values for unselected options
    const updatedValues = { ...taxValues };
    selectedOptions.forEach((tax) => {
      if (!updatedValues[tax.value]) {
        updatedValues[tax.value] = '';
      }
    });
    setTaxValues(updatedValues);
  };

  return (   <div className="container mx-auto p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-semibold">Type:</label>
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

        <div>
          <label className="block font-semibold">Name:</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
      <label className="block font-semibold">Unit:</label>
      <Select

        options={units}
        value={units.find((u) => u.value === unit)}
        onChange={(selectedOption) => setUnit(selectedOption.value)}
      />
    </div>

        <div>
          <label className="block font-semibold">Category:</label>
          <button
            type="button"
            onClick={fetchCategories}
            className="p-2 bg-blue-500 text-white rounded mb-2"
          >
            Load Categories
          </button>
          {categories.length > 0 && (
            <Select
              options={categories.map((cat) => ({ value: cat, label: cat }))}
              onChange={(selectedOption) => setCategory(selectedOption.value)}
            />
          )}
          <input
            type="text"
            placeholder="Or enter new category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-2"
          />
        </div>

        <div>
          <label className="block font-semibold">Selling Price:</label>
          <div className="flex space-x-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Tax:</label>
          <Select
            isMulti
            options={taxOptions}
            onChange={handleTaxChange}
            className="mb-2"
          />
          {selectedTaxes.map((tax) => (
            <div key={tax.value}>
              <label className="block font-semibold">
                {tax.label}:
              </label>
              <input
                type="number"
                value={taxValues[tax.value] || ''}
                onChange={(e) => setTaxValues({ ...taxValues, [tax.value]: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded mb-2"
                placeholder={`Enter ${tax.label} value`}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-green-500 text-white rounded"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default NewItem;
