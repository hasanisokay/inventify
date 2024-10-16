'use client'
import { useState } from 'react';

import Select from 'react-select';
import UnitSelect from '../selects/UnitSelect';

const NewItem = () => {
    const [type, setType] = useState('goods');
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [currency, setCurrency] = useState('BDT');
    const [description, setDescription] = useState('');
    const [tax, setTax] = useState('');
  
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
        tax,
      };
    };
    return (
        <div className="container mx-auto p-8">
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

        <UnitSelect unit={unit} setUnit={setUnit} />

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
          <input
            type="text"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
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


