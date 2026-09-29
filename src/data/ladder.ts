export interface LadderLevel {
  level: number;
  amount: number;
  isSafeHaven: boolean;
}

// Generate an exhilarating 100-step ladder up to Rp1.000.000.000 (1 Miliar Rupiah)
export function getPrizeForQuestion(questionIndex: number): number {
  const i = Math.min(Math.max(0, questionIndex), 99);
  // Key milestones
  if (i === 99) return 1000000000; // Rp1 Miliar
  if (i === 98) return 750000000;
  if (i === 94) return 500000000;
  if (i === 89) return 250000000;
  if (i === 74) return 100000000;
  if (i === 49) return 25000000;
  if (i === 24) return 5000000;
  if (i === 9) return 1000000;

  // Progressive base formula
  if (i < 10) {
    const startValues = [10000, 25000, 50000, 100000, 200000, 350000, 500000, 700000, 850000, 1000000];
    return startValues[i];
  } else if (i < 25) {
    const step = (5000000 - 1000000) / 15;
    return Math.round((1000000 + (i - 9) * step) / 50000) * 50000;
  } else if (i < 50) {
    const step = (25000000 - 5000000) / 25;
    return Math.round((5000000 + (i - 24) * step) / 250000) * 250000;
  } else if (i < 75) {
    const step = (100000000 - 25000000) / 25;
    return Math.round((25000000 + (i - 49) * step) / 1000000) * 1000000;
  } else {
    const step = (1000000000 - 100000000) / 25;
    return Math.round((100000000 + (i - 74) * step) / 5000000) * 5000000;
  }
}

export const safeHavenLevels = [10, 25, 50, 75, 100];

export function formatRupiah(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}
