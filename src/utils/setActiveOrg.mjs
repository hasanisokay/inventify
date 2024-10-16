'use server'
import { cookies } from "next/headers";

const setActiveOrg = async (id) => {
  cookies().set({
        name: "active-org",
        value: id,
        maxAge: 24 * 60 * 60 * 365, // 1 year
      });
};

export default setActiveOrg;