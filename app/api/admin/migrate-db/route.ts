import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  try {
    const output = execSync("npx prisma db push --accept-data-loss", {
      env: { ...process.env, DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL }
    }).toString();
    return NextResponse.json({ success: true, output });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message, 
      stdout: err.stdout?.toString(), 
      stderr: err.stderr?.toString() 
    });
  }
}
