import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getDriveClient() {
  const credentialsBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  if (!credentialsBase64) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is not set');
  }

  const credentials = JSON.parse(
    Buffer.from(credentialsBase64, 'base64').toString('utf-8')
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

export async function POST() {
  try {
    const drive = getDriveClient();

    // 作成するフォルダ一覧
    const foldersToCreate = [
      { parentId: '0AIhg57jxqqPkUk9PVA', name: 'マリンパレスかごしま様', app: '営業管理マスタ' },
      { parentId: '0AEtCE-VntoLuUk9PVA', name: 'ジュネストリー様', app: '定量定性マスタ' },
      { parentId: '0AJgE39zt1mNfUk9PVA', name: 'ジュネストリー様', app: '部下評価マスタ' },
    ];

    const results: Array<{
      app: string;
      name: string;
      folderId: string;
      status: 'created' | 'exists' | 'error';
      error?: string;
    }> = [];

    for (const folder of foldersToCreate) {
      try {
        // まず既存フォルダを確認
        const existingFolders = await drive.files.list({
          q: `'${folder.parentId}' in parents and name = '${folder.name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          fields: 'files(id, name)',
        });

        if (existingFolders.data.files && existingFolders.data.files.length > 0) {
          results.push({
            app: folder.app,
            name: folder.name,
            folderId: existingFolders.data.files[0].id!,
            status: 'exists',
          });
          continue;
        }

        // フォルダ作成
        const response = await drive.files.create({
          supportsAllDrives: true,
          requestBody: {
            name: folder.name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [folder.parentId],
          },
          fields: 'id, name',
        });

        results.push({
          app: folder.app,
          name: folder.name,
          folderId: response.data.id!,
          status: 'created',
        });
      } catch (error) {
        results.push({
          app: folder.app,
          name: folder.name,
          folderId: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
