import type { PdnResult } from "@/lib/types";

const WIDTH = 700;
const HEIGHT = 380;
const PAD = 55;

// Log-log PDN impedance-vs-frequency plot with a horizontal target
// impedance line - the standard way a power delivery network study is
// presented.
export default function ImpedanceChart({ result, targetMilliOhm }: { result: PdnResult; targetMilliOhm: number }) {
  const freqs = result.curve.map((p) => p.freqHz);
  const fMin = Math.min(...freqs);
  const fMax = Math.max(...freqs);
  const zValues = result.curve.map((p) => p.impedanceMilliOhm);
  const zMin = Math.min(...zValues, targetMilliOhm) * 0.7;
  const zMax = Math.max(...zValues, targetMilliOhm) * 1.3;

  const xScale = (f: number) => PAD + (Math.log10(f) - Math.log10(fMin)) / (Math.log10(fMax) - Math.log10(fMin)) * (WIDTH - 2 * PAD);
  const yScale = (z: number) => HEIGHT - PAD - (Math.log10(Math.max(z, 1e-6)) - Math.log10(zMin)) / (Math.log10(zMax) - Math.log10(zMin)) * (HEIGHT - 2 * PAD);

  const path = result.curve.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.freqHz)} ${yScale(p.impedanceMilliOhm)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto bg-slate-950 rounded border border-slate-800">
      <line x1={PAD} y1={PAD} x2={PAD} y2={HEIGHT - PAD} stroke="#334155" />
      <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="#334155" />
      <text x={WIDTH / 2} y={HEIGHT - 10} fontSize="11" fill="#94a3b8" textAnchor="middle">
        Frequency (Hz, log scale)
      </text>
      <text x={14} y={HEIGHT / 2} fontSize="11" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 14 ${HEIGHT / 2})`}>
        |Z| (mΩ)
      </text>

      <line
        x1={PAD}
        y1={yScale(targetMilliOhm)}
        x2={WIDTH - PAD}
        y2={yScale(targetMilliOhm)}
        stroke="#f59e0b"
        strokeDasharray="5 4"
      />
      <text x={WIDTH - PAD - 4} y={yScale(targetMilliOhm) - 6} fontSize="10" fill="#f59e0b" textAnchor="end">
        target {targetMilliOhm} mΩ
      </text>

      <path d={path} fill="none" stroke="#38bdf8" strokeWidth={2} />

      {result.curve
        .filter((p) => p.exceedsTarget)
        .map((p, i) => (
          <circle key={i} cx={xScale(p.freqHz)} cy={yScale(p.impedanceMilliOhm)} r={2} fill="#f43f5e" />
        ))}
    </svg>
  );
}
