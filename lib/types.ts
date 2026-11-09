// ---------- Buck Converter Reference Design ----------

export interface BuckDesignInput {
  vinV: number;
  voutV: number;
  ioutMaxA: number;
  fswHz: number;
  inductorRippleRatio: number; // fraction of Iout, e.g. 0.3 = 30%
  outputRippleTargetMv: number;
  outputCapEsrMilliOhm: number;
  inductorDcrMilliOhm: number;
  rdsOnHighMilliOhm: number;
  rdsOnLowMilliOhm: number;
  switchingTransitionNs: number; // combined rise+fall time, for switching loss estimate
}

export interface BuckDesignResult {
  dutyCycle: number;
  inductanceUh: number;
  inductorRippleA: number;
  peakInductorCurrentA: number;
  valleyInductorCurrentA: number;
  esrRippleMv: number;
  remainingRippleBudgetMv: number;
  requiredOutputCapUf: number | null; // null if ESR alone exceeds the ripple target
  conductionLossHighW: number;
  conductionLossLowW: number;
  inductorLossW: number;
  switchingLossW: number;
  totalLossW: number;
  outputPowerW: number;
  efficiencyPercent: number;
}

// ---------- Power Delivery Network (PDN) Impedance Analysis ----------

export interface CapacitorGroup {
  id: string;
  label: string;
  capacitanceUf: number;
  esrMilliOhm: number;
  eslNh: number;
  quantity: number;
}

export interface PdnInput {
  capacitors: CapacitorGroup[];
  planeInductanceNh: number;
  targetImpedanceMilliOhm: number;
  freqStartHz: number;
  freqEndHz: number;
  points: number;
}

export interface PdnFrequencyPoint {
  freqHz: number;
  impedanceMilliOhm: number;
  exceedsTarget: boolean;
}

export interface PdnResult {
  curve: PdnFrequencyPoint[];
  worstCaseMilliOhm: number;
  worstCaseFreqHz: number;
  anyExceedsTarget: boolean;
  violatingBands: { fromHz: number; toHz: number }[];
}
