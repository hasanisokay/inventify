import "./globals.css";
import MainNav from "@/components/nav/MainNav";
import { websiteName } from "@/constants/constantsName.mjs";
import Providers from "@/providers/Providers";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: `Home - ${websiteName}`,
  description: "Created By Hasan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased transition-all`}>
        <Providers>
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
