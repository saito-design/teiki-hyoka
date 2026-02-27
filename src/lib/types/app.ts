/** 丸め処理モード */
export type RoundingMode = 'round' | 'floor' | 'ceil';

/** アプリ設定 */
export interface AppSettings {
  version: number;
  roundingMode: RoundingMode;
  tieBreakOrder: string[];
  defaultPeriod: string;
  allowPopupWindows: boolean;
}

/** 期間情報 */
export interface PeriodInfo {
  periodId: string;
  label: string;
  startDate: string;
  endDate: string;
}

/** API共通レスポンス */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** データ読込状況 */
export interface DataLoadStatus {
  employees: boolean;
  stores: boolean;
  rankRules: boolean;
  promotionRules: boolean;
  qscRules: boolean;
  qualitativeScores: boolean;
  quantitativeScores: boolean;
  evaluationResults: boolean;
  lastUpdated?: string;
}
