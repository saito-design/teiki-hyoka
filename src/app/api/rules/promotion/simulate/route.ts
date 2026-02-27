import { NextRequest, NextResponse } from 'next/server';
import { readJson } from '@/lib/drive';
import {
  PromotionRulesData,
  EmployeesData,
  RankCode,
  PromotionRule,
} from '@/lib/types';

interface EvaluationResultItem {
  employeeId: string;
  employeeName: string;
  role: string;
  rank: RankCode;
}

interface PromotionSimulationResult {
  employeeId: string;
  employeeName: string;
  role: string;
  currentRank: RankCode;
  previousRank: RankCode; // 前期ランク（仮にBとする）
  beforeLevel: number;
  afterLevel: number;
  levelChange: number;
}

interface PromotionSimulationSummary {
  totalEmployees: number;
  changedEmployees: number;
  morePromotionCount: number; // より昇格しやすくなった
  lessPromotionCount: number; // より降格しやすくなった
  noChangeCount: number;
}

// 昇降格レベルを取得
function getPromotionLevel(
  prevRank: RankCode,
  currentRank: RankCode,
  rules: PromotionRule[]
): number {
  const rule = rules.find(
    (r) => r.currentRank === prevRank && r.nextRank === currentRank
  );
  return rule?.promotionLevel ?? 0;
}

// POST: シミュレーション実行
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rules: newRules } = body;

    if (!newRules) {
      return NextResponse.json(
        { success: false, error: 'rules is required' },
        { status: 400 }
      );
    }

    // 現在の設定を読み込み
    const currentPromotion = await readJson<PromotionRulesData>('promotion_rules.json');

    // 評価結果を読み込み
    let evaluationResults: { items: EvaluationResultItem[] };
    try {
      evaluationResults = await readJson<{ items: EvaluationResultItem[] }>('evaluation_results_2025_H2.json');
    } catch {
      return NextResponse.json({
        success: false,
        error: '評価データが見つかりません',
      }, { status: 404 });
    }

    // 社員マスタを読み込み
    const employeesData = await readJson<EmployeesData>('employees.json');
    const employeeMap = new Map(employeesData.items.map(e => [e.employeeId, e]));

    const ranks: RankCode[] = ['S', 'A', 'B', 'C', 'D', 'E'];
    const results: PromotionSimulationResult[] = [];

    // 各社員について、全ての前期ランクパターンでの影響を確認
    for (const evalResult of evaluationResults.items) {
      const employee = employeeMap.get(evalResult.employeeId);
      if (!employee) continue;

      const currentRank = evalResult.rank;

      // 仮の前期ランクとしてBを使用（実際の前期データがあれば使用）
      const previousRank: RankCode = 'B';

      const beforeLevel = getPromotionLevel(previousRank, currentRank, currentPromotion.rules);
      const afterLevel = getPromotionLevel(previousRank, currentRank, newRules);
      const levelChange = afterLevel - beforeLevel;

      results.push({
        employeeId: evalResult.employeeId,
        employeeName: evalResult.employeeName || employee.name,
        role: employee.role,
        currentRank,
        previousRank,
        beforeLevel,
        afterLevel,
        levelChange,
      });
    }

    // サマリを計算
    const summary: PromotionSimulationSummary = {
      totalEmployees: results.length,
      changedEmployees: results.filter(r => r.levelChange !== 0).length,
      morePromotionCount: results.filter(r => r.levelChange > 0).length,
      lessPromotionCount: results.filter(r => r.levelChange < 0).length,
      noChangeCount: results.filter(r => r.levelChange === 0).length,
    };

    // ルール変更の詳細も返す（マトリクス比較用）
    const ruleChanges: Array<{
      prevRank: RankCode;
      nextRank: RankCode;
      beforeLevel: number;
      afterLevel: number;
    }> = [];

    for (const prevRank of ranks) {
      for (const nextRank of ranks) {
        const beforeLevel = getPromotionLevel(prevRank, nextRank, currentPromotion.rules);
        const afterLevel = getPromotionLevel(prevRank, nextRank, newRules);
        if (beforeLevel !== afterLevel) {
          ruleChanges.push({ prevRank, nextRank, beforeLevel, afterLevel });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        changedResults: results.filter(r => r.levelChange !== 0),
        allResults: results,
        ruleChanges,
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
