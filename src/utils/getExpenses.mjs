import { hostname } from "@/constants/hostname.mjs";

const getExpenses = async(page, limit, sort, keyword = "", ogrId="") => {
    const host = await hostname();
    const res = await fetch(`${host}/api/gets/expenses?page=${page || 1}&&limit=${limit}&&sort=${sort}&&keyword=${keyword}&&orgId=${ogrId}`);
    const data = await res.json();
    return data.data || [];

};

export default getExpenses;
