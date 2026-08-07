import { NextRequest, NextResponse } from "next/server";
import { createNowPaymentsPayment } from "@/lib/nowpayments";

export async function GET(req: NextRequest) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const results: any = {
    apiKeyLength: apiKey ? apiKey.length : "undefined",
    apiKeyMasked: apiKey ? apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5) : "none",
  };

  // Test 1: Try creating a BEP20 (usdtbsc) payment for ₹500 INR
  try {
    const payRes1 = await createNowPaymentsPayment(
      500, // ₹500 INR
      "usdtbsc",
      "test_order_bep20_500_new",
      "https://example.com/ipn"
    );
    results.bep20_500 = { success: true, response: payRes1 };
  } catch (err: any) {
    results.bep20_500 = { success: false, error: err.message };
  }

  // Sleep for 1 second to avoid NOWPayments 429 rate limit
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Try creating a TRC20 (usdttrc20) payment for ₹1500 INR
  try {
    const payRes2 = await createNowPaymentsPayment(
      1500, // ₹1500 INR
      "usdttrc20",
      "test_order_trc20_1500_new",
      "https://example.com/ipn"
    );
    results.trc20_1500 = { success: true, response: payRes2 };
  } catch (err: any) {
    results.trc20_1500 = { success: false, error: err.message };
  }

  return NextResponse.json(results);
}
