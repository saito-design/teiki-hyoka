# 定期評価アプリ データファイル仕様

## 概要
このフォルダには定期評価アプリで使用するJSONデータファイルを格納します。
データは複数のアプリ・マスタから連携されます。

---

## データソース概要

```
┌─────────────────────────────────────────────────────────────┐
│  企業_マスタ（共有ドライブ）                                   │
│  └─ ジュネストリー様/                                        │
│      ├─ employees.json  ← 社員マスタ                        │
│      └─ stores.json     ← 店舗マスタ                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  定性評価アプリ                                              │
│  └─ 出力:                                                   │
│      ├─ qualitative_categories.json  ← 評価カテゴリ         │
│      └─ qualitative_scores_{期間}.json ← 定性評価スコア     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  定量評価アプリ（作成予定）                                    │
│  └─ 出力:                                                   │
│      └─ quantitative_scores_{期間}.json ← 定量評価スコア    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  定期評価アプリ（本アプリ）                                    │
│  ├─ 入力: 上記すべて                                         │
│  └─ 出力:                                                   │
│      ├─ evaluation_results_{期間}.json ← 評価結果（総合）   │
│      └─ evaluation_results_{期間}.csv  ← CSV出力           │
└─────────────────────────────────────────────────────────────┘
```

---

## ファイル一覧

### 外部連携データ（他アプリ・マスタから取得）

| ファイル名 | 説明 | ソース元 | 共有ドライブ |
|-----------|------|---------|-------------|
| `employees.json` | 社員マスタ | 企業_マスタ | 企業_マスタ/ジュネストリー様/ |
| `stores.json` | 店舗マスタ | 企業_マスタ | 企業_マスタ/ジュネストリー様/ |
| `qualitative_categories.json` | 定性評価カテゴリ | 定性評価アプリ | 定量定性_マスタ/ジュネストリー様/ |
| `qualitative_scores_{期間}.json` | 定性評価スコア | 定性評価アプリ | 定量定性_マスタ/ジュネストリー様/ |
| `quantitative_scores_{期間}.json` | 定量評価スコア | 定量評価アプリ | 定量定性_マスタ/ジュネストリー様/ |

### 本アプリ管理データ

| ファイル名 | 説明 | 管理元 |
|-----------|------|-------|
| `rank_rules.json` | ランク判定基準（S/A/B/C/D/E） | 本アプリで設定 |
| `promotion_rules.json` | 昇格判定基準 | 本アプリで設定 |
| `app_settings.json` | アプリ設定 | 本アプリで設定 |
| `bonus_settings.json` | 賞与設定 | 本アプリで設定 |
| `qsc_rules.json` | QSC加点ルール | 本アプリで設定 |
| `rule_change_logs.json` | ルール変更履歴 | 自動記録 |

### 本アプリ出力データ

| ファイル名 | 説明 | 出力形式 |
|-----------|------|---------|
| `evaluation_results_{期間}.json` | 評価結果（総合） | JSON |
| `evaluation_results_{期間}.csv` | 評価結果（総合） | CSV（外部出力用） |
| `ranking_{期間}.json` | ランキングデータ | JSON |

**期間形式**: `2025_H2`（2025年下期）、`2026_H1`（2026年上期）など

---

## 共有ドライブ構成

```
企業_マスタ（0ALKGxglDUv_vUk9PVA）
└─ ジュネストリー様/（1L_TJrrzfFHDrsYYY83vjzt-jSOs0JNqE）
    ├─ employees.json           # 社員マスタ
    ├─ stores.json              # 店舗マスタ
    └─ store_code_mapping.csv   # 店舗コードマッピング

部下評価_マスタ（定性評価アプリ）
└─ ジュネストリー様/（1DcH7xWR_4INdF8cEfS9KO1TTMA0brw9T）
    └─ 入力データ/（1NIy-sn4pwR9UuyDyQxNPPEu7JXw29E7A）
        └─ exports/（15PP3tY2hDG0qn7olxFPqxIyLggHq2Mqu）
            └─ export_latest_{日時}.csv  # 定性評価スコア

定量評価_マスタ（定量評価アプリ・今後作成）
└─ 株式会社ジュネストリー様/（18_eAXK7sef1laZDsWQCr6gG6msCzJ1fG）
    └─ （定量評価データを配置予定）

定量定性_マスタ（0AEtCE-VntoLuUk9PVA）【本アプリ用】
└─ ジュネストリー様/（14nb4yPZjdg_Ya7yhvLgsfiVXGwmjbfPg）
    ├─ README.md                          # 本ファイル
    ├─ evaluation_results_2025_H2.json    # 本アプリで生成
    ├─ evaluation_results_2025_H2.csv     # 本アプリで生成
    ├─ rank_rules.json                    # 本アプリで管理
    ├─ promotion_rules.json               # 本アプリで管理
    └─ ...
```

