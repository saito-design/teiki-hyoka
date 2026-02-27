import {
  Employee,
  RankThreshold,
  PromotionRule,
  ManagerQualitativeCategory,
  StaffQualitativeCategory,
  LegacyQualitativeScore,
  LegacyQuantitativeScore,
  LegacyEvaluationResultItem,
  AppSettings,
  RuleType,
  CrossMatrixEntry,
} from '@/lib/types';
import { recalculateAll } from '../calculate';
import { diffResults, ResultDiff } from './diffResults';
import { ImpactSummary } from '@/lib/types';

interface RankRulesInput {
  crossMatrix: CrossMatrixEntry[];
  thresholds: {
    quantitative: RankThreshold[];
    managerQualitative: RankThreshold[];
    staffQualitative: RankThreshold[];
  };
}

interface SimulateInput {
  employees: Employee[];
  qualitativeScores: LegacyQualitativeScore[];
  quantitativeScores: LegacyQuantitativeScore[];
  currentRankRules: RankRulesInput;
  currentPromotionRules: PromotionRule[];
  currentManagerCategories: ManagerQualitativeCategory[];
  currentStaffCategories: StaffQualitativeCategory[];
  draftRankRules?: RankRulesInput;
  draftPromotionRules?: PromotionRule[];
  draftManagerCategories?: ManagerQualitativeCategory[];
  draftStaffCategories?: StaffQualitativeCategory[];
  ruleType: RuleType;
  period: string;
  settings: AppSettings;
}

interface SimulateOutput {
  beforeResults: LegacyEvaluationResultItem[];
  afterResults: LegacyEvaluationResultItem[];
  diffs: ResultDiff[];
  summary: ImpactSummary;
}

/**
 * ルール変更のシミュレーション
 */
export function simulateRuleChange(input: SimulateInput): SimulateOutput {
  const {
    employees,
    qualitativeScores,
    quantitativeScores,
    currentRankRules,
    currentPromotionRules,
    currentManagerCategories,
    currentStaffCategories,
    draftRankRules,
    draftPromotionRules,
    draftManagerCategories,
    draftStaffCategories,
    ruleType,
    period,
    settings,
  } = input;

  // 現行ルールで集計
  const beforeOutput = recalculateAll({
    employees,
    qualitativeScores,
    quantitativeScores,
    rankRules: currentRankRules,
    promotionRules: currentPromotionRules,
    managerCategories: currentManagerCategories,
    staffCategories: currentStaffCategories,
    period,
    settings,
  });

  // ドラフトルールを適用
  let simulatedRankRules = currentRankRules;
  let simulatedPromotionRules = currentPromotionRules;
  let simulatedManagerCategories = currentManagerCategories;
  let simulatedStaffCategories = currentStaffCategories;

  switch (ruleType) {
    case 'rank':
      if (draftRankRules) {
        simulatedRankRules = draftRankRules;
      }
      break;
    case 'promotion':
      if (draftPromotionRules) {
        simulatedPromotionRules = draftPromotionRules;
      }
      break;
    case 'qualitative':
      if (draftManagerCategories) {
        simulatedManagerCategories = draftManagerCategories;
      }
      if (draftStaffCategories) {
        simulatedStaffCategories = draftStaffCategories;
      }
      break;
  }

  // ドラフトルールで集計
  const afterOutput = recalculateAll({
    employees,
    qualitativeScores,
    quantitativeScores,
    rankRules: simulatedRankRules,
    promotionRules: simulatedPromotionRules,
    managerCategories: simulatedManagerCategories,
    staffCategories: simulatedStaffCategories,
    period,
    settings,
  });

  // 差分計算
  const { diffs, summary } = diffResults(
    beforeOutput.evaluationResults.items,
    afterOutput.evaluationResults.items
  );

  return {
    beforeResults: beforeOutput.evaluationResults.items,
    afterResults: afterOutput.evaluationResults.items,
    diffs,
    summary,
  };
}
