import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createNowPaymentsPayment, createNowPaymentsInvoice } from "@/lib/nowpayments";
import { sendTelegramNotification } from "@/lib/telegram";
import { createSunpaysPayin } from "@/lib/sunpays";
import { getRequestBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channel");
    const amountParam = searchParams.get("amount");
    const amount = Number(amountParam);

    if (!channelId || !amountParam || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Retrieve or auto-create the deposit channel to ensure it exists
    let channel = await prisma.depositChannel.findFirst({
      where: {
        OR: [
          { id: channelId },
          { channelKey: channelId },
        ],
      },
    });

    if (channel) {
      const keyLower = channel.channelKey.toLowerCase();
      const isSunpaysKey = keyLower.includes("sunpay") || keyLower.includes("paytmx") || keyLower.includes("upixqr");
      
      // Auto-heal: If it is a Sunpays/UPI channel but currently stored as crypto, correct it in the database
      if (isSunpaysKey && channel.channelType !== "upi") {
        channel = await prisma.depositChannel.update({
          where: { id: channel.id },
          data: {
            channelType: "upi",
            label: "Sunpay UPI x QR",
            minAmount: 100,
          },
        });
      }

      // Auto-heal: If it is a Crypto channel but minAmount is too high (e.g. 12) to accept converted INR, lower it to 1
      if ((channel.channelKey.includes("trc20") || channel.channelKey.includes("bep20")) && channel.minAmount > 1) {
        channel = await prisma.depositChannel.update({
          where: { id: channel.id },
          data: {
            minAmount: 1,
          },
        });
      }
    }

    if (!channel) {
      const idLower = channelId.toLowerCase();
      const isSunpaysKey = idLower.includes("sunpay") || idLower.includes("paytmx") || idLower.includes("upixqr");
      const isUpi = isSunpaysKey || idLower.includes("upi") || idLower.includes("paytm") || idLower.includes("phonepe") || idLower.includes("qr");

      if (isUpi) {
        channel = await prisma.depositChannel.create({
          data: {
            kind: "CHANNEL",
            channelKey: channelId,
            label: isSunpaysKey ? "Sunpay UPI x QR" : "UPI Paytm/PhonePe QR",
            channelType: "upi",
            minAmount: 100,
            maxAmount: 50000,
            active: true,
          },
        });
      } else {
        const isTrc = channelId.includes("trc20");
        const label = isTrc ? "TronPay-USDT (TRC20)" : "Binance-USDT (BEP20)";
        const minAmount = 1; // Lowered to 1 to accommodate 500 INR -> 5.26 USDT conversions

        channel = await prisma.depositChannel.create({
          data: {
            kind: "CHANNEL",
            channelKey: channelId,
            label,
            channelType: "crypto",
            minAmount,
            maxAmount: 100000,
            active: true,
          },
        });
      }
    }

    if (!channel.active) {
      return NextResponse.json({ error: "This channel is currently inactive" }, { status: 400 });
    }

    if (amount < channel.minAmount || amount > channel.maxAmount) {
      return NextResponse.json(
        { error: `Amount must be between ${channel.minAmount} and ${channel.maxAmount}` },
        { status: 400 }
      );
    }

    const baseUrl = getRequestBaseUrl(request);
    const ipnCallbackUrl = `${baseUrl}/api/wallet/nowpayments-ipn`;

    const isSunpays =
      channel.channelKey.toLowerCase().includes("sunpay") ||
      channel.channelKey.toLowerCase().includes("paytmx") ||
      channel.channelKey.toLowerCase().includes("upixqr") ||
      channel.label.toLowerCase().includes("sunpay") ||
      channel.label.toLowerCase().includes("paytmx") ||
      channel.label.toLowerCase().includes("upixqr");

    // Strictly route to Sunpays so the user is forced into the official gateway checkout.
    if (isSunpays) {
      // 1. Create a PENDING deposit request in database
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dateStr = `${dd}${mm}`;
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      const customDepositId = `RC${dateStr}IS${randomDigits}`;

      const depositRequest = await prisma.depositRequest.create({
        data: {
          id: customDepositId,
          userId: user.id,
          amount: amount,
          status: "PENDING",
          channelKey: channel.channelKey,
        },
      });

      try {
        const notifyUrl = `${baseUrl}/api/wallet/sunpays-payin-ipn/b14ed658d0fbda54d296a336c28f3e59a333b29ef5ee8fb62a5e67900010c5fd`;
        
        console.log(`Calling Sunpay payin for deposit: ${depositRequest.id}, Amount: ${amount}`);
        const spResponse = await createSunpaysPayin({
          order_id: depositRequest.id,
          amount: amount,
          currency: "INR",
          method: "upi",
          customer_name: "User",
          notify_url: notifyUrl,
        });

        console.log("Sunpays response:", spResponse);

        const checkoutUrl = spResponse.checkout_url || spResponse.payment_url || spResponse.transaction?.gateway_payment_url || spResponse.redirect_url;
        if (!checkoutUrl) {
          throw new Error("No checkout_url returned from Sunpay");
        }

        // Save merchant providerId in DB first so the telegram lookup can fetch it
        const providerId = String(spResponse.transaction?.id || spResponse.id || depositRequest.id);
        await prisma.depositRequest.update({
          where: { id: depositRequest.id },
          data: { providerId },
        });

        // Send initial Telegram bot notification
        const mode = "Sunpay UPI";
        let telegramMessageId: number | null = null;
        try {
          const msgId = await sendTelegramNotification(
            user.uid,
            amount,
            mode,
            depositRequest.id,
            "created",
            depositRequest.createdAt,
            "N/A"
          );
          if (msgId) telegramMessageId = msgId;
        } catch (err) {
          console.error("Failed to send Telegram notification:", err);
        }

        const updatedNote = JSON.stringify({
          gateway: "sunpays",
          checkoutUrl: checkoutUrl,
          telegramMessageId: telegramMessageId || undefined,
        });

        await prisma.depositRequest.update({
          where: { id: depositRequest.id },
          data: { 
            note: updatedNote 
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            type: "sunpays",
            depositId: depositRequest.id,
            checkoutUrl: checkoutUrl,
            channelLabel: channel.label,
          },
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("Sunpays payin creation failed:", err);
        await prisma.depositRequest.delete({ where: { id: depositRequest.id } });
        return NextResponse.json({ error: "Failed to initiate Sunpay payment gateway: " + errMsg }, { status: 500 });
      }
    }

    const typeLower = String(channel.channelType || "").toLowerCase();
    const isCrypto = typeLower.includes("crypto") || typeLower.includes("usdt");

    if (isCrypto) {
      const usdtRate = 95; // stable exchange rate fallback
      const amountInr = Math.round(amount * usdtRate);
      const priceAmountInr = amountInr; // Pass INR amount directly since NowPayments helper uses 'inr' as price_currency

      // 1. Create a PENDING deposit request in database
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dateStr = `${dd}${mm}`;
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      const customDepositId = `RC${dateStr}UN${randomDigits}`;

      const depositRequest = await prisma.depositRequest.create({
        data: {
          id: customDepositId,
          userId: user.id,
          amount: amountInr,
          status: "PENDING",
          channelKey: channel.channelKey,
        },
      });

      const payCurrency = channelId.toLowerCase().includes("bep20") ? "usdtbsc" : "usdttrc20";

      // 2. Request direct payment from NOWPayments gateway for white-label address rendering
      console.log(`Calling NOWPayments for deposit: ${depositRequest.id}, Amount INR: ${priceAmountInr}`);
      const npPayment = await createNowPaymentsPayment(
        priceAmountInr,
        payCurrency,
        depositRequest.id,
        ipnCallbackUrl
      );

      // Save merchant providerId in DB first so the telegram lookup can fetch it
      await prisma.depositRequest.update({
        where: { id: depositRequest.id },
        data: { providerId: String(npPayment.payment_id) },
      });

      // 3. Send initial Telegram bot notification
      const mode = "Usdt(deposit channel)";
      let telegramMessageId: number | null = null;
      try {
        const msgId = await sendTelegramNotification(
          user.uid,
          amountInr,
          mode,
          depositRequest.id,
          "created",
          depositRequest.createdAt,
          "N/A"
        );
        if (msgId) telegramMessageId = msgId;
      } catch (err) {
        console.error("Failed to send Telegram notification:", err);
      }

      // 4. Save NOWPayments response details and telegram message ID in database note
      const updatedNote = JSON.stringify({
        paymentId: npPayment.payment_id,
        payAddress: npPayment.pay_address,
        payAmount: npPayment.pay_amount,
        telegramMessageId: telegramMessageId || undefined,
      });

      await prisma.depositRequest.update({
        where: { id: depositRequest.id },
        data: { 
          note: updatedNote 
        },
      });

      // 5. Return details to user payment screen for custom white-label rendering
      return NextResponse.json({
        success: true,
        data: {
          type: "crypto",
          depositId: depositRequest.id,
          payAddress: npPayment.pay_address,
          payAmount: npPayment.pay_amount,
          payCurrency: npPayment.pay_currency,
          usdtRate,
          channelLabel: channel.label,
        },
      });
    } else {
      // Manual UPI Channel
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dateStr = `${dd}${mm}`;
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      const customDepositId = `RC${dateStr}IS${randomDigits}`;

      const depositRequest = await prisma.depositRequest.create({
        data: {
          id: customDepositId,
          userId: user.id,
          amount: amount,
          status: "PENDING",
          channelKey: channel.channelKey,
          note: JSON.stringify({ manualChannelLabel: channel.label }),
        },
      });

      // Send initial Telegram notification
      const mode = "Upi(deposit channel)";
      let telegramMessageId: number | null = null;
      try {
        const msgId = await sendTelegramNotification(
          user.uid,
          amount,
          mode,
          depositRequest.id,
          "created",
          depositRequest.createdAt,
          "N/A"
        );
        if (msgId) telegramMessageId = msgId;
      } catch (err) {
        console.error("Failed to send Telegram notification:", err);
      }

      // Save telegram message ID in note
      const updatedNote = JSON.stringify({
        manualChannelLabel: channel.label,
        telegramMessageId: telegramMessageId || undefined,
      });

      await prisma.depositRequest.update({
        where: { id: depositRequest.id },
        data: { note: updatedNote },
      });

      return NextResponse.json({
        success: true,
        data: {
          type: "upi",
          depositId: depositRequest.id,
          upiId: channel.detail || "merchant@upi",
          payeeName: channel.label,
          note: depositRequest.id,
          channelLabel: channel.label,
        },
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to initialize deposit request";
    console.error("Error creating deposit payment:", error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
