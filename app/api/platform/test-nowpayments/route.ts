import { NextRequest, NextResponse } from "next/server";
import { createNowPaymentsPayment } from "@/lib/nowpayments";

export async function GET(req: NextRequest) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const results: any = {
    apiKeyLength: apiKey ? apiKey.length : "undefined",
    apiKeyMasked: apiKey ? apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5) : "none",
  };

  // Test 1: Try creating a BEP20 (usdtbsc) payment for ₹100 ($1.03 USD)
  try {
    const payRes1 = await createNowPaymentsPayment(
      1.03, // $1.03 USD
      "usdtbsc",
      "test_order_bep20_100",
      "https://example.com/ipn"
    );
    results.bep20_100 = { success: true, response: payRes1 };
  } catch (err: any) {
    results.bep20_100 = { success: false, error: err.message };
  }

  // Test 2: Try creating a BEP20 (usdtbsc) payment for ₹500 ($5.15 USD)
  try {
    const payRes2 = await createNowPaymentsPayment(
      5.15, // $5.15 USD
      "usdtbsc",
      "test_order_bep20_500",
      "https://example.com/ipn"
    );
    results.bep20_500 = { success: true, response: payRes2 };
  } catch (err: any) {
    results.bep20_500 = { success: false, error: err.message };
  }

  // Test 3: Try creating a TRC20 (usdttrc20) payment for ₹500 ($5.15 USD)
  try {
    const payRes3 = await createNowPaymentsPayment(
      5.15, // $5.15 USD
      "usdttrc20",
      "test_order_trc20_500",
      "https://example.com/ipn"
    );
    results.trc20_500 = { success: true, response: payRes3 };
  } catch (err: any) {
    results.trc20_500 = { success: false, error: err.message };
  }

  // Test 4: Try creating a TRC20 (usdttrc20) payment for ₹1500 ($15.46 USD)
  try {
    const payRes4 = await createNowPaymentsPayment(
      15.46, // $15.46 USD
      "usdttrc20",
      "test_order_trc20_1500",
      "https://example.com/ipn"
    );
    results.trc20_1500 = { success: true, response: payRes4 };
  } catch (err: any) {
    results.trc20_1500 = { success: false, error: err.message };
  }

  return NextResponse.json(results);
}
