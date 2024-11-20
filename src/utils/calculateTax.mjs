const calculateTax = (totalAmount = 0, taxPercentage = 0, taxAmount = 0) => {
  let result = 0;
  if (!taxPercentage && taxAmount) {
    return taxAmount;
  }
  const calculatedTaxFromPercentage = parseFloat(
    (totalAmount * taxPercentage) / 100
  ).toFixed(2);

  if (taxAmount && taxPercentage) {
    result = parseFloat(calculatedTaxFromPercentage) + parseFloat(taxAmount)
  } else {
    result = parseFloat(calculatedTaxFromPercentage)
  }
  return result;
};
export default calculateTax;
