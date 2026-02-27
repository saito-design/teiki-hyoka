import { NextRequest, NextResponse } from 'next/server';
import { readJson } from '@/lib/drive';
import { simulateRuleChange } from '@/lib/domain/simulation';
import {
  EmployeesData,
  RankRulesData,
  PromotionRulesData,
  QualitativeCategoriesData,
  AppSettings,
  RuleType,
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
    const {
      ruleType,
      draftRankRules,
      draftPromotionRules,
      draftManagerCategories,
      draftStaffCategories,
      period = '2025_H2',
      reason = ''
    } = body;

    if (!ruleType) {
      return NextResponse.json(
        { success: false, error: 'ruleType is required' },
        { status: 400 }
      );
    }

    if (!['rank', 'promotion', 'qualitative', 'bonus'].includes(ruleType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rule type' },
        { status: 400 }
      );
    }

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

    // シミュレーション実行
    const result = simulateRuleChange({
      employees: employeesData.items,
      qualitativeScores: qualitativeScoresData.items,
      quantitativeScores: quantitativeScoresData.items,
      currentRankRules: {
        crossMatrix: rankRulesData.crossMatrix,
        thresholds: rankRulesData.thresholds,
      },
      currentPromotionRules: promotionRulesData.rules,
      currentManagerCategories: categoriesData.managerCategories,
      currentStaffCategories: categoriesData.staffCategories,
      draftRankRules,
      draftPromotionRules,
      draftManagerCategories,
      draftStaffCategories,
      ruleType: ruleType as RuleType,
      period,
      settings: appSettings,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        ruleType,
        reason,
        period,
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
