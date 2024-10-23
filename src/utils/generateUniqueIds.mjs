
const generateUniqueIds = (count) => {
  const ids = [];

  for (let i = 0; i < count; i++) {
    const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    ids.push(id);
  }

  return ids;
};

export default generateUniqueIds;
