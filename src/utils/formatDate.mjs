const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return "";
  }

  const options = { day: "numeric", month: "short", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-GB", options);
  const day = date.getDate();
  const suffix = (day) => {
    const j = day % 10,
      k = day % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };

  return `${day} ${formattedDate.split(" ")[1]} ${
    formattedDate.split(" ")[2]
  }`;
};

export default formatDate;
