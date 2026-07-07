// Sliders step by fractional amounts (e.g. 0.02), so `min + n * step` accrues
// binary-float error and a value meant to be -0.3 arrives as -0.29999999999993.
// These helpers snap the emitted value and format the displayed one to the
// step's own precision so neither the stored state nor the UI shows that noise.

/** Number of decimal places implied by a step, e.g. 0.02 → 2, 1 → 0. */
export function decimalsForStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) return 0;
  const [, frac = ''] = String(step).split('.');
  return frac.length;
}

/** Round `value` to the precision of `step`, clearing float-step noise. */
export function snapToStep(value: number, step: number): number {
  return Number(value.toFixed(decimalsForStep(step)));
}

/** Display string for a slider value, trimmed to the step's precision. */
export function formatSliderValue(value: number, step: number): string {
  return String(snapToStep(value, step));
}
