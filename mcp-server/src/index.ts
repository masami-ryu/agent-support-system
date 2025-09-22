// メインエントリ: stdin から 1 行ずつ JSON を受け取り、
// Zod でバリデーション後ツールをディスパッチして結果を stdout へ返す。
// 最低限の JSON-RPC 風 (id / method / params) 形を扱うシンプル実装。
import { toolCallRequestSchema, ToolCallRequest } from './schema/toolCallRequest.js';
import { formatZodError } from './core/validation.js';
import { echo, echoInputSchema } from './tools/echo.js';
import { timeNow } from './tools/time.js';

// クライアントへ公開するツール情報の最小表現。
// description や inputSchema の詳細は今後 JSON Schema へ変換し公開する拡張余地あり。
interface ToolDescriptor {
  name: string;            // ツール呼び出し名 (例: "echo", "time.now")
  description: string;     // 簡易説明 (ここでは name をそのまま流用)
  inputSchema?: unknown;   // 現状は "zod" のようなプレースホルダ文字列
}

// 実際のツール実装を登録するレジストリ。
// 今後: 各ツールを動的ロード (ファイル走査) や DI コンテナ化することも可能。
const tools: Record<string, { run: (args: any) => Promise<any>; inputSchema?: any }> = {
  'echo': { 
    // echo ツール: 入力をそのまま返す。ここで再度 zod.parse して型安全を担保。
    run: (args) => echo(echoInputSchema.parse(args)),
    inputSchema: echoInputSchema,
  },
  'time.now': { 
    // 現在時刻を ISO8601 形式で返す副作用なしツール。
    run: () => timeNow() 
  },
};

// ツール一覧をクライアントへ返すための整形関数。
function listTools(): ToolDescriptor[] {
  return Object.entries(tools).map(([name, t]) => ({
    name,
    description: name,                  // 今は簡略化 (将来的に説明文を別管理)
    inputSchema: t.inputSchema ? 'zod' : undefined, // スキーマ提供の存在だけ示す
  }));
}

// 単一リクエスト (既に Zod で基本構造は検証済み) を処理しレスポンスオブジェクトを返却。
async function handle(message: ToolCallRequest) {
  if (message.method === 'listTools') {
    return { id: message.id, result: { tools: listTools() } };
  }
  if (message.method === 'callTool') {
    const { name, args } = (message as any).params || {};
    if (!name || typeof name !== 'string') {
      return { id: message.id, error: { code: 'BAD_REQUEST', message: 'params.name required' } };
    }
    const tool = tools[name];
    if (!tool) {
      return { id: message.id, error: { code: 'NOT_FOUND', message: `tool ${name} not found` } };
    }
    try {
      const result = await tool.run(args);
      return { id: message.id, result };
    } catch (e: any) {
      return { id: message.id, error: { code: 'TOOL_ERROR', message: e.message || String(e) } };
    }
  }
  return { id: message.id, error: { code: 'METHOD_NOT_FOUND', message: message.method } };
}

// JSON.parse 失敗時に例外を投げず null を返して後続で一律エラーハンドリング。
function safeJSONParse(line: string): any {
  try { return JSON.parse(line); } catch { return null; }
}

// メインループ: 非同期反復で標準入力を行単位で読み込む。
// 1. 空行はスキップ
// 2. JSON パース失敗 -> PARSE_ERROR
// 3. Zod 構造検証失敗 -> VALIDATION_ERROR (issues 配列)
// 4. 正常時 handle() を呼んで結果をそのまま stdout へ JSON ライン書き出し
async function main() {
  process.stdin.setEncoding('utf-8');
  for await (const line of process.stdin) {
    const trimmed = line.trim();
    if (!trimmed) continue; // 空行は無視

    const raw = safeJSONParse(trimmed);
    if (!raw) {
      process.stdout.write(
        JSON.stringify({ error: { code: 'PARSE_ERROR', message: 'invalid json' } }) + '\n'
      );
      continue;
    }

    let request: ToolCallRequest;
    try {
      request = toolCallRequestSchema.parse(raw);
    } catch (e) {
      process.stdout.write(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', issues: formatZodError(e) } }) + '\n'
      );
      continue;
    }

    const response = await handle(request);
    process.stdout.write(JSON.stringify(response) + '\n');
  }
}

// エントリポイント: 予期しない例外は fatal ログを出して非ゼロ終了。
main().catch(err => {
  console.error('fatal', err);
  process.exit(1);
});
