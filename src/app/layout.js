import OrgNav from "@/components/nav/OrgNav";
import "./globals.css";
import { websiteName } from "@/constants/constantsName.mjs";
import Providers from "@/providers/Providers";
import getThemeCookie from "@/utils/getThemeCookie.mjs";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: `Home - ${websiteName}`,
  description: "Created By Hasan",
};

export default async function RootLayout({ children }) {
  let storedTheme = await getThemeCookie();
  return (
    <html lang="en" data-theme={storedTheme}>
      <body className={`antialiased transition-all`}>
        <Providers initialTheme={storedTheme}>
          <header>
         <OrgNav />
          </header>
          <main>{children}</main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
