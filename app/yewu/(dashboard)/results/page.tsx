import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getResultControlData } from "@/lib/admin/queries";
import { requirePermission, hasPermission } from "@/lib/admin/permissions";
import { ResultModeForm, OverrideForm, CancelOverrideButton, WinningPercentageForm, BrahmastraProfitsForm } from "./ResultControlForms";
import { LiveControl } from "./LiveControl";
import { AdminQueryProvider } from "./QueryProvider";
import { PeriodCalculator } from "./PeriodCalculator";
export default async function AdminResultsPage() {
  const staff = await requirePermission("results.view");
  const canMode = await hasPermission(staff, "results.mode");
  const canOverride = await hasPermission(staff, "results.override");
  
  // We explicitly fetch strings from getResultControlData so BigInt serialization crash won't happen
  const { resultMode, winningPercentage, brahmastraProfits, overrides } = await getResultControlData();

  return (
    <AdminQueryProvider>
      <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Parity Result Control</h1>
        <p className="text-sm text-muted mt-1">Live periods, payout exposure, and manual results for Parity</p>
      </div>

      <LiveControl canOverride={canOverride} />

      {canMode && (
        <section className="grid md:grid-cols-3 gap-6">
          <div className="card-surface rounded-2xl p-6 flex flex-col gap-2">
            <h2 className="font-semibold text-lg">Default result mode</h2>
            <p className="text-xs text-muted mb-2">Used if no pre-generated schedule is active.</p>
            <ResultModeForm currentMode={resultMode} />
          </div>
          <div className="card-surface rounded-2xl p-6 flex flex-col gap-2">
            <h2 className="font-semibold text-lg">Winning percentage</h2>
            <p className="text-xs text-muted mb-2">Controls player win probability for random rounds.</p>
            <WinningPercentageForm currentPercentage={winningPercentage} />
          </div>
          <div className="card-surface rounded-2xl p-6 border border-red-500/20 bg-red-950/5 flex flex-col gap-2">
            <h2 className="font-semibold text-lg text-red-500 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Brahmastra Mode
            </h2>
            <p className="text-xs text-red-400/80 mb-2">Forces results that guarantee maximum platform profit.</p>
            <BrahmastraProfitsForm enabled={brahmastraProfits} />
          </div>
        </section>
      )}

      {canOverride && (
        <section className="grid lg:grid-cols-1 gap-4">
          <div className="card-surface rounded-2xl p-6">
            <h2 className="font-semibold mb-1">Parity — manual override</h2>
            <p className="text-xs text-muted mb-4">Set the result for a specific future round number.</p>
            <OverrideForm />
          </div>
        </section>
      )}

      <section className="grid lg:grid-cols-1 gap-4">
        <div className="card-surface rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Parity override history</h2>
          {overrides.length === 0 ? (
            <p className="text-sm text-muted">No overrides yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border text-sm">
              {overrides.map((o) => (
                <div key={o.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p>
                      {o.mode} · #{o.roundNumber} → <span className="text-gold font-semibold">{o.number}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {o.createdBy.displayName} · {format(new Date(o.createdAt), "d MMM, h:mm a")}
                    </p>
                  </div>
                  {canOverride && <CancelOverrideButton id={o.id} type="wingo" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <PeriodCalculator />
      </section>
      </div>
    </AdminQueryProvider>
  );
}
