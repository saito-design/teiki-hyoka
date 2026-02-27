import { LegacyQuantitativeScore, QuantitativeBreakdown } from '@/lib/types';

/**
 * 定量スコアを集計（Legacy形式）
 */
export function aggregateQuantitativeScores(
  employeeId: string,
  scores: LegacyQuantitativeScore[]
): { total: number; breakdown: QuantitativeBreakdown[] } {
  const employeeScores = scores.filter((s) => s.employeeId === employeeId);

  if (employeeScores.length === 0) {
    return { total: 0, breakdown: [] };
  }

  const breakdown: QuantitativeBreakdown[] = employeeScores.map((s) => ({
    metricId: s.metricId,
    metricName: s.metricName,
    actualValue: s.actualValue,
    targetValue: s.targetValue,
    score: s.score,
    weight: s.weight,
  }));

  // 重み付き合計
  const totalWeight = employeeScores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = employeeScores.reduce((sum, s) => sum + s.score * s.weight, 0);

  const total = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return { total, breakdown };
}
