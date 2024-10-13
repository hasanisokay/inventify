import Select from 'react-select';

const UnitSelect = ({ unit, setUnit }) => {
  const units = [
    { value: 'box', label: 'Box' },
    { value: 'pcs', label: 'Pcs' },
    { value: 'm', label: 'Meter' },
    { value: 'ltr', label: 'Liter' },
    { value: 'kg', label: 'Kg' },
    { value: 'g', label: 'Gram' },
  ];

  return (
    <div>
      <label className="block font-semibold">Unit:</label>
      <Select
        options={units}
        value={units.find((u) => u.value === unit)}
        onChange={(selectedOption) => setUnit(selectedOption.value)}
      />
    </div>
  );
};

export default UnitSelect;
