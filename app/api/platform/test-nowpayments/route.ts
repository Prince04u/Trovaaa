import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const results: any = {
    apiKeyLength: apiKey ? apiKey.length : "undefined",
    apiKeyMasked: apiKey ? apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5) : "none",
  };

  try {
    const statusRes = await fetch("https://api.nowpayments.io/v1/status", {
      method: "GET",
      headers: {
        "x-api-key": apiKey || "",
      },
    });
    results.statusCheckCode = statusRes.status;
    results.statusCheckBody = await statusRes.json().catch((e) => e.message);
  } catch (err: any) {
    results.statusCheckError = err.message;
  }

  try {
    const coinsRes = await fetch("https://api.nowpayments.io/v1/merchant/coins", {
      method: "GET",
      headers: {
        "x-api-key": apiKey || "",
      },
    });
    results.coinsCheckCode = coinsRes.status;
    results.coinsCheckBody = await coinsRes.json().catch((e) => e.message);
  } catch (err: any) {
    results.coinsCheckError = err.message;
  }

  return NextResponse.json(results);
}
