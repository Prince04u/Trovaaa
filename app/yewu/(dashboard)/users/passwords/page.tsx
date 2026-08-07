import { requirePermission, hasPermission } from "@/lib/admin/permissions";
import { searchUsers } from "@/lib/admin/users";
import { format } from "date-fns";
import Link from "next/link";

export default async function UserPasswordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const staff = await requirePermission("users.view");
  const canManage = await hasPermission(staff, "users.manage");
  const { q = "" } = await searchParams;

  const users = await searchUsers(q);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">User Passwords Database</h1>
        <p className="text-sm text-muted mt-1">
          Search and view plain-text (decrypted) passwords for users. Note that passwords are saved when users register or log in.
        </p>
      </div>

      {/* Search form */}
      <form className="card-surface rounded-2xl p-4 flex flex-wrap items-end gap-3" method="GET">
        <label className="flex flex-col gap-1.5 text-sm flex-1 min-w-48">
          <span className="text-muted text-xs">Search by Phone or UID</span>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Phone number, UID, or name…"
            className="rounded-lg bg-surface-2 border border-border px-3.5 py-2.5 outline-none focus:border-gold/60 text-sm text-white"
          />
        </label>
        <button type="submit" className="rounded-xl bg-gold-gradient text-white font-semibold px-6 py-2.5 text-sm cursor-pointer hover:opacity-90">
          Search
        </button>
      </form>

      {/* Password List */}
      <section className="card-surface rounded-2xl p-6">
        {users.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center bg-surface-2/20 rounded-xl border border-dashed border-border/60">
            No users match. Try searching another ID number or phone number.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">UID</th>
                  <th className="py-3 px-4">Display Name</th>
                  <th className="py-3 px-4">Phone / Mobile</th>
                  <th className="py-3 px-4">Plain Text Password</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-surface-2/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold font-mono text-gold">{u.uid}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{u.displayName}</td>
                    <td className="py-3.5 px-4 font-mono select-all text-muted">{u.phone}</td>
                    <td className="py-3.5 px-4">
                      {u.plainPassword ? (
                        <code className="text-sm font-semibold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 select-all">
                          {u.plainPassword}
                        </code>
                      ) : (
                        <span className="text-[10px] font-medium text-muted bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-amber-500 uppercase">
                          Not captured yet
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted">{format(u.createdAt, "d MMM yyyy")}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/yewu/users/${u.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 inline-block transition-colors"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
