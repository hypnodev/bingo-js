export function calculatePercentage(percent, total): number {
  return +((percent / 100) * total).toFixed(2);
}
