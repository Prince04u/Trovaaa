import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getBonusSettings } from "@/lib/settings/bonuses";

/**
 * A referral only pays out once the referred user has BOTH had a deposit
 * approved AND placed a bet — this is the "qualified bet" rule from the
 * spec, tightened to deter people farming referral rewards with just the
 * free welcome coins. Called after either event, since either could be the
 * one that completes qualification. Idempotent via the Reward.key unique
 * constraint, so calling it twice for the same referral is harmless.
 */
export async function checkAndAwardReferralReward(referredUserId: string, depositAmount?: number, depositId?: string) {
  const referredUser = await prisma.user.findUnique({ where: { id: referredUserId } });
  if (!referredUser?.referredById) return;

  // 1. Process Automatic Deposit Brackets Reward (Tier 1 Only) - Removed and moved to distributeRechargeBonus


  // 2. Original Bet Qualification Reward
  const key = `referral:${referredUserId}`;
  const existingReward = await prisma.reward.findFirst({
    where: { key },
    select: { id: true }
  });
  if (existingReward) return;

  const [approvedDepositCount, wingoBetCount, k3BetCount, fiveDBetCount] = await Promise.all([
    prisma.depositRequest.count({ where: { userId: referredUserId, status: "APPROVED" } }),
    prisma.wingoBet.count({ where: { userId: referredUserId } }),
    prisma.k3Bet.count({ where: { userId: referredUserId } }),
    prisma.fiveDBet.count({ where: { userId: referredUserId } }),
  ]);
  const betCount = wingoBetCount + k3BetCount + fiveDBetCount;

  if (approvedDepositCount === 0 || betCount === 0) return;

  const { referralReward } = await getBonusSettings();

  try {
    await prisma.reward.create({
      data: {
        userId: referredUser.referredById,
        type: "REFERRAL",
        key,
        amount: referralReward,
        meta: { referredUserId, referredDisplayName: referredUser.displayName },
      },
    });

    await createNotification(
      referredUser.referredById,
      "REWARD_AVAILABLE",
      "Referral reward available",
      `${referredUser.displayName} is now a qualified referral. Claim your reward in the Rewards Center.`,
      { referredUserId }
    );
  } catch (err: unknown) {
    const isUniqueViolation =
      typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
    if (isUniqueViolation) return; // already awarded
    throw err;
  }
}
