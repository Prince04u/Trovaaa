import "./theme.css";
import "./globals.css";
import PlatformRoot from "./PlatformRoot";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `${BRAND_NAME} — Shopping Mall`,
  description: "Quality Guarantee",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PlatformRoot>{children}</PlatformRoot>
      </body>
    </html>
  );
}
