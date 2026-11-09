import { C, abs, add, div } from "./complex";
import type { PdnFrequencyPoint, PdnInput, PdnResult } from "./types";

/**
 * Power delivery network (PDN) impedance analysis: each capacitor group is
 * modeled as a series R-L-C branch (ESR, ESL, and capacitance), identical
 * units within a group combine as a parallel admittance, groups combine in
 * parallel with each other, and the board/plane inductance is added in
 * series with the whole bank. Sweeping frequency on a log scale reveals the
 * classic PDN "anti-resonance" peaks between capacitor decades, which is
 * exactly what this kind of study is looking for.
 */
export function analyzePdn(input: PdnInput): PdnResult {
  const freqs = logSweep(input.freqStartHz, input.freqEndHz, input.points);
  const curve: PdnFrequencyPoint[] = freqs.map((f) => {
    const omega = 2 * Math.PI * f;

    let yTotal = C(0, 0);
    for (const cap of input.capacitors) {
      if (cap.quantity <= 0) continue;
      const esrOhm = cap.esrMilliOhm / 1000;
      const eslH = cap.eslNh * 1e-9;
      const capF = cap.capacitanceUf * 1e-6;
      const zCapSingle = C(esrOhm, omega * eslH - 1 / (omega * capF));
      const zGroup = C(zCapSingle.re / cap.quantity, zCapSingle.im / cap.quantity);
      yTotal = add(yTotal, div(C(1, 0), zGroup));
    }

    const zBank = abs(yTotal) > 0 ? div(C(1, 0), yTotal) : C(1e9, 0);
    const planeReactance = omega * (input.planeInductanceNh * 1e-9);
    const zTotal = C(zBank.re, zBank.im + planeReactance);
    const impedanceMilliOhm = abs(zTotal) * 1000;

    return {
      freqHz: f,
      impedanceMilliOhm: round(impedanceMilliOhm),
      exceedsTarget: impedanceMilliOhm > input.targetImpedanceMilliOhm,
    };
  });

  let worstCaseMilliOhm = 0;
  let worstCaseFreqHz = 0;
  for (const p of curve) {
    if (p.impedanceMilliOhm > worstCaseMilliOhm) {
      worstCaseMilliOhm = p.impedanceMilliOhm;
      worstCaseFreqHz = p.freqHz;
    }
  }

  const violatingBands: { fromHz: number; toHz: number }[] = [];
  let bandStart: number | null = null;
  for (let i = 0; i < curve.length; i++) {
    if (curve[i].exceedsTarget && bandStart === null) {
      bandStart = curve[i].freqHz;
    } else if (!curve[i].exceedsTarget && bandStart !== null) {
      violatingBands.push({ fromHz: bandStart, toHz: curve[i - 1].freqHz });
      bandStart = null;
    }
  }
  if (bandStart !== null) violatingBands.push({ fromHz: bandStart, toHz: curve[curve.length - 1].freqHz });

  return {
    curve,
    worstCaseMilliOhm: round(worstCaseMilliOhm),
    worstCaseFreqHz,
    anyExceedsTarget: violatingBands.length > 0,
    violatingBands,
  };
}

function logSweep(start: number, end: number, points: number): number[] {
  const logStart = Math.log10(start);
  const logEnd = Math.log10(end);
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    out.push(10 ** (logStart + ((logEnd - logStart) * i) / (points - 1)));
  }
  return out;
}

function round(n: number, decimals = 3): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
