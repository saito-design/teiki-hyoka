import { google } from 'googleapis';

let driveClient: ReturnType<typeof google.drive> | null = null;

/**
 * Google Drive APIクライアントを取得
 */
export function getDriveClient() {
  if (driveClient) return driveClient;

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

  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

/**
 * ルートフォルダIDを取得
 */
export function getRootFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!folderId) {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is not set');
  }
  return folderId;
}
