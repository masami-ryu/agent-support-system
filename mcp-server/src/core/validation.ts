// Zod のエラーをクライアントへ返しやすい最小構造へ整形するユーティリティ。
// (大規模化したらここでログ用メタ追加や i18n 変換を挟める拡張ポイントになる)
import { ZodError } from 'zod';

export interface FormattedIssue {
  path: string;
  code: string;
  message: string;
}

export function formatZodError(error: unknown): FormattedIssue[] {
  // 予期しない型 (runtime 例外など) は UNKNOWN としてラップ
  if (!(error instanceof ZodError)) {
    return [{ path: '', code: 'UNKNOWN', message: String(error) }];
  }
  // 各 issue をシリアライズ可能なシンプル形に変換
  return error.issues.map(i => ({
    path: i.path.join('.') || '', // path が空配列の場合はルート要素
    code: i.code,                 // Zod が提供するエラーコード (invalid_type 等)
    message: i.message,           // 人間可読メッセージ
  }));
}
