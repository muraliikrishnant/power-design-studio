"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { generateApplicationNote } from "@/lib/appnote";
import { STORAGE_KEYS, loadJson } from "@/lib/storage";
import type { BuckDesignInput, BuckDesignResult, PdnInput, PdnResult } from "@/lib/types";

export default function AppNotePage() {
  const [buck, setBuck] = useState<{ input: BuckDesignInput; result: BuckDesignResult } | null>(null);
  const [pdn, setPdn] = useState<{ input: PdnInput; result: PdnResult } | null>(null);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    Promise.resolve().then(() => {
      setBuck(loadJson(STORAGE_KEYS.buck, null));
      setPdn(loadJson(STORAGE_KEYS.pdn, null));
    });
  }, []);

  function generate() {
    setNote(generateApplicationNote(buck, pdn));
  }

  function download() {
    const blob = new Blob([note], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "application-note.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-semibold">Application Note Generator</h1>
        <div className="flex gap-2">
          <Button onClick={generate}>Generate from latest results</Button>
          <Button variant="secondary" onClick={download} disabled={!note}>
            Download .md
          </Button>
        </div>
      </div>

      <Card title="Source data">
        <p className="text-sm text-slate-400">
          Buck Converter result: {buck ? <span className="text-emerald-400">loaded</span> : <span className="text-rose-400">none yet — run the Buck Converter Design page first</span>}
          <br />
          PDN result: {pdn ? <span className="text-emerald-400">loaded</span> : <span className="text-rose-400">none yet — run the PDN Analysis page first</span>}
        </p>
      </Card>

      {note && (
        <Card title="Draft application note">
          <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono">{note}</pre>
        </Card>
      )}
    </div>
  );
}
