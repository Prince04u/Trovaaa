async function main() {
  try {
    const resTrc = await fetch("https://api.nowpayments.io/v1/min-amount?currency_from=usdttrc20&currency_to=usdttrc20");
    const jsonTrc = await resTrc.json();
    console.log("TRC20 (usdttrc20) Min Amount Details:", JSON.stringify(jsonTrc, null, 2));

    const resBep = await fetch("https://api.nowpayments.io/v1/min-amount?currency_from=usdtbsc&currency_to=usdtbsc");
    const jsonBep = await resBep.json();
    console.log("BEP20 (usdtbsc) Min Amount Details:", JSON.stringify(jsonBep, null, 2));
  } catch (err) {
    console.error("Error fetching min amounts:", err);
  }
}

main();
