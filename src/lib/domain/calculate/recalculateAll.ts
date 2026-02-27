import {
  Employee,
  RankThreshold,
  PromotionRule,
  ManagerQualitativeCategory,
  StaffQualitativeCategory,
  LegacyQualitativeScore,
  LegacyQuantitativeScore,
  LegacyEvaluationResultItem,
  LegacyEvaluationResultsData,
  LegacyRankingData,
  AppSettings,
  Role,
  getSheetType,
  CrossMatrixEntry,
  RankCode,
} from '@/lib/types';
import { judgeRank, judgeFinalRankByCrossMatrix } from './rankJudge';
import { judgePromotionByRank } from './promotionJudge';

interface RecalculateInput {
  employees: Employee[];
  qualitativeScores: LegacyQualitativeScore[];
  quantitativeScores: LegacyQuantitativeScore[];
  rankRules: {
    crossMatrix: CrossMatrixEntry[];
    thresholds: {
      quantitative: RankThreshold[];
      managerQualitative: RankThreshold[];
      staffQualitative: RankThreshold[];
    };
  };
  promotionRules: PromotionRule[];
  managerCategories: ManagerQualitativeCategory[];
  staffCategories: StaffQualitativeCategory[];
  period: string;
  settings: AppSettings;
}

interface RecalculateOutput {
  evaluationResults: LegacyEvaluationResultsData;
  ranking: LegacyRankingData;
}

/**
 * 定量スコアを集計
 */
function aggregateQuantitativeScores(
  employeeId: string,
  scores: LegacyQuantitativeScore[]
): { total: number; breakdown: LegacyQuantitativeScore[] } {
  const employeeScores = scores.filter((s) => s.employeeId === employeeId);

  if (employeeScores.length === 0) {
    return { total: 0, breakdown: [] };
  }

  const totalWeight = employeeScores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = employeeScores.reduce((sum, s) => sum + s.score * s.weight, 0);
  const total = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return { total, breakdown: employeeScores };
}

/**
 * 定性スコアを集計
 */
function aggregateQualitativeScores(
  employeeId: string,
  scores: LegacyQualitativeScore[],
  categories: Array<{ categoryId: string; categoryName: string; maxScore: number }>
): { total: number; breakdown: Array<{ categoryId: string; categoryName: string; score: number; maxScore: number; comment?: string }> } {
  const employeeScores = scores.filter((s) => s.employeeId === employeeId);

  let totalScore = 0;
  const breakdown: Array<{ categoryId: string; categoryName: string; score: number; maxScore: number; comment?: string }> = [];

  for (const category of categories) {
    const categoryScore = employeeScores.find((s) => s.categoryId === category.categoryId);
    const score = categoryScore?.adjustedScore ?? 0;
    totalScore += score;

    breakdown.push({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      score,
      maxScore: category.maxScore,
      comment: categoryScore?.comment,
    });
  }

  return { total: totalScore, breakdown };
}

/**
 * 全社員の評価を再集計
 */
export function recalculateAll(input: RecalculateInput): RecalculateOutput {
  const {
    employees,
    qualitativeScores,
    quantitativeScores,
    rankRules,
    promotionRules,
    managerCategories,
    staffCategories,
    period,
    settings,
  } = input;

  const activeEmployees = employees.filter((e) => e.active);
  const resultItems: LegacyEvaluationResultItem[] = [];

  for (const employee of activeEmployees) {
    const sheetType = getSheetType(employee.role);
    const categories = sheetType === 'manager' ? managerCategories : staffCategories;
    const qualitativeThresholds = sheetType === 'manager'
      ? rankRules.thresholds.managerQualitative
      : rankRules.thresholds.staffQualitative;

    // 定量集計
    const quantitative = aggregateQuantitativeScores(employee.employeeId, quantitativeScores);

    // 定性集計
    const qualitative = aggregateQualitativeScores(employee.employeeId, qualitativeScores, categories);

    // 総合点
    const totalScore = Math.round(quantitative.total + qualitative.total);

    // ランク判定（クロスマトリックス使用）
    // 定量ランク × 定性ランク → 総合ランク（全職種共通）
    const quantitativeRank = judgeRank(quantitative.total, rankRules.thresholds.quantitative);
    const qualitativeRank = judgeRank(qualitative.total, qualitativeThresholds);
    const rank = judgeFinalRankByCrossMatrix(quantitativeRank, qualitativeRank, rankRules.crossMatrix);

    // 昇降格判定
    const promotion = judgePromotionByRank(rank, employee.role);

    resultItems.push({
      employeeId: employee.employeeId,
      role: employee.role,
      storeId: employee.storeId,
      totalScore,
      quantitativeScore: quantitative.total,
      qualitativeScore: qualitative.total,
      rank,
      overallRank: 0,
      roleRank: 0,
      promotionStatus: promotion.status,
      promotionReason: promotion.reason,
      detail: {
        qualitativeBreakdown: qualitative.breakdown,
        quantitativeBreakdown: quantitative.breakdown.map((s) => ({
          metricId: s.metricId,
          metricName: s.metricName,
          actualValue: s.actualValue,
          targetValue: s.targetValue,
          score: s.score,
          weight: s.weight,
        })),
      },
    });
  }

  // ランキング生成
  const sortedResults = [...resultItems].sort((a, b) => b.totalScore - a.totalScore);
  sortedResults.forEach((item, index) => {
    item.overallRank = index + 1;
  });

  // 役職別ランキング
  const roles: Role[] = ['manager', 'assistant_manager', 'staff'];
  const byRole: Record<Role, { employeeId: string; rank: number }[]> = {
    manager: [],
    assistant_manager: [],
    staff: [],
  };

  for (const role of roles) {
    const roleResults = resultItems.filter((r) => r.role === role).sort((a, b) => b.totalScore - a.totalScore);
    roleResults.forEach((item, index) => {
      item.roleRank = index + 1;
      byRole[role].push({ employeeId: item.employeeId, rank: index + 1 });
    });
  }

  // 店舗別ランキング
  const storeIds = [...new Set(resultItems.map((r) => r.storeId))];
  const byStore: Record<string, { employeeId: string; rank: number }[]> = {};
  for (const storeId of storeIds) {
    const storeResults = resultItems.filter((r) => r.storeId === storeId).sort((a, b) => b.totalScore - a.totalScore);
    byStore[storeId] = storeResults.map((item, index) => ({ employeeId: item.employeeId, rank: index + 1 }));
  }

  const ranking: LegacyRankingData = {
    period,
    overall: sortedResults.map((item, index) => ({ employeeId: item.employeeId, rank: index + 1 })),
    byRole,
    byStore,
  };

  const evaluationResults: LegacyEvaluationResultsData = {
    period,
    generatedAt: new Date().toISOString(),
    items: resultItems,
  };

  return { evaluationResults, ranking };
}
