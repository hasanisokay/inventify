import { hostname } from "@/constants/hostname.mjs";

const getItems = async(page, limit, sort, keyword = "", titleOnly="", ogrId="", startDate, endDate, report=false) => {
    const host = await hostname();
    const res = await fetch(`${host}/api/gets/items?page=${page || 1}&&limit=${limit}&&sort=${sort}&&keyword=${keyword}&&titleOnly=${titleOnly}&&orgId=${ogrId}&&startDate=${startDate}&&endDate=${endDate}&&report=${report}`);
    const data = await res.json();
    return data.data || [];

};

export default getItems;
