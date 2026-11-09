"use client";

import { useEffect, useState } from "react";
import ImpedanceChart from "@/components/ImpedanceChart";
import { Badge, Button, Card, inputClass } from "@/components/ui";
import { analyzePdn } from "@/lib/pdn";
import { defaultPdnInput } from "@/lib/pdn-data";
import { STORAGE_KEYS, loadJson, saveJson } from "@/lib/storage";
import type { PdnInput, PdnResult } from "@/lib/types";

export default function PdnPage() {
  const [input, setInput] = useState<PdnInput>(defaultPdnInput());
  const [result, setResult] = useState<PdnResult | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setInput(loadJson(STORAGE_KEYS.pdn + ".input", defaultPdnInput())));
  }, []);

  function updateCap(id: string, field: "capacitanceUf" | "esrMilliOhm" | "eslNh" | "quantity", value: number) {
    setInput((prev) => ({
      ...prev,
      capacitors: prev.capacitors.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  }

  function run() {
    const r = analyzePdn(input);
    setResult(r);
    saveJson(STORAGE_KEYS.pdn + ".input", input);
    saveJson(STORAGE_KEYS.pdn, { input, result: r });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-semibold">Power Delivery Network (PDN) Impedance Analysis</h1>
        <Button onClick={run}>Run Sweep</Button>
      </div>

      <Card title="Method, in plain terms">
        <p className="text-sm text-slate-400">
          Every decoupling capacitor looks inductive above its self-resonant frequency and capacitive below
          it. Combining several capacitor values — bulk, mid, and small — covers a wide frequency range, but
          gaps between their resonances can create &quot;anti-resonance&quot; peaks where the PDN impedance
          rises instead of falling. This sweep checks the parallel combination of your decoupling bank plus
          board/plane inductance against a target impedance across frequency.
        </p>
      </Card>

      <Card title="Decoupling capacitor bank">
        <table className="w-full text-sm">
          <thead className="text-slate-500 text-left">
            <tr>
              <th>Group</th>
              <th>C (µF)</th>
              <th>ESR (mΩ)</th>
              <th>ESL (nH)</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {input.capacitors.map((c) => (
              <tr key={c.id} className="border-t border-slate-800">
                <td className="py-1">{c.label}</td>
                <td>
                  <input type="number" className={`${inputClass} w-24`} value={c.capacitanceUf} onChange={(e) => updateCap(c.id, "capacitanceUf", Number(e.target.value))} />
                </td>
                <td>
                  <input type="number" className={`${inputClass} w-20`} value={c.esrMilliOhm} onChange={(e) => updateCap(c.id, "esrMilliOhm", Number(e.target.value))} />
                </td>
                <td>
                  <input type="number" className={`${inputClass} w-20`} value={c.eslNh} onChange={(e) => updateCap(c.id, "eslNh", Number(e.target.value))} />
                </td>
                <td>
                  <input type="number" className={`${inputClass} w-16`} value={c.quantity} onChange={(e) => updateCap(c.id, "quantity", Number(e.target.value))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400 text-xs">Plane/via inductance (nH)</span>
            <input type="number" className={inputClass} value={input.planeInductanceNh} onChange={(e) => setInput({ ...input, planeInductanceNh: Number(e.target.value) })} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400 text-xs">Target impedance (mΩ)</span>
            <input type="number" className={inputClass} value={input.targetImpedanceMilliOhm} onChange={(e) => setInput({ ...input, targetImpedanceMilliOhm: Number(e.target.value) })} />
          </label>
        </div>
      </Card>

      {result && (
        <>
          <Card title="Impedance vs frequency">
            <ImpedanceChart result={result} targetMilliOhm={input.targetImpedanceMilliOhm} />
          </Card>

          <Card title={`Overall: ${result.anyExceedsTarget ? "target exceeded" : "within target"}`}>
            <p className="text-sm text-slate-400 mb-2">
              Worst case <strong>{result.worstCaseMilliOhm} mΩ</strong> at{" "}
              <strong>{(result.worstCaseFreqHz / 1e6).toFixed(2)} MHz</strong>.
            </p>
            {result.violatingBands.length > 0 && (
              <div className="flex flex-col gap-1 text-sm">
                {result.violatingBands.map((b, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Badge tone="bad">exceeds target</Badge>
                    <span>
                      {(b.fromHz / 1000).toFixed(0)} kHz – {(b.toHz / 1e6).toFixed(2)} MHz
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!result.anyExceedsTarget && <Badge tone="good">no violations across the sweep</Badge>}
          </Card>
        </>
      )}
    </div>
  );
}
