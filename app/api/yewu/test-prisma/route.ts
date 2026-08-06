import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const wingo = await prisma.resultOverride.findMany({ take: 1 }).catch(e => ({ error: e.message, stack: e.stack }));
    const k3 = await prisma.k3ResultOverride.findMany({ take: 1 }).catch(e => ({ error: e.message, stack: e.stack }));
    const fived = await prisma.fiveDResultOverride.findMany({ take: 1 }).catch(e => ({ error: e.message, stack: e.stack }));
    
    // Custom replacer for BigInt
    const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json(serialize({ success: true, wingo, k3, fived }));
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
