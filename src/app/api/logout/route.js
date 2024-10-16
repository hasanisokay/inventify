import { COOKIE_NAME } from "@/constants/constantsName.mjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    cookies().delete(COOKIE_NAME);
    return NextResponse.json({ status: 200, message: "Logout success." });
  } catch {
    return NextResponse.json({ status: 500, message: "Server Error." });
  }
};