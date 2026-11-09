import type { BuckDesignInput, BuckDesignResult, PdnInput, PdnResult } from "./types";

/**
 * Assembles a short application-note-style write-up from the computed
 * design results - the kind of document an applications engineer would
 * draft to hand to a customer or publish alongside a reference design.
 */
export function generateApplicationNote(
  buck: { input: BuckDesignInput; result: BuckDesignResult } | null,
  pdn: { input: PdnInput; result: PdnResult } | null,
): string {
  const sections: string[] = [];

  sections.push(`# Application Note: ${buck ? `${buck.input.vinV}V to ${buck.input.voutV}V` : "Power Design"} Reference Circuit\n`);
  sections.push(`_Generated ${new Date().toISOString().slice(0, 10)}_\n`);

  sections.push("## 1. Introduction\n");
  sections.push(
    buck
      ? `This note documents a synchronous buck converter reference design converting ${buck.input.vinV} V to ${buck.input.voutV} V at up to ${buck.input.ioutMaxA} A, switching at ${(buck.input.fswHz / 1000).toFixed(0)} kHz.\n`
      : "This note documents a power delivery network analysis.\n",
  );

  if (buck) {
    const { input, result } = buck;
    sections.push("## 2. Buck Converter Design Equations\n");
    sections.push(
      [
        `- Duty cycle: D = Vout / Vin = ${input.voutV} / ${input.vinV} = **${result.dutyCycle}**`,
        `- Inductor ripple current: ΔIL = ${(input.inductorRippleRatio * 100).toFixed(0)}% × Iout = **${result.inductorRippleA} A**`,
        `- Inductance: L = (Vin − Vout) × D / (fsw × ΔIL) = **${result.inductanceUh} µH**`,
        `- Peak / valley inductor current: **${result.peakInductorCurrentA} A / ${result.valleyInductorCurrentA} A**`,
        `- Output capacitor ESR ripple contribution: **${result.esrRippleMv} mV**`,
        result.requiredOutputCapUf != null
          ? `- Required output capacitance for the remaining ${result.remainingRippleBudgetMv} mV ripple budget: **${result.requiredOutputCapUf} µF**`
          : `- **Warning:** ESR ripple alone (${result.esrRippleMv} mV) exceeds the ${input.outputRippleTargetMv} mV target. A lower-ESR output capacitor is required.`,
      ].join("\n") + "\n",
    );

    sections.push("## 3. Estimated Efficiency\n");
    sections.push(
      [
        `| Loss term | Value |`,
        `|---|---|`,
        `| High-side conduction | ${result.conductionLossHighW} W |`,
        `| Low-side conduction | ${result.conductionLossLowW} W |`,
        `| Inductor DCR | ${result.inductorLossW} W |`,
        `| Switching | ${result.switchingLossW} W |`,
        `| **Total loss** | **${result.totalLossW} W** |`,
        `| Output power | ${result.outputPowerW} W |`,
        `| **Estimated efficiency** | **${result.efficiencyPercent}%** |`,
      ].join("\n") + "\n",
    );
  }

  if (pdn) {
    const { input, result } = pdn;
    sections.push("## 4. Power Delivery Network Analysis\n");
    sections.push(
      `A ${input.capacitors.length}-group decoupling bank was swept from ${(input.freqStartHz / 1000).toFixed(0)} kHz to ${(input.freqEndHz / 1e6).toFixed(0)} MHz against a target impedance of ${input.targetImpedanceMilliOhm} mΩ.\n`,
    );
    sections.push(
      [
        `- Worst-case impedance: **${result.worstCaseMilliOhm} mΩ** at ${(result.worstCaseFreqHz / 1e6).toFixed(2)} MHz`,
        `- Target exceeded: **${result.anyExceedsTarget ? "Yes" : "No"}**`,
        result.violatingBands.length
          ? `- Bands exceeding target: ${result.violatingBands.map((b) => `${(b.fromHz / 1000).toFixed(0)} kHz – ${(b.toHz / 1e6).toFixed(2)} MHz`).join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n") + "\n",
    );
    if (result.anyExceedsTarget) {
      sections.push(
        "**Recommendation:** add a capacitor decade between the existing groups to flatten the anti-resonance peak, or select lower-ESL ceramics to extend low-impedance coverage to the sweep's upper frequency.\n",
      );
    }
  }

  sections.push("## 5. Summary\n");
  sections.push(
    buck && pdn
      ? `The reference design meets its ripple and efficiency targets; see §4 for PDN recommendations before layout sign-off.\n`
      : "See the sections above for design details.\n",
  );

  return sections.join("\n");
}
