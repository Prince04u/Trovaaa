export function getAdminPathPrefix(): string {
  const envPath = process.env.ADMIN_PANEL_PATH || "/yewu";
  return envPath.startsWith("/") ? envPath : `/${envPath}`;
}
