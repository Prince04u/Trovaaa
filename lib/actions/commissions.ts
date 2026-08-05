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

export async function distributeRechargeBonus(userId: string, depositAmount: number) {
  try {
    const rechargeStr = await getSetting("recharge_bonus_settings");
    if (!rechargeStr || rechargeStr === "{}") return;

    const rechargeSettings = JSON.parse(rechargeStr);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, referredById: true }
    });

    if (!user) return;

    // Count how many APPROVED deposits this user has (including this one if it's already approved)
    const approvedCount = await prisma.depositRequest.count({
      where: { userId: user.id, status: "APPROVED" }
    });

    let tiers: any[] = [];
    let rechargeType = "";
    if (approvedCount === 1) {
      tiers = rechargeSettings.firstRecharge || [];
      rechargeType = "1st Recharge";
    } else if (approvedCount === 2) {
      tiers = rechargeSettings.secondRecharge || [];
      rechargeType = "2nd Recharge";
    } else if (approvedCount === 3) {
      tiers = rechargeSettings.thirdRecharge || [];
      rechargeType = "3rd Recharge";
    }

    if (tiers.length === 0) return;

    // Find the matching tier
    let matchedTier = null;
    for (const tier of tiers) {
      const min = Number(tier.min) || 0;
      const max = Number(tier.max) || Infinity;
      if (depositAmount >= min && depositAmount <= max) {
        matchedTier = tier;
        break;
      }
    }

    if (!matchedTier) return;

    const calcBonus = (bonusStr: string) => {
      if (!bonusStr) return 0;
      if (bonusStr.includes("%")) {
        const pct = Number(bonusStr.replace("%", ""));
        if (!isNaN(pct)) return Math.floor((depositAmount * pct) / 100);
      } else {
        const amt = Number(bonusStr);
        if (!isNaN(amt)) return amt;
      }
      return 0;
    };

    const memberBonus = calcBonus(matchedTier.memberBonus);
    const agentBonus = calcBonus(matchedTier.agentBonus);

    // Credit member
    if (memberBonus > 0) {
      await prisma.$transaction(async (tx) => {
        const updatedWallet = await tx.wallet.update({
          where: { userId: user.id },
          data: { balance: { increment: memberBonus } }
        });
        await tx.ledgerEntry.create({
          data: {
            walletId: updatedWallet.id,
            type: "DEPOSIT_BONUS",
            amount: memberBonus,
            balanceAfter: updatedWallet.balance,
            meta: { description: `${rechargeType} Bonus`, depositAmount }
          }
        });
      });
    }

    // Credit agent
    if (agentBonus > 0 && user.referredById) {
      const agentUser = await prisma.user.findUnique({ where: { id: user.referredById } });
      if (agentUser && !agentUser.isGuest) {
        await prisma.$transaction(async (tx) => {
          const updatedWallet = await tx.wallet.update({
            where: { userId: agentUser.id },
            data: { balance: { increment: agentBonus } }
          });
          await tx.ledgerEntry.create({
            data: {
              walletId: updatedWallet.id,
              type: "DEPOSIT_BONUS",
              amount: agentBonus,
              balanceAfter: updatedWallet.balance,
              meta: { description: `${rechargeType} Agent Bonus`, sourceUserId: user.id, depositAmount }
            }
          });
        });
      }
    }

  } catch (error) {
    console.error("Failed to distribute recharge bonus:", error);
  }
}

