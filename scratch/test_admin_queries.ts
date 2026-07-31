import "dotenv/config";
import { getAdminDashboardStats } from "../lib/admin/queries";

async function main() {
  console.log("Testing getAdminDashboardStats...");
  try {
    const stats = await getAdminDashboardStats();
    console.log("Stats retrieved successfully:", stats);
  } catch (err) {
    console.error("Error in getAdminDashboardStats:", err);
  }
}

main()
  .catch((e) => console.error(e));
