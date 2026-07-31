import "./theme.css";
import "./globals.css";
import PlatformRoot from "./PlatformRoot";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `${BRAND_NAME} — Shopping Mall`,
  description: "Quality Guarantee",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#fafafa", margin: 0, padding: 0 }}>
        <PlatformRoot>{children}</PlatformRoot>
      </body>
    </html>
  );
}
