import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("Missing checkout URL", { status: 400 });
    }

    // Fetch the external payment gateway checkout page HTML from the server side
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });

    if (!response.ok) {
      return new NextResponse("Failed to load gateway page", { status: 500 });
    }

    let html = await response.text();

    // 1. Inject <base href="https://nowpayments.io/"> so scripts, stylesheets and relative URLs resolve correctly
    const baseTag = '<base href="https://nowpayments.io/">';
    html = html.replace("<head>", `<head>${baseTag}`);

    // 2. Inject custom CSS styles to target and hide all NOWPayments branding and footers
    const styleTag = `
      <style>
        /* Hide NOWPayments footers, logos, text and powered-by links */
        header, footer, 
        .footer, .header,
        [class*="branding"], [class*="Branding"],
        [class*="logo"], [class*="Logo"],
        [class*="poweredBy"], [class*="powered-by"],
        [class*="np-link"], [class*="nowpayments"],
        a[href*="nowpayments.io"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }
      </style>
    `;
    html = html.replace("</head>", `${styleTag}</head>`);

    // 3. Return the modified HTML to the client as text/html without X-Frame-Options or CSP headers
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "ALLOWALL",
        "Content-Security-Policy": "frame-ancestors *",
      },
    });
  } catch (error: any) {
    console.error("USDT checkout proxy error:", error);
    return new NextResponse("Internal checkout proxy error: " + error.message, { status: 500 });
  }
}
