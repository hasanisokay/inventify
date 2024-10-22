import { hostname } from "@/constants/hostname.mjs";

const getItems = async(page, limit, sort, keyword = "", titleOnly="", ogrId="") => {
    const host = await hostname();
    const res = await fetch(`${host}/api/gets/items?page=${page || 1}&&limit=${limit}&&sort=${sort}&&keyword=${keyword}&&titleOnly=${titleOnly}&&orgId=${ogrId}`);
    const data = await res.json();
    return data.data || [];

};

export default getItems;