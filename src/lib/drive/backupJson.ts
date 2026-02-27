import { getDriveClient, getRootFolderId } from './client';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * ローカルでバックアップを作成（開発用）
 */
export async function backupJsonLocal(fileName: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `${fileName.replace('.json', '')}_${timestamp}.json`;
  const backupDir = path.join(process.cwd(), 'data-samples', 'backups');

  // バックアップディレクトリを作成
  await fs.mkdir(backupDir, { recursive: true });

  const sourcePath = path.join(process.cwd(), 'data-samples', fileName);
  const backupPath = path.join(backupDir, backupFileName);

  await fs.copyFile(sourcePath, backupPath);
  return backupPath;
}

/**
 * Google Driveでバックアップを作成
 */
export async function backupJsonToDrive(fileName: string): Promise<string> {
  const drive = getDriveClient();
  const rootFolderId = getRootFolderId();

  // バックアップフォルダを検索/作成
  let backupFolderId: string;
  const folderSearch = await drive.files.list({
    q: `name='backups' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive',
  });

  if (folderSearch.data.files && folderSearch.data.files.length > 0) {
    backupFolderId = folderSearch.data.files[0].id!;
  } else {
    const folderResponse = await drive.files.create({
      requestBody: {
        name: 'backups',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId],
      },
      fields: 'id',
    });
    backupFolderId = folderResponse.data.id!;
  }

  // 元ファイルを検索
  const fileSearch = await drive.files.list({
    q: `name='${fileName}' and '${rootFolderId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (!fileSearch.data.files || fileSearch.data.files.length === 0) {
    throw new Error(`File not found: ${fileName}`);
  }

  const originalFileId = fileSearch.data.files[0].id!;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `${fileName.replace('.json', '')}_${timestamp}.json`;

  // ファイルをコピー
  const copyResponse = await drive.files.copy({
    fileId: originalFileId,
    requestBody: {
      name: backupFileName,
      parents: [backupFolderId],
    },
    fields: 'id',
  });

  return copyResponse.data.id!;
}

/**
 * 環境に応じてバックアップを作成
 */
export async function backupJson(fileName: string): Promise<string> {
  const useLocal = process.env.USE_LOCAL_DATA === 'true';

  if (useLocal) {
    return backupJsonLocal(fileName);
  }

  return backupJsonToDrive(fileName);
}
