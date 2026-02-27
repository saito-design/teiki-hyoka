/** 役職区分 */
export type Role = 'manager' | 'assistant_manager' | 'staff';

/** 評価シート種別（店長用は副店長も使用） */
export type EvaluationSheetType = 'manager' | 'staff';

/** 役職の日本語ラベル */
export const RoleLabels: Record<Role, string> = {
  manager: '店長',
  assistant_manager: '副店長',
  staff: '一般社員',
};

/** 評価シート種別の日本語ラベル */
export const SheetTypeLabels: Record<EvaluationSheetType, string> = {
  manager: '店長用',
  staff: '一般社員用',
};

/** 役職から評価シート種別を取得 */
export function getSheetType(role: Role): EvaluationSheetType {
  // 副店長は店長と同じシートを使用
  return role === 'staff' ? 'staff' : 'manager';
}

/** 社員 */
export interface Employee {
  employeeId: string;
  employeeCode: string;
  name: string;
  nameKana?: string;
  role: Role;
  storeId: string;
  grade?: string; // 等級
  active: boolean;
  joinedAt: string;
  tenure?: number; // 勤続月数
  displayOrder: number;
}

/** 社員マスタJSON */
export interface EmployeesData {
  version: number;
  items: Employee[];
}

/** 店舗 */
export interface Store {
  storeId: string;
  storeCode: string;
  storeName: string;
  brand?: string; // ブランド（均タロー、鶏ヤロー等）
  area: string;
  active: boolean;
  displayOrder: number;
}

/** 店舗マスタJSON */
export interface StoresData {
  version: number;
  items: Store[];
}

/** 評価期間 */
export type PeriodHalf = 'first' | 'second'; // 上期(11-4月) / 下期(5-10月)

/** 評価期間情報 */
export interface EvaluationPeriod {
  year: number;
  half: PeriodHalf;
  label: string; // "2025下期" など
  startMonth: number;
  endMonth: number;
}

/** 期間ラベルを生成 */
export function formatPeriodLabel(year: number, half: PeriodHalf): string {
  return `${year}${half === 'first' ? '上期' : '下期'}`;
}
