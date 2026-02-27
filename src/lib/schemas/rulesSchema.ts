import { z } from 'zod';
import { RoleSchema } from './employeeSchema';

export const RankRuleSchema = z.object({
  rankCode: z.string().min(1),
  rankLabel: z.string().min(1),
  minScore: z.number(),
  maxScore: z.number(),
  color: z.string(),
  sortOrder: z.number().int(),
  enabled: z.boolean(),
});

export const RankRulesDataSchema = z.object({
  version: z.number().int(),
  effectiveFrom: z.string(),
  updatedAt: z.string(),
  rules: z.array(RankRuleSchema),
});

export const PromotionRuleSchema = z.object({
  roleTarget: RoleSchema,
  promoteCondition: z.string(),
  demoteCondition: z.string(),
  requiredPeriods: z.number().int(),
  minRank: z.string(),
  excludeFlags: z.array(z.string()),
  enabled: z.boolean(),
});

export const PromotionRulesDataSchema = z.object({
  version: z.number().int(),
  updatedAt: z.string(),
  rules: z.array(PromotionRuleSchema),
});

export const QscCategorySchema = z.object({
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  weight: z.number(),
  maxScore: z.number(),
  roleTargets: z.array(RoleSchema),
  enabled: z.boolean(),
  sortOrder: z.number().int(),
});

export const QscRulesDataSchema = z.object({
  version: z.number().int(),
  updatedAt: z.string(),
  categories: z.array(QscCategorySchema),
});

export const RuleTypeSchema = z.enum(['rank', 'promotion', 'qsc']);
