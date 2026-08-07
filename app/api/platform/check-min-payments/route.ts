import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const results: any = {};

  const headers = {
    "x-api-key": apiKey || "",
  };

  try {
    const resTrc = await fetch("https://api.nowpayments.io/v1/min-amount?currency_from=usdttrc20&currency_to=usdttrc20&fiat_equivalent=usd", {
      headers,
    });
    results.trc20 = await resTrc.json();
  } catch (err: any) {
    results.trc20 = { error: err.message };
  }

  try {
    const resBep = await fetch("https://api.nowpayments.io/v1/min-amount?currency_from=usdtbsc&currency_to=usdtbsc&fiat_equivalent=usd", {
      headers,
    });
    results.bep20 = await resBep.json();
  } catch (err: any) {
    results.bep20 = { error: err.message };
  }

  return NextResponse.json(results);
}
