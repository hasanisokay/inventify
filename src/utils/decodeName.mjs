const decodeName = (fullName) => {
  const trimmedName = fullName.trim();
  const nameParts = trimmedName.split(" ");
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: "" };
  }

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return { firstName, lastName };
};

export default decodeName;
