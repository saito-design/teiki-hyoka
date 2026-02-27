/**
 * Google Driveにサブフォルダを作成するスクリプト
 * 実行: npx ts-node scripts/create-folders.ts
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// .env.local を手動で読み込み
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // クォートを除去
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

async function main() {
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

  const drive = google.drive({ version: 'v3', auth });

  // 作成するフォルダ一覧
  const foldersToCreate = [
    { parentId: '0AIhg57jxqqPkUk9PVA', name: 'マリンパレスかごしま様', app: '営業管理マスタ' },
    { parentId: '0AEtCE-VntoLuUk9PVA', name: 'ジュネストリー様', app: '定量定性マスタ' },
    { parentId: '0AJgE39zt1mNfUk9PVA', name: 'ジュネストリー様', app: '部下評価マスタ' },
  ];

  console.log('=== サブフォルダ作成開始 ===\n');

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
        const existingId = existingFolders.data.files[0].id;
        console.log(`[${folder.app}] フォルダ「${folder.name}」は既に存在します`);
        console.log(`  フォルダID: ${existingId}\n`);
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

      console.log(`[${folder.app}] フォルダ「${folder.name}」を作成しました`);
      console.log(`  フォルダID: ${response.data.id}\n`);
    } catch (error) {
      console.error(`[${folder.app}] エラー:`, error);
    }
  }

  console.log('=== 完了 ===');
}

main().catch(console.error);
