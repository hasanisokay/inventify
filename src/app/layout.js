import "./globals.css";
import MainNav from "@/components/nav/MainNav";
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
            <MainNav />
          </header>
          <main>{children}</main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
