# 定期評価アプリ データファイル仕様

## 概要
このフォルダには定期評価アプリで使用するJSONデータファイルを格納します。

---

## ファイル一覧

### マスタデータ（随時更新）

| ファイル名 | 説明 | ソース元 | 更新タイミング |
|-----------|------|---------|--------------|
| `employees.json` | 社員マスタ | Excelマクロ「★【査定用】定量･定性評価集計」DBシート | 社員情報変更時 |
| `stores.json` | 店舗マスタ | Excelマクロ「店舗マスタ」シート | 店舗追加・変更時 |
| `rank_rules.json` | ランク判定基準 | 手動設定 | ルール変更時 |
| `promotion_rules.json` | 昇格判定基準 | 手動設定 | ルール変更時 |
| `qualitative_categories.json` | 定性評価カテゴリ | 手動設定 | カテゴリ変更時 |
| `app_settings.json` | アプリ設定 | 手動設定 | 設定変更時 |
| `bonus_settings.json` | 賞与設定 | 手動設定 | 設定変更時 |
| `qsc_rules.json` | QSC加点ルール | 手動設定 | ルール変更時 |
| `rule_change_logs.json` | ルール変更履歴 | 自動生成 | ルール変更時 |

### 期間別データ（評価期ごと）

| ファイル名 | 説明 | ソース元 |
|-----------|------|---------|
| `evaluation_results_{期間}.json` | 評価結果（総合） | Excelマクロ「DB」シート + 抽出スクリプト |
| `qualitative_scores_{期間}.json` | 定性評価スコア | Excelマクロ「定性評価データ」シート |
| `quantitative_scores_{期間}.json` | 定量評価スコア | Excelマクロ「定量評価データ」シート |
| `ranking_{期間}.json` | ランキングデータ | 自動計算 |

**期間形式**: `2025_H2`（2025年下期）、`2026_H1`（2026年上期）など

---

## データ作成手順

### 1. Excelマクロからデータ抽出

#### 前提条件
- Python 3.x インストール済み
- openpyxl ライブラリインストール済み（`pip install openpyxl`）

#### 手順

```bash
# 1. 抽出スクリプトのあるディレクトリに移動
cd c:\Users\yasuh\OneDrive\デスクトップ\APP\定量定性

# 2. Excelファイルを閉じた状態で実行
python extract_excel_data.py
```

#### 抽出スクリプトの処理内容
1. `店舗マスタ`シート → `stores.json`
2. `定量評価データ`シート → 月次定量データ（evaluation_resultsに含む）
3. `定性評価データ`シート → 定性評価詳細（evaluation_resultsに含む）
4. `DB`シート → `employees.json`, `evaluation_results_{期間}.json`

### 2. Google Driveへアップロード

```bash
# アップロードスクリプト実行
python upload_to_drive.py
```

---

## evaluation_results_{期間}.json の構造

```json
{
  "period": "2025_H2",
  "generatedAt": "2026-02-27T12:00:00",
  "items": [
    {
      "employeeId": "00001",
      "employeeName": "山田太郎",
      "role": "manager",        // manager or staff
      "storeId": "1102",
      "storeName": "均タロー!大宮店",
      "grade": "G3",
      "rank": "A",
      "totalScore": 350.5,
      "quantitativeScore": 200.0,
      "qualitativeScore": 100.5,
      "monthlyData": [          // 月次定量データ
        {
          "year": 2025,
          "month": 5,
          "storeName": "均タロー!大宮店",
          "mngScore": 210.0
        }
      ],
      "qualitativeDetails": [   // 定性評価詳細
        {
          "category": "理念",
          "itemName": "【理念の共感】",
          "isImportant": true,
          "managerScore": 3.5,  // 店長用
          "finalScore": 3.5     // 一般社員用
        }
      ]
    }
  ]
}
```

---

## 注意事項

### 店長と一般社員の違い
- **店長（manager）**: `quantitativeWeight >= 1.0`
  - 定性評価は `managerScore` を使用
  - 組織診断は `total_ranking` を表示
- **一般社員（staff）**: `quantitativeWeight < 1.0`
  - 定性評価は `finalScore` を使用
  - 組織診断は `pa_ranking` を表示

### 重点項目
- `isImportant: true` の項目は1点以上で2.5倍加点

---

## 関連ファイル

- **抽出スクリプト**: `c:\Users\yasuh\OneDrive\デスクトップ\APP\定量定性\extract_excel_data.py`
- **アップロードスクリプト**: `c:\Users\yasuh\OneDrive\デスクトップ\APP\定量定性\upload_to_drive.py`
- **ソースExcel**: `★【査定用】定量･定性評価集計_ジュネストリー様_.xlsm`

---

## 更新履歴

| 日付 | 内容 |
|-----|------|
| 2026-02-27 | 初版作成 |
