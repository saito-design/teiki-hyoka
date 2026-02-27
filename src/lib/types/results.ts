import { Role, EvaluationSheetType } from './employee';
import { RankCode } from './rules';
import { ManagerQualitativeItem, StaffQualitativeItem, MonthlyQuantitativeData } from './scores';

/** 昇降格ステータス */
export type PromotionStatus = 'promote_2' | 'promote_1' | 'keep' | 'demote_1' | 'demote_2' | 'promote' | 'demote';

/** 前回比較データ */
export interface PreviousPeriodData {
  rank: RankCode | null;
  totalScore: number | null;
  quantitativeScore: number | null;
  qualitativeScore: number | null;
  companyAverage: number | null;
  companyRank: number | null;
}

/** 定量評価詳細（個票用） */
export interface QuantitativeDetail {
  weight: number;
  mngScore: number;
  mngAverage: number;
  qscBonus: number;
  totalScore: number;
  companyAverage: number;
  companyRank: number;
  totalCount: number;
  monthlyData: MonthlyQuantitativeData[];
}

/** 定性評価詳細（個票用） */
export interface QualitativeDetail {
  totalScore: number;
  maxScore: number;
  achievementRate: number;
  companyAverage: number;
  companyRank: number;
  totalCount: number;
  // 店長用
  managerItems?: ManagerQualitativeItem[];
  managerAverage?: number;
  subordinateItems?: ManagerQualitativeItem[];
  subordinateAverage?: number;
  // 一般社員用
  staffItems?: StaffQualitativeItem[];
}

/** 個人評価結果 */
export interface EvaluationResultItem {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  role: Role;
  sheetType: EvaluationSheetType;
  storeId: string;
  storeName: string;
  grade?: string;
  // 総合評価
  totalScore: number;
  rank: RankCode;
  companyAverage: number;
  companyRank: number;
  totalCount: number;
  // 定量評価
  quantitativeScore: number;
  quantitativeRank: number;
  quantitativeDetail: QuantitativeDetail;
  // 定性評価
  qualitativeScore: number;
  qualitativeRank: number;
  qualitativeDetail: QualitativeDetail;
  // 昇降格
  promotionStatus: PromotionStatus;
  promotionReason?: string;
  // 前回データ
  previousPeriod?: PreviousPeriodData;
  // 賞与計算
  bonusCoefficient?: number;
  bonusAmount?: number;
}

/** 評価結果JSON */
export interface EvaluationResultsData {
  period: string;
  generatedAt: string;
  // 店長平均
  managerAverage: number;
  // 一般社員平均
  staffAverage: number;
  items: EvaluationResultItem[];
}

/** ランキング項目 */
export interface RankingItem {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  role: Role;
  storeName: string;
  totalScore: number;
  rank: RankCode;
  position: number; // 順位
}

/** ランキングJSON */
export interface RankingData {
  period: string;
  // 店長ランキング（副店長含む）
  managerRanking: RankingItem[];
  // 一般社員ランキング
  staffRanking: RankingItem[];
  // 全体ランキング
  overallRanking: RankingItem[];
  // 店舗別ランキング
  byStore: Record<string, RankingItem[]>;
}

/** 賞与計算結果 */
export interface BonusCalculationResult {
  employeeId: string;
  employeeName: string;
  role: Role;
  storeName: string;
  totalScore: number;
  rank: RankCode;
  roleCoefficient: number;
  rankCoefficient: number;
  individualScore: number; // 個人総合得点
  adjustment: number; // 調整
  bonusAmount: number; // 個人金額
}

/** 賞与計算JSON */
export interface BonusData {
  period: string;
  totalBudget: number; // 今期原資
  managerAverage: number; // 店長平均
  staffAverage: number; // 一般平均
  items: BonusCalculationResult[];
}

/** 定性評価内訳 */
export interface QualitativeBreakdown {
  categoryId: string;
  categoryName: string;
  score: number;
  maxScore: number;
  comment?: string;
}

/** 定量評価内訳 */
export interface QuantitativeBreakdown {
  metricId: string;
  metricName: string;
  actualValue: number;
  targetValue: number;
  score: number;
  weight: number;
}

// 後方互換性のための型（旧API用）
export interface LegacyEvaluationResultItem {
  employeeId: string;
  role: Role;
  storeId: string;
  totalScore: number;
  quantitativeScore: number;
  qualitativeScore: number;
  rank: string;
  overallRank: number;
  roleRank: number;
  promotionStatus: PromotionStatus;
  promotionReason?: string;
  detail: {
    qualitativeBreakdown?: Array<{
      categoryId: string;
      categoryName: string;
      score: number;
      maxScore: number;
      comment?: string;
    }>;
    quantitativeBreakdown?: Array<{
      metricId: string;
      metricName: string;
      actualValue: number;
      targetValue: number;
      score: number;
      weight: number;
    }>;
  };
}

export interface LegacyEvaluationResultsData {
  period: string;
  generatedAt: string;
  items: LegacyEvaluationResultItem[];
}

export interface LegacyRankingItem {
  employeeId: string;
  rank: number;
}

export interface LegacyRankingData {
  period: string;
  overall: LegacyRankingItem[];
  byRole: Record<Role, LegacyRankingItem[]>;
  byStore: Record<string, LegacyRankingItem[]>;
}
