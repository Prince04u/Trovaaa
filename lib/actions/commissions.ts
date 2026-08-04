"use server";

import { prisma } from "@/lib/prisma";
import { getSetting } from "./settings";

export async function distributeWaterReward(userId: string, betAmount: number, gameName: string) {
  try {
    const commissionStr = await getSetting("betting_commission_settings");
    if (!commissionStr || commissionStr === "{}") return;

    const commissions = JSON.parse(commissionStr);

    // Find the user and fetch their upline hierarchy
    // We need up to 6 levels of referrers.
    let currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredById: true }
    });

    if (!currentUser || !currentUser.referredById) return;

    let currentReferrerId = currentUser.referredById;

    for (let level = 1; level <= 6; level++) {
      if (!currentReferrerId) break;

      const referrer = await prisma.user.findUnique({
        where: { id: currentReferrerId },
        select: { id: true, referredById: true, role: true, isGuest: true }
      });

      if (!referrer) break;
      
      // Stop if referrer is a guest or not eligible to earn
      if (!referrer.isGuest) {
        const percentageStr = commissions[`level${level}`];
        if (percentageStr && !isNaN(Number(percentageStr))) {
          const percentage = Number(percentageStr);
          if (percentage > 0) {
            const rewardAmount = Math.floor((betAmount * percentage) / 100);
            
            if (rewardAmount > 0) {
              await prisma.$transaction(async (tx) => {
                const updatedWallet = await tx.wallet.update({
                  where: { userId: referrer.id },
                  data: { balance: { increment: rewardAmount } }
                });

                await tx.ledgerEntry.create({
                  data: {
                    walletId: updatedWallet.id,
                    type: "WATER_REWARD",
                    amount: rewardAmount,
                    balanceAfter: updatedWallet.balance,
                    meta: {
                      level,
                      percentage,
                      game: gameName,
                      sourceUserId: userId,
                      betAmount
                    }
                  }
                });
              });
            }
          }
        }
      }

      currentReferrerId = referrer.referredById as string;
    }
  } catch (error) {
    console.error("Failed to distribute water reward:", error);
  }
}
