<!--
	ADR Format inspired by Michael Nygard's template.
	1つのファイルに複数決定を積み上げるのではなく、将来的には `adr/NNN-<slug>.md` へ分割可能。
-->

# ADR-001: 技術スタック (Node.js + TypeScript + Yarn) と スキーマバリデーション方針 (Zod 採用 / Yarn PnP 不採用)

| 項目 | 値 |
|------|----|
| ステータス | Accepted |
| 日付 | 2025-09-22 |
| 変更対象領域 | MCP Server 実装基盤 |
| 関連チケット | (追記予定) |

## 1. 背景 / Context
本プロジェクトでは VS Code Agent Mode (MCP クライアント) から利用されるローカル MCP Server を実装する。  
サーバーは以下を満たす必要がある:  
* 高速な起動 (サブ 1 秒)
* 安定した JSON-RPC 風メッセージ処理 (標準入力/標準出力)
* 拡張容易な Tool 定義 (listTools / callTool)
* 将来的な観測性 (ログ構造化, メトリクス, トレース) の拡張性
* スキーマ検証による堅牢性 (クライアント / サーバー間の破損パケット排除)

過去の既存知見は Node.js / TypeScript / Yarn に集中しており、学習コスト最小化と開発速度最大化を重視する。

## 2. 決定 / Decision
1. 実行ランタイム: Node.js (LTS 22 系想定) ※ 22 での計測 (起動/互換性) 良好のため 20 から更新
2. 言語: TypeScript (strict モード)
3. パッケージマネージャー: Yarn v4 (Berry, nodeLinker=node-modules) – 広範ツール互換性優先 (PnP は現段階見送り)
4. スキーマバリデーション: Zod によるスキーマ & ランタイム検証 + 推論型活用。必要に応じ JSON Schema 生成パイプラインを後続検討。
5. ディレクトリ構成(初期案):
	 ```
	 mcp-server/
		 src/
			 index.ts         # エントリ (stdin/stdout ループ)
			 tools/
				 echo.ts
				 time.ts
			 schema/
				 request/
				 response/
			 core/
				 rpc.ts         # JSON-RPC 風ラッパ
				 validation.ts  # Zod 周りの共通ユーティリティ (エラーフォーマット等)
		 test/
		 package.json
		 yarn.lock
	 ```
6. ログ: 簡易段階では `console.*`、後続で pino 等へ差し替え可能な薄いラッパを抽象層として用意。
7. エラーハンドリング: ツールレベルで `Result<T, ErrorShape>` パターン or 例外捕捉し統一 JSON 形へ変換。

## 3. 主要な選定理由 / Rationale
| 領域 | 採用 | 理由 |
|------|------|------|
| ランタイム | Node.js | コールドスタート短・チーム知見・VS Code/拡張エコシステム親和性 |
| 言語 | TypeScript | 型安全・補完生産性・潜在不具合の早期検出 |
| パッケージ管理 | Yarn v4 | 既存知見 / ワークスペース管理 / Zero-Install(任意) / 互換性重視 |
| スキーマ検証 | Zod | スキーマ=型定義一元化 / DX 向上 / 推論容易 |
| 型生成 | (不要/最小) Zod 推論型 | 宣言重複を排し型と検証を同一DSLで管理 |
| ログ | ラッパ層 + (将来) pino | 初期軽量→拡張性確保 |

## 4. 代替案 / Considered Alternatives
| 領域 | 代替 | 採用しなかった理由 |
|------|------|--------------------|
| ランタイム | Python | チーム TypeScript 中心・依存解決/配布の一貫性に劣る (Yarn PnP 活用困難) |
| パッケージ管理 | npm | Lockfile 再現性/ワークスペース管理で Yarn v4 の利点を優先 |
| パッケージ管理 | pnpm | 高速かつ良案だが既存資産(Yarn Berry設定)と方針統一を優先 |
| スキーマ検証 (旧) Ajv | JSON Schema 記述冗長 / 型との二重化コスト / DSL 学習負担 |
| スキーマ検証 | 自前実装 | 保守・網羅性・バグリスク高い |
| JSON Schema + 生成ツールチェーン | 型同期に追加工程が必要 (Zod で簡潔化) |
| 言語 | JavaScript (ESM) | 型安全欠如／コードベース規模拡大時の回帰リスク増 |

