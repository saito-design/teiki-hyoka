import { NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';

// 組織診断ランキングファイルの親フォルダID
const ORG_DIAGNOSIS_FOLDER_ID = '1uZeyzMhWYmhEt9yKJymFPVJ_gs3-knvQ';
const RANKING_FILE_NAME = 'store_rankings.json';

export async function GET() {
  try {
    const drive = getDriveClient();

    // フォルダ内でstore_rankings.jsonを検索
    const listRes = await drive.files.list({
      q: `'${ORG_DIAGNOSIS_FOLDER_ID}' in parents and name='${RANKING_FILE_NAME}' and trashed=false`,
      fields: 'files(id, name, modifiedTime)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'modifiedTime desc',
    });

    const files = listRes.data.files || [];
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ranking file not found' },
        { status: 404 }
      );
    }

    const fileId = files[0].id!;

    // ファイル内容を取得
    const getRes = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'text' }
    );

    const content = getRes.data as string;
    // BOM除去
    const cleanContent = content.replace(/^\uFEFF/, '');
    const data = JSON.parse(cleanContent);

    return NextResponse.json({
      success: true,
      data,
      fileId,
      modifiedTime: files[0].modifiedTime,
    });
  } catch (error) {
    console.error('Failed to fetch org diagnosis ranking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ranking data' },
      { status: 500 }
    );
  }
}
