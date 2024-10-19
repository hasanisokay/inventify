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
       <head>
        <link rel="apple-touch-icon" sizes="180x180" href="./../../public/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="./../../public/android-chrome-512x512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="./../../public/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="./../../public/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="./../../public/favicon-16x16.png" />
        <link rel="manifest" href="./../../public/site.webmanifest" />
      </head>
      <body className={`antialiased transition-all`}>
        <Providers initialTheme={storedTheme}>
          <header>
         <OrgNav />
          </header>
          <main className="mt-[70px]">{children}</main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
