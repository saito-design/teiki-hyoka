import { RuleType } from './rules';

/** ルール変更アクション */
export type RuleChangeAction = 'simulate' | 'apply' | 'discard' | 'rollback';

/** 影響サマリ */
export interface ImpactSummary {
  changedEmployees: number;
  rankUpCount?: number;
  rankDownCount?: number;
  promoteCount?: number;
  demoteCount?: number;
}

/** ルール変更ログ */
export interface RuleChangeLog {
  logId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  ruleType: RuleType;
  action: RuleChangeAction;
  reason: string;
  beforeSnapshot: Record<string, unknown>;
  afterSnapshot: Record<string, unknown>;
  impactSummary: ImpactSummary;
  applied: boolean;
}

/** ルール変更ログJSON */
export interface RuleChangeLogsData {
  items: RuleChangeLog[];
}
