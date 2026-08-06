import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("Missing checkout URL", { status: 400 });
    }

    const targetUrl = new URL(url);
    const origin = targetUrl.origin;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });

    if (!response.ok) {
      return new NextResponse("Failed to load gateway page", { status: 500 });
    }

    let html = await response.text();

    // Inject base tag pointing to the original checkout origin so scripts and resources load correctly
    const baseTag = `<base href="${origin}/">`;
    html = html.replace("<head>", `<head>${baseTag}`);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "ALLOWALL",
        "Content-Security-Policy": "frame-ancestors *",
      },
    });
  } catch (error: any) {
    console.error("Checkout proxy error:", error);
    return new NextResponse("Internal checkout proxy error: " + error.message, { status: 500 });
  }
}
