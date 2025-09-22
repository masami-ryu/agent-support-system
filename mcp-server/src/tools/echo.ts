// シンプルなエコーツール: 入力文字列をそのまま返す。
// スキーマ (echoInputSchema) により呼び出し前に検証されるため `echo` 関数内部は型安全。
import { z } from 'zod';

export const echoInputSchema = z.object({
  // text: クライアントが返して欲しい任意文字列。
  text: z.string(),
});
export type EchoInput = z.infer<typeof echoInputSchema>;

export async function echo(args: EchoInput) {
  // 実装は純粋関数 (副作用なし) として設計。将来メトリクス採取等も容易。
  return { text: args.text };
}
