import { getDriveClient, getRootFolderId } from './client';
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';

/**
 * ローカルファイルにJSONを書き込む（開発用）
 */
export async function writeJsonToLocal<T>(fileName: string, data: T): Promise<void> {
  const filePath = path.join(process.cwd(), 'data-samples', fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Google DriveにJSONファイルを書き込む
 */
export async function writeJsonToDrive<T>(
  fileName: string,
  data: T,
  folderId?: string
): Promise<string> {
  const drive = getDriveClient();
  const rootFolderId = folderId || getRootFolderId();

  // 既存ファイルを検索
  const searchResponse = await drive.files.list({
    q: `name='${fileName}' and '${rootFolderId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const content = JSON.stringify(data, null, 2);
  const stream = Readable.from([content]);

  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    // 既存ファイルを更新
    const fileId = searchResponse.data.files[0].id!;
    await drive.files.update({
      fileId,
      media: {
        mimeType: 'application/json',
        body: stream,
      },
    });
    return fileId;
  } else {
    // 新規作成
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/json',
        parents: [rootFolderId],
      },
      media: {
        mimeType: 'application/json',
        body: stream,
      },
      fields: 'id',
    });
    return response.data.id!;
  }
}

/**
 * 環境に応じてJSONを書き込む
 */
export async function writeJson<T>(fileName: string, data: T): Promise<void> {
  const useLocal = process.env.USE_LOCAL_DATA === 'true';

  if (useLocal) {
    await writeJsonToLocal(fileName, data);
    return;
  }

  await writeJsonToDrive(fileName, data);
}
