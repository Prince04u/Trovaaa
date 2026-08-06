import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: "Please log in first" }, { status: 401 });
    }

    const envelopes = await prisma.redEnvelope.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: envelopes
    });
  } catch (error: any) {
    console.error("GET wallet/red-envelope/my error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
