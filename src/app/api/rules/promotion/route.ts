import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/drive';
import { PromotionRulesData, RuleChangeLog, RuleChangeLogsData } from '@/lib/types';
import { randomUUID } from 'crypto';

// GET: 昇降格設定を取得
export async function GET() {
  try {
    const data = await readJson<PromotionRulesData>('promotion_rules.json');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PUT: 昇降格設定を更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { rules, salaryAdjustment, reason = '' } = body;

    if (!rules && !salaryAdjustment) {
      return NextResponse.json(
        { success: false, error: 'rules or salaryAdjustment is required' },
        { status: 400 }
      );
    }

    // 現在の設定を読み込み
    const currentData = await readJson<PromotionRulesData>('promotion_rules.json');

    // 新しい設定を作成
    const newData: PromotionRulesData = {
      ...currentData,
      version: currentData.version + 1,
      updatedAt: new Date().toISOString(),
      rules: rules || currentData.rules,
      salaryAdjustment: salaryAdjustment || currentData.salaryAdjustment,
    };

    // 変更ログを作成
    const logEntry: RuleChangeLog = {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actorId: 'system',
      actorName: 'システム',
      ruleType: 'promotion',
      action: 'apply',
      reason: reason || '昇降格設定を更新',
      beforeSnapshot: {
        version: currentData.version,
        rules: currentData.rules,
        salaryAdjustment: currentData.salaryAdjustment,
      },
      afterSnapshot: {
        version: newData.version,
        rules: newData.rules,
        salaryAdjustment: newData.salaryAdjustment,
      },
      impactSummary: {
        changedEmployees: 0,
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
      writeJson('promotion_rules.json', newData),
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
