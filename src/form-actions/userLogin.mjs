"use server"

import { hostname } from "@/constants/hostname.mjs";

const userLogin = async (formData) => {
  const username = formData.get("username");
  const password = formData.get("password");
  if (!username?.trim() || !password?.trim()) {
    return null;
  }
  const host = await hostname();
  const res = await fetch(`${host}/api/login`,{
   method:"POST",
   credentials: 'include',
   headers: {
    'Content-Type': 'application/json',
   },
   body: JSON.stringify({username,password})
  });
  const data = await res.json();
  return data;
};

export default userLogin;
