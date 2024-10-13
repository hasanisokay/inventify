import "./globals.css";
import { websiteName } from "@/constants/constantsName.mjs";

export const metadata = {
  title: `Home - ${websiteName}`,
  description: "Created By Hasan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
