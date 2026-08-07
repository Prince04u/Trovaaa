import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const all = await prisma.depositChannel.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" }
      ],
    });

    const fallbackSetting = await prisma.setting.findUnique({
      where: { key: "depositChannelsFallbackMessage" },
    });

    const disabledMessage = fallbackSetting?.value || "Deposit channels are temporarily unavailable. Please try again later or contact support.";

    const channels = all.filter((c) => c.kind === "CHANNEL");
    const methods = all.filter((c) => c.kind === "METHOD");

    let formattedMethods = [];
    if (methods.length > 0) {
      formattedMethods = methods.map((m) => ({
        id: m.channelKey,
        label: m.label,
        enabled: m.active,
        channelId: m.detail || m.iconKey || "", // linked channelKey (uses detail first, falls back to iconKey)
        badge: m.bonusBadge || undefined,
        disabledMessage: m.disabledMessage || undefined,
        icon: m.iconKey || (m.channelKey?.toLowerCase()?.includes("usdt") ? "usdt" : "upi"),
      }));
    } else {
      formattedMethods = channels.map((c) => {
        const typeLower = String(c.channelType || "upi").toLowerCase();
        const isCrypto = typeLower.includes("crypto") || typeLower.includes("usdt");
        return {
          id: `${c.channelKey}_method`,
          label: c.label,
          enabled: c.active,
          channelId: c.channelKey,
          icon: isCrypto ? "usdt" : "upi",
          disabledMessage: c.disabledMessage || undefined,
        };
      });
    }

    const [maintenanceModeSetting, maintenanceMessageSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "depositMaintenanceMode" } }),
      prisma.setting.findUnique({ where: { key: "depositMaintenanceMessage" } }),
    ]);

    const isMaintenance = maintenanceModeSetting?.value === "true";
    const maintenanceMessage = maintenanceMessageSetting?.value || "Deposit channels are currently in maintenance. Please try again later.";

    // Format channels to match what the frontend expects
    const formattedChannels = channels.map((c) => {
      const typeLower = String(c.channelType || "upi").toLowerCase();
      const isCrypto = typeLower.includes("crypto") || typeLower.includes("usdt");
      
      return {
        id: c.channelKey,
        label: c.label,
        enabled: c.active,
        min: c.minAmount,
        max: c.maxAmount,
        bonus: c.bonusBadge || "",
        range: `${c.minAmount} - ${c.maxAmount}`,
        type: isCrypto ? "crypto" : "upi",
        usdtRate: isCrypto ? 102 : undefined, // fallback exchange rate
        disabledMessage: c.disabledMessage || undefined,
        icon: c.iconKey || (isCrypto ? "usdt" : "upi"),
      };
    });

    const customChannels = [
      { id: "sunpay_winpay", label: "WinPay", enabled: true, min: 100, max: 50000, type: "upi", icon: "upi", range: "100 - 50000", usdtRate: undefined },
      { id: "sunpay_3qpay", label: "3QPay", enabled: true, min: 100, max: 50000, type: "upi", icon: "upi", range: "100 - 50000", usdtRate: undefined },
      { id: "nowpayments_trc20", label: "Tron pay(trc20)", enabled: true, min: 1200, max: 100000, type: "crypto", icon: "usdt", range: "1200 - 100000", usdtRate: 95 },
      { id: "nowpayments_bep20", label: "Binance pay (bep20)", enabled: true, min: 1200, max: 100000, type: "crypto", icon: "usdt", range: "1200 - 100000", usdtRate: 95 }
    ];

    const customMethods = customChannels.map(c => ({
      id: c.id,
      label: c.label,
      enabled: true,
      channelId: c.id,
      icon: c.icon
    }));

    return NextResponse.json({
      success: true,
      data: {
        maintenance: isMaintenance,
        maintenanceMessage,
        disabledMessage,
        methods: customMethods,
        channels: customChannels,
      },
    });
  } catch (error: any) {
    console.error("GET platform/deposit-options API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
