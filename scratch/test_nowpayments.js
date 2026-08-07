require("dotenv").config();

async function main() {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  console.log("NOWPAYMENTS_API_KEY length:", apiKey ? apiKey.length : "undefined");
  if (apiKey) {
    console.log("NOWPAYMENTS_API_KEY masked:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5));
  }

  try {
    const res = await fetch("https://api.nowpayments.io/v1/status", {
      method: "GET",
      headers: {
        "x-api-key": apiKey || ""
      }
    });

    console.log("Status check response status:", res.status);
    const text = await res.text();
    console.log("Status check response text:", text);
  } catch (err) {
    console.error("Status check failed:", err);
  }

  // Also query merchant currencies to see if USDT is enabled/available
  try {
    const res = await fetch("https://api.nowpayments.io/v1/merchant/coins", {
      method: "GET",
      headers: {
        "x-api-key": apiKey || ""
      }
    });

    console.log("Coins check response status:", res.status);
    const text = await res.text();
    console.log("Coins check response text:", text.substring(0, 200) + "...");
  } catch (err) {
    console.error("Coins check failed:", err);
  }
}

main().catch(console.error);
