import type { BuckDesignInput, BuckDesignResult } from "./types";

/**
 * Buck (step-down) converter reference design, following the standard
 * design procedure used in switching-regulator datasheets and application
 * notes: pick the inductor from the allowed ripple current, size the
 * output capacitor from the allowed voltage ripple, then estimate
 * efficiency from conduction, inductor DCR, and switching losses.
 */
export function designBuckConverter(input: BuckDesignInput): BuckDesignResult {
  const { vinV, voutV, ioutMaxA, fswHz, inductorRippleRatio, outputRippleTargetMv, outputCapEsrMilliOhm } = input;

  const dutyCycle = voutV / vinV;
  const inductorRippleA = inductorRippleRatio * ioutMaxA;

  // During the on-time (D/fsw), the inductor sees (Vin - Vout) across it:
  // ΔIL = (Vin - Vout) * D / (fsw * L)  =>  L = (Vin - Vout) * D / (fsw * ΔIL)
  const inductanceH = ((vinV - voutV) * dutyCycle) / (fswHz * inductorRippleA);
  const inductanceUh = inductanceH * 1e6;

  const peakInductorCurrentA = ioutMaxA + inductorRippleA / 2;
  const valleyInductorCurrentA = ioutMaxA - inductorRippleA / 2;

  // Output ripple has two contributors: the capacitor's ESR (ΔI * ESR) and
  // the capacitive component (ΔI / (8 * fsw * C)). Worst case, they add.
  const esrRippleMv = inductorRippleA * (outputCapEsrMilliOhm / 1000) * 1000;
  const remainingRippleBudgetMv = outputRippleTargetMv - esrRippleMv;
  const requiredOutputCapUf =
    remainingRippleBudgetMv > 0
      ? (inductorRippleA / (8 * fswHz * (remainingRippleBudgetMv / 1000))) * 1e6
      : null;

  // Loss estimate (simplified, single-phase synchronous buck):
  const rdsHighOhm = input.rdsOnHighMilliOhm / 1000;
  const rdsLowOhm = input.rdsOnLowMilliOhm / 1000;
  const dcrOhm = input.inductorDcrMilliOhm / 1000;

  const conductionLossHighW = ioutMaxA ** 2 * rdsHighOhm * dutyCycle;
  const conductionLossLowW = ioutMaxA ** 2 * rdsLowOhm * (1 - dutyCycle);
  const inductorLossW = ioutMaxA ** 2 * dcrOhm;
  // Switching loss: energy lost during each on/off transition, both edges,
  // once per switching cycle: Psw ≈ 0.5 * Vin * Iout * (tr + tf) * fsw
  const switchingLossW = 0.5 * vinV * ioutMaxA * (input.switchingTransitionNs * 1e-9) * fswHz;

  const totalLossW = conductionLossHighW + conductionLossLowW + inductorLossW + switchingLossW;
  const outputPowerW = voutV * ioutMaxA;
  const efficiencyPercent = (outputPowerW / (outputPowerW + totalLossW)) * 100;

  return {
    dutyCycle: round(dutyCycle, 4),
    inductanceUh: round(inductanceUh, 3),
    inductorRippleA: round(inductorRippleA, 4),
    peakInductorCurrentA: round(peakInductorCurrentA, 3),
    valleyInductorCurrentA: round(valleyInductorCurrentA, 3),
    esrRippleMv: round(esrRippleMv, 3),
    remainingRippleBudgetMv: round(remainingRippleBudgetMv, 3),
    requiredOutputCapUf: requiredOutputCapUf != null ? round(requiredOutputCapUf, 2) : null,
    conductionLossHighW: round(conductionLossHighW, 4),
    conductionLossLowW: round(conductionLossLowW, 4),
    inductorLossW: round(inductorLossW, 4),
    switchingLossW: round(switchingLossW, 4),
    totalLossW: round(totalLossW, 4),
    outputPowerW: round(outputPowerW, 3),
    efficiencyPercent: round(efficiencyPercent, 2),
  };
}

function round(n: number, decimals = 4): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
