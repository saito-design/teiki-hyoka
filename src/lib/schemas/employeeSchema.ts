import { z } from 'zod';

export const RoleSchema = z.enum(['manager', 'assistant_manager', 'staff']);

export const EmployeeSchema = z.object({
  employeeId: z.string().min(1),
  employeeCode: z.string().min(1),
  name: z.string().min(1),
  role: RoleSchema,
  storeId: z.string().min(1),
  active: z.boolean(),
  joinedAt: z.string(),
  displayOrder: z.number().int(),
});

export const EmployeesDataSchema = z.object({
  version: z.number().int(),
  items: z.array(EmployeeSchema),
});

export const StoreSchema = z.object({
  storeId: z.string().min(1),
  storeCode: z.string().min(1),
  storeName: z.string().min(1),
  area: z.string(),
  active: z.boolean(),
  displayOrder: z.number().int(),
});

export const StoresDataSchema = z.object({
  version: z.number().int(),
  items: z.array(StoreSchema),
});
