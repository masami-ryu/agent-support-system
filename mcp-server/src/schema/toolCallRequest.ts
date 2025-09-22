// クライアントから届く最小限のリクエスト構造を定義する Zod スキーマ。
// JSON-RPC 風だが完全準拠ではなく、必要要素 (id/method/params) のみ採用。
import { z } from 'zod';

export const toolCallRequestSchema = z.object({
  // id: レスポンス相関用。クライアントが付与しない場合は通知的 (fire-and-forget) も可。
  id: z.union([z.string(), z.number()]).optional(),
  // method: "listTools" | "callTool" などの操作識別子。
  method: z.string(),
  // params: メソッドごとに構造が異なるため any。handle 内や各ツールで再バリデーションする。
  params: z.any().optional(),
});
export type ToolCallRequest = z.infer<typeof toolCallRequestSchema>;
