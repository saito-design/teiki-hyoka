import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/drive';
import { recalculateAll } from '@/lib/domain/calculate';
import {
  EmployeesData,
  RankRulesData,
  PromotionRulesData,
  QualitativeCategoriesData,
  AppSettings,
  LegacyQualitativeScore,
  LegacyQuantitativeScore,
} from '@/lib/types';

interface LegacyQualitativeScoresData {
  period: string;
  items: LegacyQualitativeScore[];
}

interface LegacyQuantitativeScoresData {
  period: string;
  items: LegacyQuantitativeScore[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const period = body.period || '2025_H2';

    // データを読み込み
    const [
      employeesData,
      rankRulesData,
      promotionRulesData,
      categoriesData,
      qualitativeScoresData,
      quantitativeScoresData,
      appSettings,
    ] = await Promise.all([
      readJson<EmployeesData>('employees.json'),
      readJson<RankRulesData>('rank_rules.json'),
      readJson<PromotionRulesData>('promotion_rules.json'),
      readJson<QualitativeCategoriesData>('qualitative_categories.json'),
      readJson<LegacyQualitativeScoresData>(`qualitative_scores_${period}.json`),
      readJson<LegacyQuantitativeScoresData>(`quantitative_scores_${period}.json`),
      readJson<AppSettings>('app_settings.json'),
    ]);

    // 再集計
    const { evaluationResults, ranking } = recalculateAll({
      employees: employeesData.items,
      qualitativeScores: qualitativeScoresData.items,
      quantitativeScores: quantitativeScoresData.items,
      rankRules: {
        crossMatrix: rankRulesData.crossMatrix,
        thresholds: rankRulesData.thresholds,
      },
      promotionRules: promotionRulesData.rules,
      managerCategories: categoriesData.managerCategories,
      staffCategories: categoriesData.staffCategories,
      period,
      settings: appSettings,
    });

    // 結果を保存
    await Promise.all([
      writeJson(`evaluation_results_${period}.json`, evaluationResults),
      writeJson(`ranking_${period}.json`, ranking),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        evaluationResults,
        ranking,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
