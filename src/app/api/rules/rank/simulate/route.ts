import { NextRequest, NextResponse } from 'next/server';
import { readJson } from '@/lib/drive';
import {
  RankRulesData,
  EmployeesData,
  RankCode,
  CrossMatrixEntry,
  RankThreshold,
} from '@/lib/types';

interface EvaluationResultItem {
  employeeId: string;
  employeeName: string;
  role: string;
  quantitativeScore: number;
  qualitativeScore: number;
  totalScore: number;
  rank: RankCode;
}

interface SimulationResult {
  employeeId: string;
  employeeName: string;
  role: string;
  beforeRank: RankCode;
  afterRank: RankCode;
  rankChange: number; // 正=昇格、負=降格、0=維持
}

interface SimulationSummary {
  totalEmployees: number;
  changedEmployees: number;
  rankUpCount: number;
  rankDownCount: number;
  noChangeCount: number;
}

// ランク順序
const rankOrder: Record<RankCode, number> = {
  S: 1, A: 2, B: 3, C: 4, D: 5, E: 6,
};

// スコアからランクを判定
function judgeRank(score: number, thresholds: RankThreshold[]): RankCode {
  const sorted = [...thresholds].sort((a, b) => b.minScore - a.minScore);
  for (const t of sorted) {
    if (score >= t.minScore) {
      return t.rank;
    }
  }
  return 'E';
}

// クロスマトリックスから総合ランクを判定
function judgeFinalRank(
  quantRank: RankCode,
  qualRank: RankCode,
  crossMatrix: CrossMatrixEntry[]
): RankCode {
  const entry = crossMatrix.find(
    (m) => m.quantitativeRank === quantRank && m.qualitativeRank === qualRank
  );
  return entry?.finalRank || 'E';
}

// POST: シミュレーション実行
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { thresholds: newThresholds, crossMatrix: newCrossMatrix } = body;

    // 現在の設定を読み込み
    const currentRules = await readJson<RankRulesData>('rank_rules.json');

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

    // シミュレーション用の新ルール
    const simulatedThresholds = newThresholds || currentRules.thresholds;
    const simulatedCrossMatrix = newCrossMatrix || currentRules.crossMatrix;

    // 各社員のランクを再計算
    const results: SimulationResult[] = [];

    for (const evalResult of evaluationResults.items) {
      const employee = employeeMap.get(evalResult.employeeId);
      if (!employee) continue;

      const isManager = employee.role === 'manager' || employee.role === 'assistant_manager';

      // 現行ルールでのランク計算
      const currentQuantRank = judgeRank(
        evalResult.quantitativeScore,
        currentRules.thresholds.quantitative
      );
      const currentQualRank = judgeRank(
        evalResult.qualitativeScore,
        isManager ? currentRules.thresholds.managerQualitative : currentRules.thresholds.staffQualitative
      );
      const currentFinalRank = judgeFinalRank(currentQuantRank, currentQualRank, currentRules.crossMatrix);

      // 新ルールでのランク計算
      const newQuantRank = judgeRank(
        evalResult.quantitativeScore,
        simulatedThresholds.quantitative
      );
      const newQualRank = judgeRank(
        evalResult.qualitativeScore,
        isManager ? simulatedThresholds.managerQualitative : simulatedThresholds.staffQualitative
      );
      const newFinalRank = judgeFinalRank(newQuantRank, newQualRank, simulatedCrossMatrix);

      // ランク変動を計算
      const rankChange = rankOrder[currentFinalRank] - rankOrder[newFinalRank]; // 正=昇格

      results.push({
        employeeId: evalResult.employeeId,
        employeeName: evalResult.employeeName || employee.name,
        role: employee.role,
        beforeRank: currentFinalRank,
        afterRank: newFinalRank,
        rankChange,
      });
    }

    // サマリを計算
    const summary: SimulationSummary = {
      totalEmployees: results.length,
      changedEmployees: results.filter(r => r.rankChange !== 0).length,
      rankUpCount: results.filter(r => r.rankChange > 0).length,
      rankDownCount: results.filter(r => r.rankChange < 0).length,
      noChangeCount: results.filter(r => r.rankChange === 0).length,
    };

    // 変更がある社員のみ返す（変更なしは省略可能）
    const changedResults = results.filter(r => r.rankChange !== 0);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        changedResults,
        allResults: results,
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
