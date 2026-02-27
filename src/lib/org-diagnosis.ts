// 組織診断ランキングデータ取得
// Google Drive上のstore_rankings.jsonから最新データを取得

export interface StoreRanking {
  store_code: string;
  store_name: string;
  business_type: string;
  score: number;
  response_count: number;
  rank: number;
}

export interface OrgDiagnosisData {
  survey_id: string;
  updated_at: string;
  total_ranking: StoreRanking[];
  pa_ranking: StoreRanking[];
}

// 親フォルダID（組織診断_マスタ/ジュネストリー）
const ORG_DIAGNOSIS_FOLDER_ID = '1uZeyzMhWYmhEt9yKJymFPVJ_gs3-knvQ';

export async function getOrgDiagnosisRanking(): Promise<OrgDiagnosisData | null> {
  try {
    const response = await fetch('/api/org-diagnosis/ranking');
    if (!response.ok) return null;
    const result = await response.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function getStoreRank(
  data: OrgDiagnosisData,
  storeId: string,
  isManager: boolean
): { rank: number; total: number; storeName: string } | null {
  const rankings = isManager ? data.total_ranking : data.pa_ranking;
  const found = rankings.find(r => r.store_code === storeId);
  if (!found) return null;
  return {
    rank: found.rank,
    total: rankings.length,
    storeName: found.store_name
  };
}
