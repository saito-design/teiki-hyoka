import { RankCode, PromotionRule, PromotionStatus, Role } from '@/lib/types';

interface PromotionJudgeResult {
  status: PromotionStatus;
  level: number; // 昇降格レベル（2=2段階昇格, 1=1段階昇格, 0=維持, -1=1段階降格, -2=2段階降格）
  reason: string;
  salaryAdjustment?: number;
}

/**
 * 昇降格レベルからステータスに変換
 */
function levelToStatus(level: number): PromotionStatus {
  if (level >= 2) return 'promote_2';
  if (level === 1) return 'promote_1';
  if (level === -1) return 'demote_1';
  if (level <= -2) return 'demote_2';
  return 'keep';
}

/**
 * ステータスの日本語ラベル
 */
export const PromotionStatusLabels: Record<PromotionStatus, string> = {
  promote_2: '2段階昇格',
  promote_1: '1段階昇格',
  promote: '昇格',
  keep: '現状維持',
  demote: '降格',
  demote_1: '1段階降格',
  demote_2: '2段階降格',
};

/**
 * 昇降格を判定（2期間のランク組み合わせ）
 */
export function judgePromotion(
  currentRank: RankCode,
  previousRank: RankCode | null,
  rules: PromotionRule[],
  role: Role
): PromotionJudgeResult {
  // 前回ランクがない場合は判定不可
  if (!previousRank) {
    return {
      status: 'keep',
      level: 0,
      reason: '前回評価データなし',
    };
  }

  // ルールから該当する組み合わせを検索
  const rule = rules.find(
    (r) => r.currentRank === previousRank && r.nextRank === currentRank
  );

  if (!rule) {
    return {
      status: 'keep',
      level: 0,
      reason: '該当ルールなし',
    };
  }

  const status = levelToStatus(rule.promotionLevel);
  let reason = '';

  if (rule.promotionLevel > 0) {
    reason = `${previousRank}→${currentRank}により${rule.promotionLevel}段階昇格`;
  } else if (rule.promotionLevel < 0) {
    reason = `${previousRank}→${currentRank}により${Math.abs(rule.promotionLevel)}段階降格`;
  } else {
    reason = '現状維持';
  }

  return {
    status,
    level: rule.promotionLevel,
    reason,
  };
}

/**
 * 給与調整額を計算
 */
export function calculateSalaryAdjustment(
  rank: RankCode,
  role: Role,
  salaryRules: {
    manager?: { rankA?: number; rankC?: number };
    staff?: { rankA?: number };
  }
): number {
  if (role === 'manager' || role === 'assistant_manager') {
    if (rank === 'A' || rank === 'S') {
      return salaryRules.manager?.rankA ?? 0;
    }
    if (rank === 'C' || rank === 'D' || rank === 'E') {
      return salaryRules.manager?.rankC ?? 0;
    }
  }

  if (role === 'staff') {
    if (rank === 'A' || rank === 'S') {
      return salaryRules.staff?.rankA ?? 0;
    }
  }

  return 0;
}

/**
 * 単純なランク比較での昇降格判定（前回データがない場合用）
 */
export function judgePromotionByRank(
  rank: RankCode,
  role: Role
): PromotionJudgeResult {
  // A以上で昇格候補、C以下で降格候補
  if (rank === 'S' || rank === 'A') {
    return {
      status: 'promote_1',
      level: 1,
      reason: `ランク${rank}により昇格候補`,
    };
  }

  if (rank === 'C' || rank === 'D' || rank === 'E') {
    return {
      status: 'demote_1',
      level: -1,
      reason: `ランク${rank}により降格候補`,
    };
  }

  return {
    status: 'keep',
    level: 0,
    reason: '現状維持',
  };
}
