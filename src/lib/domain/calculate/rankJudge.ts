import { RankCode, RankThreshold, CrossMatrixEntry } from '@/lib/types';

/** ランクの色設定 */
export const RANK_COLORS: Record<RankCode, string> = {
  S: '#7c3aed', // 紫
  A: '#2563eb', // 青
  B: '#16a34a', // 緑
  C: '#f59e0b', // オレンジ
  D: '#dc2626', // 赤
  E: '#6b7280', // グレー
};

/**
 * 点数からランクを判定（しきい値テーブル形式）
 */
export function judgeRank(score: number, thresholds: RankThreshold[]): RankCode {
  // しきい値をminScore降順でソート
  const sorted = [...thresholds].sort((a, b) => b.minScore - a.minScore);

  for (const threshold of sorted) {
    if (score >= threshold.minScore) {
      return threshold.rank;
    }
  }

  // 該当なしの場合は最低ランク
  return sorted[sorted.length - 1]?.rank ?? 'E';
}

/**
 * 店長・定量評価のランク判定
 */
export function judgeManagerQuantitativeRank(
  score: number,
  thresholds: RankThreshold[]
): RankCode {
  return judgeRank(score, thresholds);
}

/**
 * 店長・定性評価のランク判定
 */
export function judgeManagerQualitativeRank(
  score: number,
  thresholds: RankThreshold[]
): RankCode {
  return judgeRank(score, thresholds);
}

/**
 * 一般社員・定性評価のランク判定
 */
export function judgeStaffQualitativeRank(
  score: number,
  thresholds: RankThreshold[]
): RankCode {
  return judgeRank(score, thresholds);
}

/**
 * 総合ランクを判定（店長/副店長）
 */
export function judgeManagerTotalRank(
  totalScore: number,
  thresholds: RankThreshold[]
): RankCode {
  return judgeRank(totalScore, thresholds);
}

/**
 * 総合ランクを判定（一般社員）
 */
export function judgeStaffTotalRank(
  totalScore: number,
  thresholds: RankThreshold[]
): RankCode {
  return judgeRank(totalScore, thresholds);
}

/**
 * ランクコードから色を取得
 */
export function getRankColor(rankCode: RankCode | string): string {
  return RANK_COLORS[rankCode as RankCode] ?? '#6b7280';
}

/**
 * ランクの順序を取得（S=1が最高）
 */
export function getRankOrder(rank: RankCode): number {
  const order: Record<RankCode, number> = {
    S: 1,
    A: 2,
    B: 3,
    C: 4,
    D: 5,
    E: 6,
  };
  return order[rank] ?? 99;
}

/**
 * ランク比較（a > b なら正、a < b なら負）
 */
export function compareRanks(a: RankCode, b: RankCode): number {
  return getRankOrder(b) - getRankOrder(a);
}

/**
 * クロスマトリックスから総合ランクを判定
 * @param quantitativeRank 定量ランク
 * @param qualitativeRank 定性ランク
 * @param crossMatrix クロスマトリックス
 * @returns 総合ランク
 */
export function judgeFinalRankByCrossMatrix(
  quantitativeRank: RankCode,
  qualitativeRank: RankCode,
  crossMatrix: CrossMatrixEntry[]
): RankCode {
  const entry = crossMatrix.find(
    (m) => m.quantitativeRank === quantitativeRank && m.qualitativeRank === qualitativeRank
  );
  return entry?.finalRank ?? 'E';
}
