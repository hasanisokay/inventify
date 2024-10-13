'use server'
import { COOKIE_NAME } from "@/constants/constantsName.mjs";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export const verifyToken = async (token = null) => {
  if (!token) {
    token = cookies().get(COOKIE_NAME)?.value.split("Bearer")[1];
  }
  const secret = new TextEncoder().encode(process.env.JWT_ENCRYPTION_KEY);
  try {
    const { payload } = await jwtVerify(token, secret);
    const { email, password, name, role } = payload;
    const data = payload;
    console.log({data});
    
    if (email && password) return { email, name, role };
    else return false;
  } catch (error) {
    // console.error("Token verification failed:", error.message);
    return false;
  }
};
