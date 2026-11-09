import type { BuckDesignInput } from "./types";

// A typical notebook/server point-of-load rail: 12V bus stepped down to
// 3.3V at 5A, 500kHz switching - representative of the kind of reference
// circuit an analog power IC applications engineer would spec.
export function defaultBuckInput(): BuckDesignInput {
  return {
    vinV: 12,
    voutV: 3.3,
    ioutMaxA: 5,
    fswHz: 500_000,
    inductorRippleRatio: 0.3,
    outputRippleTargetMv: 30,
    outputCapEsrMilliOhm: 10,
    inductorDcrMilliOhm: 10,
    rdsOnHighMilliOhm: 15,
    rdsOnLowMilliOhm: 8,
    switchingTransitionNs: 5,
  };
}
