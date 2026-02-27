import { LegacyQualitativeScore, QualitativeBreakdown, ManagerQualitativeCategory, StaffQualitativeCategory } from '@/lib/types';

type QualitativeCategory = ManagerQualitativeCategory | StaffQualitativeCategory;

/**
 * 定性スコアを集計（Legacy形式）
 */
export function aggregateQualitativeScores(
  employeeId: string,
  scores: LegacyQualitativeScore[],
  categories: QualitativeCategory[]
): { total: number; breakdown: QualitativeBreakdown[] } {
  const employeeScores = scores.filter((s) => s.employeeId === employeeId);

  // 有効なカテゴリのみ
  const applicableCategories = categories.filter((c) => c.enabled);

  if (applicableCategories.length === 0) {
    return { total: 0, breakdown: [] };
  }

  const breakdown: QualitativeBreakdown[] = [];
  let totalScore = 0;

  for (const category of applicableCategories) {
    const categoryScore = employeeScores.find(
      (s) => s.categoryId === category.categoryId
    );

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
