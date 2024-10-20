import { hostname } from "@/constants/hostname.mjs";

const getCustomerDetails = async(id) => {
const host = await hostname()
    const res = await fetch(`${host}/api/gets/customer?id=${id}`)
    const data = await res.json()
    if(data?.status ===200){
        return data?.data       
    }else return []
 
};

export default getCustomerDetails;