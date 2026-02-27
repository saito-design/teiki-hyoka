import { EvaluationSheetType } from './employee';

/** 月別定量データ */
export interface MonthlyQuantitativeData {
  year: number;
  month: number;
  storeId: string;
  storeName: string;
  salesActual: number; // 売上実績
  salesTarget: number; // 売上予算
  salesRatio: number; // 達成率
  expenseRatio: number; // 経費率
  expenseTarget: number; // 経費目標
  salesZone: number; // 売上Zone（+1〜+4等）
  mngLevel: number; // Mng水準
  mngScore: number; // Mngスコア
}

/** 定量評価スコア（社員単位） */
export interface QuantitativeScore {
  employeeId: string;
  sheetType: EvaluationSheetType;
  weight: number; // ウェイト（店長1.5、一般0.5等）
  totalMngScore: number; // 期間合計Mngスコア
  averageMngScore: number; // 平均Mngスコア
  qscBonus: number; // QSC加点
  totalScore: number; // 定量評価計（Mngスコア+QSC）
  monthlyData: MonthlyQuantitativeData[];
}

/** 定量評価JSON */
export interface QuantitativeScoresData {
  period: string;
  items: QuantitativeScore[];
}

/** 定性評価項目（店長用） */
export interface ManagerQualitativeItem {
  categoryId: string;
  categoryName: string;
  managerScore: number; // マネジャー評価
  subordinateScore: number; // 部下評価
  finalScore: number; // 最終得点（Mgr0.8+部下0.2 等）
  maxScore: number;
}

/** 定性評価項目（一般社員用） */
export interface StaffQualitativeItem {
  categoryId: string;
  categoryName: string;
  score: number;
  maxScore: number;
}

/** 定性評価スコア */
export interface QualitativeScore {
  employeeId: string;
  sheetType: EvaluationSheetType;
  evaluatorId?: string;
  // 店長用
  managerItems?: ManagerQualitativeItem[];
  managerTotal?: number;
  subordinateTotal?: number;
  // 一般社員用
  staffItems?: StaffQualitativeItem[];
  // 共通
  totalScore: number;
  maxScore: number;
  achievementRate: number; // 達成率
}

/** 定性評価JSON */
export interface QualitativeScoresData {
  period: string;
  items: QualitativeScore[];
}

/** 店長用定性カテゴリID */
export const MANAGER_QUALITATIVE_CATEGORIES = {
  PHILOSOPHY: 'M1', // 理念
  PROBLEM_SOLVING: 'M2', // 課題解決力
  OPERATION: 'M3', // 業務管理
  HR_MANAGEMENT: 'M4', // 人員教育管理
  HUMANITY: 'M5', // 会社が求める人間力
  BASIC_ATTITUDE: 'M6', // 基本姿勢
} as const;

/** 一般社員用定性カテゴリID */
export const STAFF_QUALITATIVE_CATEGORIES = {
  MINDSET: 'S1', // 心構え
  INTERPERSONAL: 'S2', // 対人調整力
  LEADERSHIP: 'S3', // 店長力
  QSC: 'S4', // QSC
  OPERATION: 'S5', // 業務
} as const;

// 後方互換性のための簡易型（旧APIで使用）
export interface LegacyQuantitativeScore {
  employeeId: string;
  metricId: string;
  metricName: string;
  actualValue: number;
  targetValue: number;
  score: number;
  weight: number;
}

export interface LegacyQualitativeScore {
  employeeId: string;
  evaluatorId: string;
  categoryId: string;
  rawScore: number;
  adjustedScore: number;
  comment: string;
}
