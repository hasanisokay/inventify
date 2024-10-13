import { hostname } from "@/constants/hostname.mjs";
const logOut = async () => {
  const res = await fetch(`${await hostname()}/api/admin/logout`);
  const data = await res.json();
};

export default logOut;
