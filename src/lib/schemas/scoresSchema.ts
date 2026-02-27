import { z } from 'zod';

export const QualitativeScoreSchema = z.object({
  employeeId: z.string().min(1),
  evaluatorId: z.string().min(1),
  categoryId: z.string().min(1),
  rawScore: z.number(),
  adjustedScore: z.number(),
  comment: z.string(),
});

export const QualitativeScoresDataSchema = z.object({
  period: z.string().min(1),
  items: z.array(QualitativeScoreSchema),
});

export const QuantitativeScoreSchema = z.object({
  employeeId: z.string().min(1),
  metricId: z.string().min(1),
  metricName: z.string().min(1),
  actualValue: z.number(),
  targetValue: z.number(),
  score: z.number(),
  weight: z.number(),
});

export const QuantitativeScoresDataSchema = z.object({
  period: z.string().min(1),
  items: z.array(QuantitativeScoreSchema),
});
