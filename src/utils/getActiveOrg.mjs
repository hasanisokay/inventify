'use server'
import { cookies } from "next/headers";

const getActiveOrg = async () => {
  const cookieStore = cookies();
  const activeOrg = cookieStore.get("active-org")?.value;
  return activeOrg || null;
};

export default getActiveOrg;
