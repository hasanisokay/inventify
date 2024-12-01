"use server";
import { cookies } from "next/headers";

const setThemeCookie = (theme) => {
  cookies().set({
    name: "theme",
    value: theme,
    maxAge: 24 * 60 * 60 * 365, 
  });
};

export default setThemeCookie;
