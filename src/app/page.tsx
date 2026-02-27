'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common';

interface LoadStatus {
  employees: number;
  stores: number;
  evaluationResults: number;
  period: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LoadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/data/load?period=2025_H2');
      const result = await response.json();

      if (result.success) {
        setStatus({
          employees: result.data.employees.items.length,
          stores: result.data.stores.items.length,
          evaluationResults: 0,
          period: result.data.period,
        });

        // 評価結果も取得
        const evalResponse = await fetch('/api/evaluations?period=2025_H2');
        const evalResult = await evalResponse.json();
        if (evalResult.success) {
          setStatus((prev) =>
            prev
              ? { ...prev, evaluationResults: evalResult.data.items.length }
              : null
          );
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      setError(null);

      const response = await fetch('/api/evaluations/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: '2025_H2' }),
      });

      const result = await response.json();

      if (result.success) {
        await loadData();
        alert('再集計が完了しました');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('再集計に失敗しました');
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        description="評価期のデータ状況と集計実行"
        actions={
          <button
            onClick={handleRecalculate}
            disabled={recalculating || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recalculating ? '再集計中...' : '再集計実行'}
          </button>
        }
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">データを読み込み中...</p>
        </div>
      ) : status ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">対象期</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {status.period}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">社員数</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {status.employees}
              <span className="text-lg text-gray-500">名</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">店舗数</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {status.stores}
              <span className="text-lg text-gray-500">店舗</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">評価結果</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {status.evaluationResults}
              <span className="text-lg text-gray-500">件</span>
            </p>
          </div>
        </div>
      ) : null}

      {/* クイックアクセス */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          クイックアクセス
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/evaluations"
            className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-gray-900">評価一覧</h3>
            <p className="text-sm text-gray-500 mt-1">
              社員ごとの評価結果を確認
            </p>
          </a>

          <a
            href="/rankings"
            className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-gray-900">ランキング</h3>
            <p className="text-sm text-gray-500 mt-1">
              総合・役職別・店舗別の順位
            </p>
          </a>

          <a
            href="/rules"
            className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-gray-900">基準設定</h3>
            <p className="text-sm text-gray-500 mt-1">
              ランク・昇降格基準の変更とシミュレーション
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
