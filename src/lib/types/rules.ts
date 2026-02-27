import { Role, EvaluationSheetType } from './employee';

/** ランクコード */
export type RankCode = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

/** ランク基準（点数テーブル形式） */
export interface RankThreshold {
  rank: RankCode;
  minScore: number;
}

/** 役職・評価種別ごとのランク設定 */
export interface RankRuleSet {
  sheetType: EvaluationSheetType;
  evaluationType: 'quantitative' | 'qualitative' | 'total';
  thresholds: RankThreshold[];
}

/** クロスマトリックス（定量×定性→総合ランク） */
export interface CrossMatrixEntry {
  quantitativeRank: RankCode;
  qualitativeRank: RankCode;
  finalRank: RankCode;
}

/** ランク基準JSON */
export interface RankRulesData {
  version: number;
  updatedAt: string;
  // クロスマトリックス（定量ランク×定性ランク→総合ランク）
  crossMatrix: CrossMatrixEntry[];
  // 閾値テーブル
  thresholds: {
    // 定量（全職種共通）
    quantitative: RankThreshold[];
    // 店長・副店長・定性
    managerQualitative: RankThreshold[];
    // 一般社員・定性
    staffQualitative: RankThreshold[];
  };
  description?: string;
}

/** ランク係数 */
export interface RankCoefficient {
  rank: RankCode;
  coefficient: number;
}

/** 役職係数 */
export interface RoleCoefficient {
  role: Role;
  coefficient: number;
}

/** 賞与計算設定 */
export interface BonusSettings {
  rankCoefficients: RankCoefficient[];
  roleCoefficients: RoleCoefficient[];
  individualRatio: number; // 個人配分率
  storeRatio: number; // 店舗配分率
  otherRatio: number; // その他配分率
}

/** 昇降格ルール */
export interface PromotionRule {
  currentRank: RankCode;
  nextRank: RankCode;
  promotionLevel: number; // 昇降格レベル（2=2段階昇格, 1=1段階昇格, 0=維持, -1=1段階降格）
}

/** 昇降格テーブル */
export interface PromotionRulesData {
  version: number;
  updatedAt: string;
  rules: PromotionRule[];
  // ルール説明
  descriptions: string[];
  // 給与調整（オプション）
  salaryAdjustment?: {
    manager: { rankA: number; rankC: number };
    staff: { rankA: number };
  };
}

/** 店長用・定性評価カテゴリ */
export interface ManagerQualitativeCategory {
  categoryId: string;
  categoryName: string;
  maxScore: number;
  sortOrder: number;
  enabled: boolean;
}

/** 一般社員用・定性評価カテゴリ */
export interface StaffQualitativeCategory {
  categoryId: string;
  categoryName: string;
  maxScore: number;
  sortOrder: number;
  enabled: boolean;
}

/** 定性評価カテゴリ設定 */
export interface QualitativeCategoriesData {
  version: number;
  updatedAt: string;
  managerCategories: ManagerQualitativeCategory[];
  staffCategories: StaffQualitativeCategory[];
}

/** QSC設定（店舗別スコア） */
export interface QscStoreScore {
  storeId: string;
  storeName: string;
  score: number;
  adjustedScore: number; // 加点後スコア
}

/** QSCテーブル */
export interface QscData {
  version: number;
  period: string;
  adjustmentRatio: number; // 加点率（例: 0.3）
  stores: QscStoreScore[];
}

/** ルール種別 */
export type RuleType = 'rank' | 'promotion' | 'qualitative' | 'bonus';

// 後方互換性のためのエイリアス
export type QscRulesData = QualitativeCategoriesData;
