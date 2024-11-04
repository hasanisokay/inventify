const getFullAddress = (a) => {
    const parts = [
      a?.street,
      a?.city,
      a?.state,
      a?.postalCode,
      a?.country
    ].filter(Boolean);
    return parts.join(', ');
  }
  export default getFullAddress;