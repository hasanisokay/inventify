import OrgNav from "@/components/nav/OrgNav";
import "./globals.css";
import { websiteName } from "@/constants/constantsName.mjs";
import Providers from "@/providers/Providers";
import getThemeCookie from "@/utils/getThemeCookie.mjs";
import { Toaster } from "react-hot-toast";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { homeMetaImage } from "@/constants/metaImages.mjs";
import { hostname } from "@/constants/hostname.mjs";

export default async function RootLayout({ children }) {
  let storedTheme = await getThemeCookie();
  let activeOrg = await getActiveOrg();
  return (
    <html lang="en" data-theme={storedTheme}>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="./../../public/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="./../../public/android-chrome-512x512.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="./../../public/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="./../../public/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="./../../public/favicon-16x16.png"
        />
      </head>
      <body className={`antialiased transition-all`}>
        <Providers initialTheme={storedTheme}>
          <header>
            <OrgNav activeOrg={activeOrg} />
          </header>
          <main className="mt-[70px]">{children}</main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}

export async function generateMetadata() {
  const host = await hostname();
  return {
    title: `Home - ${websiteName}`,
    description: "Efficiently manage your business with Inventify - Your go-to invoicing and management solution.",
    publisher: "Rafael Hasan",
    authors: [
      { name: "Rafael Hasan", url: "https://web.facebook.com/therafaelhasan" },
    ],
    keywords: ["Inventify", "Business Management", "Invoice", "Inventory"],
    other: {
      // "color-scheme": ["dark", "light"],
      "twitter:image": homeMetaImage,
      "twitter:card": "summary_large_image",
      "twitter:title": `Home - ${websiteName}`,
      "twitter:description": "Streamline your business with Inventify.",
      "og:title": `Home - ${websiteName}`,
      "og:url": `${host}`,
      "og:image": homeMetaImage,
      "og:description": "All-in-one solution for business management.",
      "og:type": "website",
      "og:site_name": websiteName,
      "og:locale": "en_US",
    },
    image: homeMetaImage,
    canonical: `${host}`,
    url: `${host}`,
    charset: "UTF-8",
    robots: "index, follow",
    httpEquiv: {
      "Content-Security-Policy":
        "default-src 'self'; img-src https: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    },
  };
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#dce4e7' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
}

