const excelSerialToDate = (serial) => {
  const excelStartDate = new Date(1900, 0, 1);
  const days = Math.floor(serial);
  const fractionalDay = serial - days;

  const date = new Date(excelStartDate);
  date.setDate(date.getDate() + days);

  const hours = Math.floor(fractionalDay * 24);
  const minutes = Math.floor((fractionalDay * 24 - hours) * 60);
  const seconds = Math.round(
    ((fractionalDay * 24 - hours) * 60 - minutes) * 60
  );

  date.setHours(hours, minutes, seconds);

  return date;
};

export default excelSerialToDate;
