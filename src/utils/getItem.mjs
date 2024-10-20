import { hostname } from "@/constants/hostname.mjs";

const getItem = async (id) => {
  const host = await hostname();
  const res = await fetch(`${host}/api/gets/item?id=${id}`);
  const data = await res.json();
  if (data?.status === 200) {
    return data?.data;
  } else return [];
};

export default getItem;
