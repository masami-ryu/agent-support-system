# MCP Server (Prototype Skeleton)

最小構成のローカル MCP Server。詳細な設計判断・トレードオフ・リスク・将来計画は ADR (`docs/architecture_decision_record.md`) に一元化しています。本 README は「すぐ使うための最小ガイド」のみを提供します。

> 学習を進めるには: 初心者向けの段階的な背景解説は `docs/mcp_jsonrpc_learning_guide.md` を参照してください。

## 速習セットアップ
前提: Node.js 22+ (LTS) / Yarn v4 (nodeLinker=node-modules)
```bash
yarn install
yarn dev        # 開発 (stdin/stdout JSON-RPC)
yarn typecheck  # 型検査
yarn build      # dist/ 生成
yarn test       # （テストは後続で追加予定）
```

## 初期ツール
| 名前 | 説明 | 呼び出し例 |
|------|------|------------|
| echo | 入力文字列を返す | callTool name=echo args={"text":"hi"} |
| time.now | 現在時刻(ISO) | callTool name=time.now |

## VS Code 設定例
```jsonc
{
  "mcp.servers": [
    {
      "name": "local-mcp",
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": { "LOG_LEVEL": "info" }
    }
  ]
}
```

## よく使うコマンド
| 目的 | コマンド |
|------|----------|
| 依存導入 | `yarn install` |
| 開発実行 | `yarn dev` |
| 型チェック | `yarn typecheck` |
| ビルド | `yarn build` |
| 手動 listTools | `echo '{"method":"listTools","id":"1"}' | node dist/index.js` |

## 簡易トラブルシュート
| 症状 | チェック | 参照 |
|------|----------|------|
| listTools が空 | dist 出力 / パス | ADR: Implementation Plan |
| callTool 失敗 | ツール名 / 引数 JSON | ADR: Validation Flow |
| 遅い | 外部 I/O | ADR: Review Triggers |

## 詳細設計 / セキュリティ / 拡張
重複防止のため、技術選定理由・入力検証・機微情報管理・観測性ロードマップ・リスク/Review Triggers・PnP 再評価条件などは ADR を参照してください。

👉 `docs/architecture_decision_record.md`

## ライセンス / 注意
サンプルは学習用途。運用投入前にセキュリティ/監査要件を確認してください。

---
背景と全判断履歴: `docs/architecture_decision_record.md`