### フォルダ・ファイルID一覧（ジュネストリー様）

| 項目 | 共有ドライブ | ID |
|-----|-------------|-----|
| **企業マスタフォルダ** | 企業_マスタ | `1L_TJrrzfFHDrsYYY83vjzt-jSOs0JNqE` |
| └ employees.json | 企業_マスタ | `1tjeEk_z_pU-1oB6FqDvBexEgu99XpUgo` |
| └ stores.json | 企業_マスタ | `1tvdlX073h1jjHgrhFMxs0U6TzgdM936t` |
| └ store_code_mapping.csv | 企業_マスタ | `1PygDvHV2dBrBCT2BLN3RKlxBm8mQtbaN` |
| **定性評価フォルダ** | 部下評価_マスタ | `1DcH7xWR_4INdF8cEfS9KO1TTMA0brw9T` |
| └ exports | 部下評価_マスタ | `15PP3tY2hDG0qn7olxFPqxIyLggHq2Mqu` |
| **定量評価フォルダ（予定）** | 定量評価_マスタ | `18_eAXK7sef1laZDsWQCr6gG6msCzJ1fG` |
| **本アプリデータフォルダ** | 定量定性_マスタ | `14nb4yPZjdg_Ya7yhvLgsfiVXGwmjbfPg` |

---

## 評価計算フロー

```
1. マスタデータ読込
   └─ employees.json, stores.json（企業_マスタから）

2. 評価スコア読込
   ├─ qualitative_scores_{期間}.json（定性評価アプリから）
   └─ quantitative_scores_{期間}.json（定量評価アプリから）

3. ルール読込
   ├─ rank_rules.json
   ├─ promotion_rules.json
   └─ qsc_rules.json

4. 評価計算
   ├─ 定量評価 × ウェイト
   ├─ 定性評価 × ウェイト
   ├─ QSC加点
   └─ 総合点 → ランク判定

5. 結果出力
   ├─ evaluation_results_{期間}.json（Drive保存）
   └─ evaluation_results_{期間}.csv（ダウンロード用）
```

---

## CSV出力仕様（予定）

| 列名 | 説明 |
|-----|------|
| 社員番号 | employeeId |
| 氏名 | employeeName |
| 店舗 | storeName |
| 等級 | grade |
| ランク | rank |
| 総合点 | totalScore |
| 定量点 | quantitativeScore |
| 定性点 | qualitativeScore |
| 社内順位 | companyRank |
| ... | |

---

## 店長と一般社員の違い

| 項目 | 店長（manager） | 一般社員（staff） |
|-----|----------------|-----------------|
| 判定条件 | quantitativeWeight >= 1.0 | quantitativeWeight < 1.0 |
| 定性評価スコア | managerScore | finalScore |
| 組織診断ランキング | total_ranking | pa_ranking |
| 重点項目加点 | 1点以上で2.5倍 | 1点以上で2.5倍 |

---

## 今後の実装予定

- [ ] 企業_マスタからの社員・店舗マスタ自動読込
- [ ] 定性評価アプリとのデータ連携
- [ ] 定量評価アプリとのデータ連携
- [ ] 評価結果のCSV出力機能
- [ ] 評価期間の動的切り替え

---

## 更新履歴

| 日付 | 内容 |
|-----|------|
| 2026-02-27 | 初版作成、データフロー整理 |