## 5. 詳細設計インパクト / Architecture Impact
* Zod スキーマを単一ソース (contract) とし、`src/schema/` に TypeScript ファイルとして配置
* RPC メッセージパイプライン: parse → zod.parse(request) → dispatch(tool) → zod.parse(response) → serialize
* JSON Schema 互換エクスポートが必要になった段階で `zod-to-json-schema` 等導入検討
* `node_modules` を生成しツール互換性を優先 (PnP は互換性マトリクス整備後に再評価)
* 観測性導入時は validation/error をフックしメトリクス増設容易

## 6. セキュリティ考慮 / Security Considerations
| 項目 | 方針 |
|------|------|
| 入力検証 | 全外部入力(JSON) を Zod スキーマで同期検証; 失敗時は早期エラー返却 |
| 機微情報 | `.env` で受領しログへ出力禁止 (マスキング) |
| DoS 耐性 | ペイロードサイズ上限 (例: 256KB) + ツール実行タイムアウト |
| 依存性 | `yarn constraints` / Renovate で定期更新監視 |
| ログ | PII / secrets を除去するフィルタ層 |

## 7. トレードオフ / Trade-offs
| 選択 | 得られる利点 | コスト/デメリット |
|------|--------------|------------------|
| TypeScript | バグ削減 | ビルド / 型チェック時間 |
| Zod | 型/スキーマ一元化・記述量削減 | JSON Schema エコシステム(直接再利用)には変換が必要 |
| Yarn (node_modules) | 広範互換性 / 直感的構造 | PnP 比わずかに解決遅延 / ディスク使用量増 |
| Yarn PnP (不採用) | 厳格解決 / 高速 / node_modules 不要 | 一部ツール非対応・学習コスト・デバッグ難 |
| Zod シングルトン読み込み | 検証高速 | スキーマ肥大時の初期ロードメモリ増 |

## 8. 導入計画 / Implementation Plan
1. Yarn v4 設定 (`.yarnrc.yml` に `nodeLinker: node-modules` 明示)
2. TypeScript 初期設定 (`tsconfig.json` strict, moduleResolution node16/nodeNext)
3. `src/schema/` に Zod スキーマ (`toolCallRequestSchema` など) 配置
4. 最初のツール: `echo` / `time.now` 実装 & Zod スキーマ定義
5. RPC ループ実装 (`index.ts`): stdin → JSON parse → zod.parse → dispatch
6. ログラッパ導入 (後で pino へ差し替え可能なインターフェース)
7. 基本テスト (正常系/スキーマエラー/未知ツール) 作成
8. CI (lint + type-check + test)

## 9. スキーマバリデーション詳細
```mermaid
flowchart LR
	A[Raw JSON Input] --> B[Parse(JSON.parse)]
	B --> C{Zod parse (request)}
	C -->|ok| D[Dispatch Tool]
	C -->|err| E[Validation Error]
	D --> F{Zod parse (response)}
	F -->|ok| G[Send Response]
	F -->|err| E
```

### 推奨パターン (擬似コード)
```ts
import { toolCallRequestSchema } from '../schema/toolCallRequest';
import { formatZodError } from '../core/validation';

let request;
try {
  request = toolCallRequestSchema.parse(msg);
} catch (e: any) {
  return error({ type: 'VALIDATION_ERROR', issues: formatZodError(e) });
}
```

`formatZodError` は `ZodError` の `issues` をクライアント向け (path / code / message) の最小形へ整形する薄い関数を想定。

## 10. 計測と将来拡張 / Observability & Future
| フェーズ | 追加予定 |
|----------|----------|
| 初期 | 構造化ログ (JSON) |
| 次 | メトリクス (実行数 / 失敗数 / レイテンシ) |
| 中期 | OpenTelemetry Trace (span: validation / dispatch) |
| 中長期 | ツールごとの SLA / レート制御 |

