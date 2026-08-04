"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSetting(key: string, defaultValue: string = "{}") {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key }
    });
    
    if (!setting) return defaultValue;
    return setting.value;
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error);
    return defaultValue;
  }
}

export async function saveSetting(key: string, value: string) {
  try {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    
    // Revalidate paths that might use this setting
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to save setting ${key}:`, error);
    return { success: false, error: error.message };
  }
}
