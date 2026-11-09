"use client";

import { useEffect, useState } from "react";
import { Button, Card, inputClass } from "@/components/ui";
import { STORAGE_KEYS, loadJson, saveJson } from "@/lib/storage";

type Instrument = "Oscilloscope" | "Power Supply" | "Electronic Load" | "Network Analyzer" | "Multimeter";
type TestType = "Output Ripple" | "Efficiency Point" | "Load Transient" | "Line Transient" | "PDN Impedance" | "Other";

interface BenchEntry {
  id: string;
  testType: TestType;
  instrument: Instrument;
  value: string;
  notes: string;
  createdAt: string;
}

const TEST_TYPES: TestType[] = ["Output Ripple", "Efficiency Point", "Load Transient", "Line Transient", "PDN Impedance", "Other"];
const INSTRUMENTS: Instrument[] = ["Oscilloscope", "Power Supply", "Electronic Load", "Network Analyzer", "Multimeter"];

export default function BenchPage() {
  const [entries, setEntries] = useState<BenchEntry[]>([]);
  const [testType, setTestType] = useState<TestType>("Output Ripple");
  const [instrument, setInstrument] = useState<Instrument>("Oscilloscope");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => setEntries(loadJson<BenchEntry[]>(STORAGE_KEYS.bench, [])));
  }, []);

  function persist(next: BenchEntry[]) {
    setEntries(next);
    saveJson(STORAGE_KEYS.bench, next);
  }

  function add() {
    if (!value.trim()) return;
    const entry: BenchEntry = {
      id: crypto.randomUUID(),
      testType,
      instrument,
      value: value.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    persist([entry, ...entries]);
    setValue("");
    setNotes("");
  }

  function remove(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Bench Test Log</h1>
      <p className="text-sm text-slate-400 max-w-3xl">
        A record of bench measurements — the kind of log kept while validating a reference design with an
        oscilloscope, power supply, electronic load, or network analyzer. Stored in this browser only.
      </p>

      <Card title="Log a measurement">
        <div className="grid gap-2 md:grid-cols-2">
          <select className={inputClass} value={testType} onChange={(e) => setTestType(e.target.value as TestType)}>
            {TEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select className={inputClass} value={instrument} onChange={(e) => setInstrument(e.target.value as Instrument)}>
            {INSTRUMENTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <input className={inputClass} placeholder="Measured value (e.g. '28mV pk-pk', '94.2%')" value={value} onChange={(e) => setValue(e.target.value)} />
          <input className={inputClass} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="mt-2">
          <Button onClick={add} disabled={!value.trim()}>
            Log measurement
          </Button>
        </div>
      </Card>

      <Card title="Measurements">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">No measurements logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-left">
              <tr>
                <th>When</th>
                <th>Test</th>
                <th>Instrument</th>
                <th>Value</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-800 align-top">
                  <td className="py-1 whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                  <td>{e.testType}</td>
                  <td>{e.instrument}</td>
                  <td>{e.value}</td>
                  <td className="text-slate-400">{e.notes}</td>
                  <td>
                    <Button variant="secondary" onClick={() => remove(e.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
