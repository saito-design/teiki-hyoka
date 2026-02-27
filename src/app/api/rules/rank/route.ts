import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/drive';
import { RankRulesData, RuleChangeLog, RuleChangeLogsData } from '@/lib/types';
import { randomUUID } from 'crypto';

// GET: ランク設定を取得
export async function GET() {
  try {
    const data = await readJson<RankRulesData>('rank_rules.json');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PUT: ランク設定を更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { thresholds, crossMatrix, reason = '' } = body;

    if (!thresholds && !crossMatrix) {
      return NextResponse.json(
        { success: false, error: 'thresholds or crossMatrix is required' },
        { status: 400 }
      );
    }

    // 現在の設定を読み込み
    const currentData = await readJson<RankRulesData>('rank_rules.json');

    // 新しい設定を作成
    const newData: RankRulesData = {
      ...currentData,
      version: currentData.version + 1,
      updatedAt: new Date().toISOString(),
      crossMatrix: crossMatrix || currentData.crossMatrix,
      thresholds: thresholds ? {
        quantitative: thresholds.quantitative || currentData.thresholds.quantitative,
        managerQualitative: thresholds.managerQualitative || currentData.thresholds.managerQualitative,
        staffQualitative: thresholds.staffQualitative || currentData.thresholds.staffQualitative,
      } : currentData.thresholds,
    };

    // 変更ログを作成
    const logEntry: RuleChangeLog = {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actorId: 'system',
      actorName: 'システム',
      ruleType: 'rank',
      action: 'apply',
      reason: reason || 'ランク設定を更新',
      beforeSnapshot: {
        version: currentData.version,
        crossMatrix: currentData.crossMatrix,
        thresholds: currentData.thresholds,
      },
      afterSnapshot: {
        version: newData.version,
        crossMatrix: newData.crossMatrix,
        thresholds: newData.thresholds,
      },
      impactSummary: {
        changedEmployees: 0, // シミュレーション後に計算
      },
      applied: true,
    };

    // ログを読み込み（存在しない場合は新規作成）
    let logsData: RuleChangeLogsData;
    try {
      logsData = await readJson<RuleChangeLogsData>('rule_change_logs.json');
    } catch {
      logsData = { items: [] };
    }

    // ログを追加（最新が先頭）
    logsData.items.unshift(logEntry);

    // 保存
    await Promise.all([
      writeJson('rank_rules.json', newData),
      writeJson('rule_change_logs.json', logsData),
    ]);

    return NextResponse.json({
      success: true,
      data: newData,
      log: logEntry,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
