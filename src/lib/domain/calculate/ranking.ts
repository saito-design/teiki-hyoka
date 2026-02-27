import { LegacyEvaluationResultItem, LegacyRankingData, LegacyRankingItem, Role } from '@/lib/types';

/**
 * 順位を付ける
 */
function assignRanks(
  items: LegacyEvaluationResultItem[],
  tieBreakOrder: string[]
): LegacyRankingItem[] {
  // ソート（同点時はtieBreakOrderで比較）
  const sorted = [...items].sort((a, b) => {
    // 第一優先: totalScore（降順）
    if (a.totalScore !== b.totalScore) {
      return b.totalScore - a.totalScore;
    }

    // 同点時の優先順
    for (const key of tieBreakOrder) {
      if (key === 'totalScore') continue;

      if (key === 'quantitativeScore') {
        if (a.quantitativeScore !== b.quantitativeScore) {
          return b.quantitativeScore - a.quantitativeScore;
        }
      }

      if (key === 'qualitativeScore') {
        if (a.qualitativeScore !== b.qualitativeScore) {
          return b.qualitativeScore - a.qualitativeScore;
        }
      }

      if (key === 'employeeCode' || key === 'employeeId') {
        return a.employeeId.localeCompare(b.employeeId);
      }
    }

    return 0;
  });

  // 順位を付与
  return sorted.map((item, index) => ({
    employeeId: item.employeeId,
    rank: index + 1,
  }));
}

/**
 * ランキングを生成
 */
export function buildRankings(
  results: LegacyEvaluationResultItem[],
  period: string,
  tieBreakOrder: string[] = ['totalScore', 'quantitativeScore', 'employeeCode']
): LegacyRankingData {
  // 全体ランキング
  const overall = assignRanks(results, tieBreakOrder);

  // 役職別ランキング
  const roles: Role[] = ['manager', 'assistant_manager', 'staff'];
  const byRole = {} as Record<Role, LegacyRankingItem[]>;

  for (const role of roles) {
    const roleResults = results.filter((r) => r.role === role);
    byRole[role] = assignRanks(roleResults, tieBreakOrder);
  }

  // 店舗別ランキング
  const storeIds = [...new Set(results.map((r) => r.storeId))];
  const byStore: Record<string, LegacyRankingItem[]> = {};

  for (const storeId of storeIds) {
    const storeResults = results.filter((r) => r.storeId === storeId);
    byStore[storeId] = assignRanks(storeResults, tieBreakOrder);
  }

  return {
    period,
    overall,
    byRole,
    byStore,
  };
}
