import { NextRequest, NextResponse } from 'next/server';
import { readJson } from '@/lib/drive';
import {
  RankRulesData,
  PromotionRulesData,
  QualitativeCategoriesData,
  BonusSettings,
  RuleType,
} from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    if (!['rank', 'promotion', 'qualitative', 'bonus'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rule type' },
        { status: 400 }
      );
    }

    const ruleType = type as RuleType;

    let data;
    switch (ruleType) {
      case 'rank':
        data = await readJson<RankRulesData>('rank_rules.json');
        break;
      case 'promotion':
        data = await readJson<PromotionRulesData>('promotion_rules.json');
        break;
      case 'qualitative':
        data = await readJson<QualitativeCategoriesData>('qualitative_categories.json');
        break;
      case 'bonus':
        data = await readJson<BonusSettings>('bonus_settings.json');
        break;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
