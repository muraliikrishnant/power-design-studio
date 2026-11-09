import type { PdnInput } from "./types";

// A classic three-decade decoupling strategy for a point-of-load rail:
// bulk caps for low-frequency transient support, mid-value caps to bridge
// the gap, and small ceramics for high-frequency noise - plus a bit of
// plane/via inductance. Target impedance follows Z = ΔV_allowed / ΔI_transient.
export function defaultPdnInput(): PdnInput {
  return {
    planeInductanceNh: 0.5,
    targetImpedanceMilliOhm: 5,
    freqStartHz: 10_000,
    freqEndHz: 100_000_000,
    points: 120,
    capacitors: [
      { id: "BULK", label: "Bulk (100µF polymer)", capacitanceUf: 100, esrMilliOhm: 20, eslNh: 5, quantity: 2 },
      { id: "MID", label: "Mid (10µF ceramic)", capacitanceUf: 10, esrMilliOhm: 10, eslNh: 2, quantity: 4 },
      { id: "SMALL", label: "Small (0.1µF ceramic)", capacitanceUf: 0.1, esrMilliOhm: 5, eslNh: 0.5, quantity: 10 },
    ],
  };
}