## 11. 見直し条件 / Review Triggers
以下の条件が満たされた場合、本 ADR を再評価する:
* パフォーマンス指標: p95 レイテンシが 500ms 超過 (ツール内部遅延除く)
* 新規ツール数が 30 を超えスキーマ定義重複が増加
* 依存解決/インストール時間 または ディスク使用量が許容閾値超過 (例: クリーンインストール > 90s もしくは `node_modules` > 1GB)
* PnP / 代替パッケージマネージャ (pnpm 等) の互換性マトリクス (必須ツール & CI 100%) が整備され、インストール/解決時間 20% 以上の改善見込み
* JSON Schema では表現困難な複雑な相互依存バリデーションが増大

## 12. 既知のリスク / Known Risks
| リスク | 緩和策 |
|--------|--------|
| 依存サイズ増大 (`node_modules`) | 定期的な depcheck / unused パッケージ削除 / Renovate で健全性維持 |
| 将来 PnP 再導入時の移行コスト | 互換性マトリクス作成 → 段階的ブランチで検証 / canary 導入 |
| Zod スキーマ肥大 | スキーマ分割 + compose(`z.object({...})`) 再利用 |
| 型 / スキーマ二重管理 | Zod により基本的に解消 |
| ログ過多 | ログレベル階層 + サンプリング |

## 13. 採用後の状態 / Consequences
肯定的:
* 早期不正検知によりクライアントとの整合性問題を局所化
* 型安全 + スキーマ検証の二層で信頼性向上
* Yarn v4 + node_modules により幅広いツール/プラグイン互換性とデバッグ容易性

負の側面:
* 初期の Zod への移行コスト (既存 Ajv 設計から再定義)
* Zod エラーオブジェクト整形の追加実装
* node_modules 方式は PnP 比でインストール/解決がわずかに遅くディスク使用量も増大
* 将来 PnP (または pnpm) へ移行する場合に再検証コストが発生

## 14. 将来検討事項 / Future Work
* JSON Schema 生成 (必要時 `zod-to-json-schema`) パイプライン導入
* ツール実装テンプレート (スキーマ + 型 + テスト) 自動生成 CLI
* 観測性統合 (OTel Collector 経由)
* セキュアチャネル (mTLS / 署名検証)
* 互換性マトリクス (lint / test / VSCode 拡張 / OTel / pino) に基づく Yarn PnP / pnpm 再評価
* 依存ツリーサイズ & インストール時間の継続計測 (閾値逸脱時に Review Trigger 発火)

## 15. 参考 / References
* Zod: https://github.com/colinhacks/zod
* zod-to-json-schema: https://github.com/StefanoMagrassi/zod-to-json-schema
* JSON Schema: https://json-schema.org/
* Yarn Berry: https://yarnpkg.com/
* Architecture Decision Records: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions

## 16. ステータス変更履歴 / History
| 日付 | 変更 | 備考 |
|------|------|------|
| 2025-09-22 | 初版作成 | Accepted |
| 2025-09-22 | スキーマ戦略を Ajv -> Zod に変更 | 型/スキーマ一元化 & DX 向上 |
| 2025-09-22 | Yarn PnP 採用計画を撤回し node_modules 運用へ更新 | 互換性優先 (CI / ツールチェーン) |
| 2025-09-23 | Node.js LTS 想定を 20 → 22 へ更新 | 22 安定化・起動/互換性検証済 |

## 17. 次のアクション / Next Actions
| No | アクション | 優先度 | 期限(目安) |
|----|-----------|--------|-------------|
| 1 | 基本ディレクトリ/TS/ツール雛形初期化 | High | 1週間 |
| 2 | Zod スキーマ基盤 (validation ユーティリティ) | High | 1週間 |
| 3 | CI (lint/type/test) パイプライン | Medium | 2週間 |
| 4 | スキーマ自動生成調査 | Low | Backlog |
| 5 | 観測性構想ドラフト | Low | Backlog |

---
この ADR はプロジェクト構造が大幅に変化するか、上記レビュー条件のいずれかが発火した時に改訂される。
