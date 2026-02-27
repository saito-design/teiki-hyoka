import { getDriveClient, getRootFolderId } from './client';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * ローカルファイルからJSONを読み込む（開発用）
 */
export async function readJsonFromLocal<T>(fileName: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'data-samples', fileName);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Google DriveからJSONファイルを読み込む
 */
export async function readJsonFromDrive<T>(
  filePathOrId: string,
  isFileId = false
): Promise<T> {
  const drive = getDriveClient();

  let fileId = filePathOrId;

  // ファイルパスの場合、ファイルIDを検索
  if (!isFileId) {
    const rootFolderId = getRootFolderId();
    const fileName = filePathOrId.split('/').pop();

    const response = await drive.files.list({
      q: `name='${fileName}' and '${rootFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (!response.data.files || response.data.files.length === 0) {
      throw new Error(`File not found: ${filePathOrId}`);
    }

    fileId = response.data.files[0].id!;
  }

  // ファイル内容を取得
  const fileResponse = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'text' }
  );

  return JSON.parse(fileResponse.data as string) as T;
}

/**
 * 環境に応じてJSONを読み込む
 */
export async function readJson<T>(fileName: string): Promise<T> {
  const useLocal = process.env.USE_LOCAL_DATA === 'true';

  if (useLocal) {
    return readJsonFromLocal<T>(fileName);
  }

  return readJsonFromDrive<T>(fileName);
}
