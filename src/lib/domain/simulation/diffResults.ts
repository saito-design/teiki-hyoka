import { LegacyEvaluationResultItem, ImpactSummary } from '@/lib/types';

export interface ResultDiff {
  employeeId: string;
  beforeRank: string;
  afterRank: string;
  beforeTotalScore: number;
  afterTotalScore: number;
  beforePromotionStatus: string;
  afterPromotionStatus: string;
  changed: boolean;
}

/**
 * 評価結果の差分を計算
 */
export function diffResults(
  before: LegacyEvaluationResultItem[],
  after: LegacyEvaluationResultItem[]
): { diffs: ResultDiff[]; summary: ImpactSummary } {
  const diffs: ResultDiff[] = [];

  let changedEmployees = 0;
  let rankUpCount = 0;
  let rankDownCount = 0;
  let promoteCount = 0;
  let demoteCount = 0;

  for (const afterItem of after) {
    const beforeItem = before.find(
      (b) => b.employeeId === afterItem.employeeId
    );

    if (!beforeItem) continue;

    const rankChanged = beforeItem.rank !== afterItem.rank;
    const promotionChanged =
      beforeItem.promotionStatus !== afterItem.promotionStatus;
    const changed = rankChanged || promotionChanged;

    if (changed) {
      changedEmployees++;
    }

    // ランク変動カウント
    if (rankChanged) {
      const rankOrder = ['S', 'A', 'B', 'C'];
      const beforeIndex = rankOrder.indexOf(beforeItem.rank);
      const afterIndex = rankOrder.indexOf(afterItem.rank);

      if (afterIndex < beforeIndex) {
        rankUpCount++;
      } else {
        rankDownCount++;
      }
    }

    // 昇降格変動カウント
    if (afterItem.promotionStatus === 'promote' && beforeItem.promotionStatus !== 'promote') {
      promoteCount++;
    }
    if (afterItem.promotionStatus === 'demote' && beforeItem.promotionStatus !== 'demote') {
      demoteCount++;
    }

    diffs.push({
      employeeId: afterItem.employeeId,
      beforeRank: beforeItem.rank,
      afterRank: afterItem.rank,
      beforeTotalScore: beforeItem.totalScore,
      afterTotalScore: afterItem.totalScore,
      beforePromotionStatus: beforeItem.promotionStatus,
      afterPromotionStatus: afterItem.promotionStatus,
      changed,
    });
  }

  const summary: ImpactSummary = {
    changedEmployees,
    rankUpCount,
    rankDownCount,
    promoteCount,
    demoteCount,
  };

  return { diffs, summary };
}
