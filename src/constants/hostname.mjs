"use server"
import { headers } from "next/headers";
export const hostname = async () => {
  const headersList = headers()
  const hostname = headersList.get('host') || 'localhost'; 
  const env = process.env.NODE_ENV;
  if (env == "development") {
    return `http://${hostname}`;
  }else if(hostname==='localhost:3000'){
    return `http://${hostname}`;
  }
  else if (env == "production") {
    return `https://${hostname}`;
  }
};
