"use client";

import { useEffect, useState } from "react";
import { designBuckConverter } from "@/lib/buck";
import { defaultBuckInput } from "@/lib/buck-data";
import { Button, Card, Field, Stat, inputClass } from "@/components/ui";
import { STORAGE_KEYS, loadJson, saveJson } from "@/lib/storage";
import type { BuckDesignInput, BuckDesignResult } from "@/lib/types";

export default function BuckPage() {
  const [input, setInput] = useState<BuckDesignInput>(defaultBuckInput());
  const [result, setResult] = useState<BuckDesignResult | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setInput(loadJson(STORAGE_KEYS.buck + ".input", defaultBuckInput())));
  }, []);

  function set<K extends keyof BuckDesignInput>(key: K, value: BuckDesignInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function run() {
    const r = designBuckConverter(input);
    setResult(r);
    saveJson(STORAGE_KEYS.buck + ".input", input);
    saveJson(STORAGE_KEYS.buck, { input, result: r });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-semibold">Buck Converter Reference Design</h1>
        <Button onClick={run}>Calculate</Button>
      </div>

      <Card title="Method, in plain terms">
        <p className="text-sm text-slate-400">
          A buck converter switches between Vin and ground across an inductor, averaging to Vout. The
          inductor is sized from how much current ripple you&apos;ll tolerate; the output capacitor from how
          much voltage ripple you&apos;ll tolerate. Efficiency is lost to conduction (I²R in the switches and
          inductor) and switching transitions — this estimate adds those up against the ideal output power.
        </p>
      </Card>

      <Card title="Inputs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Vin (V)">
            <input type="number" className={inputClass} value={input.vinV} onChange={(e) => set("vinV", Number(e.target.value))} />
          </Field>
          <Field label="Vout (V)">
            <input type="number" className={inputClass} value={input.voutV} onChange={(e) => set("voutV", Number(e.target.value))} />
          </Field>
          <Field label="Iout max (A)">
            <input type="number" className={inputClass} value={input.ioutMaxA} onChange={(e) => set("ioutMaxA", Number(e.target.value))} />
          </Field>
          <Field label="Switching freq (Hz)">
            <input type="number" className={inputClass} value={input.fswHz} onChange={(e) => set("fswHz", Number(e.target.value))} />
          </Field>
          <Field label="Inductor ripple ratio (0-1)">
            <input type="number" step="0.05" className={inputClass} value={input.inductorRippleRatio} onChange={(e) => set("inductorRippleRatio", Number(e.target.value))} />
          </Field>
          <Field label="Output ripple target (mV)">
            <input type="number" className={inputClass} value={input.outputRippleTargetMv} onChange={(e) => set("outputRippleTargetMv", Number(e.target.value))} />
          </Field>
          <Field label="Output cap ESR (mΩ)">
            <input type="number" className={inputClass} value={input.outputCapEsrMilliOhm} onChange={(e) => set("outputCapEsrMilliOhm", Number(e.target.value))} />
          </Field>
          <Field label="Inductor DCR (mΩ)">
            <input type="number" className={inputClass} value={input.inductorDcrMilliOhm} onChange={(e) => set("inductorDcrMilliOhm", Number(e.target.value))} />
          </Field>
          <Field label="High-side Rds(on) (mΩ)">
            <input type="number" className={inputClass} value={input.rdsOnHighMilliOhm} onChange={(e) => set("rdsOnHighMilliOhm", Number(e.target.value))} />
          </Field>
          <Field label="Low-side Rds(on) (mΩ)">
            <input type="number" className={inputClass} value={input.rdsOnLowMilliOhm} onChange={(e) => set("rdsOnLowMilliOhm", Number(e.target.value))} />
          </Field>
          <Field label="Switching transition (ns)">
            <input type="number" className={inputClass} value={input.switchingTransitionNs} onChange={(e) => set("switchingTransitionNs", Number(e.target.value))} />
          </Field>
        </div>
      </Card>

      {result && (
        <>
          <Card title="Component selection">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Duty cycle" value={result.dutyCycle.toString()} />
              <Stat label="Inductance" value={`${result.inductanceUh} µH`} />
              <Stat label="Peak / valley IL" value={`${result.peakInductorCurrentA} / ${result.valleyInductorCurrentA} A`} />
              <Stat
                label="Required Cout"
                value={result.requiredOutputCapUf != null ? `${result.requiredOutputCapUf} µF` : "ESR exceeds target"}
                tone={result.requiredOutputCapUf != null ? "good" : "bad"}
              />
            </div>
          </Card>

          <Card title="Loss breakdown & efficiency">
            <table className="w-full text-sm">
              <thead className="text-slate-500 text-left">
                <tr>
                  <th>Term</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800">
                  <td className="py-1">High-side conduction</td>
                  <td>{result.conductionLossHighW} W</td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="py-1">Low-side conduction</td>
                  <td>{result.conductionLossLowW} W</td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="py-1">Inductor DCR</td>
                  <td>{result.inductorLossW} W</td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="py-1">Switching</td>
                  <td>{result.switchingLossW} W</td>
                </tr>
                <tr className="border-t border-slate-800 font-medium">
                  <td className="py-1">Total loss</td>
                  <td>{result.totalLossW} W</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3">
              <Stat label="Estimated efficiency" value={`${result.efficiencyPercent}%`} tone={result.efficiencyPercent > 90 ? "good" : "bad"} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
