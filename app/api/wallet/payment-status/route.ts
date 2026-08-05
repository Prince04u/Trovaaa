import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNowPaymentsPaymentStatus, getNowPaymentsInvoiceStatus } from "@/lib/nowpayments";
import { sendTelegramNotification } from "@/lib/telegram";
import { checkAndAwardReferralReward } from "@/lib/rewards/referral";
import { distributeRechargeBonus } from "@/lib/actions/commissions";
import { applyDepositCredit } from "@/lib/wallet/creditDeposit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing deposit ID" }, { status: 400 });
  }

  try {
    const deposit = await prisma.depositRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit request not found" }, { status: 404 });
    }

    // If already verified, return status immediately
    if (deposit.status !== "PENDING") {
      return NextResponse.json({ status: deposit.status });
    }

    let noteDetails: any = {};
    try {
      noteDetails = JSON.parse(deposit.note || "{}");
    } catch {}

    const { paymentId, invoiceId } = noteDetails;

    // If it's a NOWPayments transaction, poll the gateway API
    if (paymentId || invoiceId) {
      let paymentStatus = "";
      try {
        if (paymentId) {
          const npStatus = await getNowPaymentsPaymentStatus(String(paymentId));
          paymentStatus = npStatus.payment_status?.toLowerCase() || "";
        } else if (invoiceId) {
          const npStatus = await getNowPaymentsInvoiceStatus(String(invoiceId));
          paymentStatus = npStatus.invoice_status?.toLowerCase() || "";
        }
      } catch (err) {
        console.error("Failed to query nowpayments status in poll:", err);
      }

      if (paymentStatus === "finished" || paymentStatus === "paid" || paymentStatus === "confirmed" || paymentStatus === "partially_paid") {
        const creditRes = await applyDepositCredit({
          depositId: id,
          source: "payment_status_poll",
          gatewayMeta: { gateway: "nowpayments", autoApproved: true },
          buildNote: (existing) => ({
            ...existing,
            gatewayStatus: paymentStatus,
            autoVerified: true,
          }),
        });

        if (creditRes.credited) {
          // Distribute recharge bonus from admin settings ONLY
          await distributeRechargeBonus(deposit.userId, deposit.amount);

          // Trigger Telegram update (success)
          await sendTelegramNotification(
            deposit.user.uid,
            deposit.amount,
            "Usdt(deposit channel)",
            deposit.id,
            "success",
            new Date(),
            noteDetails.txid || "N/A",
            noteDetails.telegramMessageId,
            deposit.isMock,
            "Automatic"
          );
          await checkAndAwardReferralReward(deposit.userId, deposit.amount, deposit.id);
        }

        return NextResponse.json({ status: "APPROVED" });
      } else if (paymentStatus === "failed" || paymentStatus === "expired") {
        // Auto-reject the payment
        await prisma.depositRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            reviewedAt: new Date(),
            note: JSON.stringify({
              ...noteDetails,
              gatewayStatus: paymentStatus,
              autoVerified: true,
            }),
          },
        });

        // Trigger Telegram update (failed)
        await sendTelegramNotification(
          deposit.user.uid,
          deposit.amount,
          "Usdt(deposit channel)",
          deposit.id,
          "failed",
          new Date(),
          noteDetails.txid || "N/A",
          noteDetails.telegramMessageId,
          deposit.isMock,
          "Automatic"
        );

        return NextResponse.json({ status: "REJECTED" });
      }

      return NextResponse.json({
        status: "PENDING",
        gatewayStatus: paymentStatus,
      });
    }

    // Manual/Static deposit, wait for manual admin review
    return NextResponse.json({ status: "PENDING" });
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
