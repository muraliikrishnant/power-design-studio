import Link from "next/link";
import { Card } from "@/components/ui";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Power Design Studio</h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          A small set of tools for the analog power applications engineering workflow: design a
          <strong> buck converter reference circuit</strong> from first principles, run a
          <strong> power delivery network (PDN) impedance analysis</strong> on the decoupling strategy,
          generate a draft <strong>application note</strong> from the results, and keep a
          <strong> bench test log</strong> of oscilloscope/load/power-supply measurements. Every calculation
          runs in the browser — no backend, no account, nothing to provision.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Buck Converter Design">
          <p className="text-sm text-slate-400 mb-2">
            Size the inductor and output capacitor from your ripple targets, and get an efficiency estimate
            from conduction, inductor DCR, and switching losses.
          </p>
          <Link className="text-sky-400 hover:underline text-sm" href="/buck">
            Open the design calculator →
          </Link>
        </Card>
        <Card title="PDN Impedance Analysis">
          <p className="text-sm text-slate-400 mb-2">
            Sweep a decoupling capacitor bank against a target impedance and spot anti-resonance peaks
            between capacitor decades.
          </p>
          <Link className="text-sky-400 hover:underline text-sm" href="/pdn">
            Open the PDN analyzer →
          </Link>
        </Card>
        <Card title="Application Note">
          <p className="text-sm text-slate-400 mb-2">
            Turn your latest Buck and PDN results into a draft write-up — design equations, loss table, and
            recommendations — ready to hand to a customer or publish.
          </p>
          <Link className="text-sky-400 hover:underline text-sm" href="/appnote">
            Generate an application note →
          </Link>
        </Card>
        <Card title="Bench Test Log">
          <p className="text-sm text-slate-400 mb-2">
            Record oscilloscope, power supply, load, and network analyzer readings while validating a
            design on the bench.
          </p>
          <Link className="text-sky-400 hover:underline text-sm" href="/bench">
            Open the bench log →
          </Link>
        </Card>
      </div>
    </div>
  );
}
