import { RoundingMode } from '@/lib/types';

/**
 * 丸め処理を適用
 */
export function applyRounding(value: number, mode: RoundingMode): number {
  switch (mode) {
    case 'round':
      return Math.round(value);
    case 'floor':
      return Math.floor(value);
    case 'ceil':
      return Math.ceil(value);
    default:
      return Math.round(value);
  }
}

/**
 * 総合点を計算
 */
export function calculateTotalScore(
  quantitativeScore: number,
  qualitativeScore: number,
  roundingMode: RoundingMode = 'round'
): number {
  const total = quantitativeScore + qualitativeScore;
  return applyRounding(total, roundingMode);
}
