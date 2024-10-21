
'use server'
import { hostname } from "@/constants/hostname.mjs";

const getCustomers = async (page, limit, sort, keyword = "", titleOnly="", ogrId="") => {

  const host = await hostname();
  const res = await fetch(`${host}/api/gets/customers?page=${page || 1}&&limit=${limit}&&sort=${sort}&&keyword=${keyword}&&titleOnly=${titleOnly}&&orgId=${ogrId}`);
  const data = await res.json();
  return data.data || [];
};

export default getCustomers;
