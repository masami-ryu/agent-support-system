# AIエージェント支援システム

## 概要
AIエージェントを活用したシステム設計・開発支援のためのナレッジベースです。  
AIエージェントが効果的にシステム設計をサポートできるよう、プロンプト指示、ベストプラクティス、設定ガイドなどを体系的に管理しています。

## 目的
- AIエージェントによるシステム設計支援のノウハウの蓄積と共有
- 一貫性のある高品質なAIアシスタンス体験の提供
- システム設計プロセスの効率化と標準化

## 主な機能
- **プロンプト管理**: AIエージェントの役割や言語設定の定義
- **ナレッジ蓄積**: システム設計に関するベストプラクティスの収集
- **設定ガイド**: AIエージェント活用のための環境構築手順

## 対象ユーザー
- システム設計者・開発者
- AIエージェントを活用したい技術者
- プロジェクトマネージャー

## ディレクトリ構成 (概要)

```
agent-support-system/
├── README.md                         # プロジェクト概要（このファイル）
├── instructions/                     # AIエージェント基本ポリシー
│   ├── role.md                       # 役割定義 (シニアソフトウェアエンジニア等)
│   └── language.md                   # 日本語出力 / コード識別子扱い
├── docs/                             # ナレッジ & レビュー運用ドキュメント
│   ├── review_guide.md               # コードレビュー観点ガイド
│   ├── review_prompts.md             # 観点別プロンプトテンプレ集
│   ├── agent_review_usage.md         # プロンプト活用手順 / 運用リズム
│   └── (将来) pattern_*.md など      # 設計パターン / 事例
└── mcp-server/                       # MCP Server (Node.js + TypeScript) プロトタイプ
    ├── README.md                     # Quick Start
    └── docs/
        ├── architecture_decision_record.md  # 技術選定と将来計画 (ADR)
        └── mcp_jsonrpc_learning_guide.md    # MCP / JSON-RPC 学習ガイド
```

### instructions/
AIエージェントが参照する基本設定とルールを定義します。
- `role.md`: エージェントの専門性と役割（現在：シニアソフトウェアエンジニア）
- `language.md`: 日本語レスポンスの設定とコード識別子の取り扱い規則

### mcp-server/
ローカルで動作する最小 MCP Server の実装です。以下の 3 層でドキュメントを段階化しています。
1. `mcp-server/README.md`: すぐ試すための最小手順
2. `mcp-server/docs/mcp_jsonrpc_learning_guide.md`: MCP/JSON-RPC の基礎と拡張アイデアを段階的に理解
3. `mcp-server/docs/architecture_decision_record.md`: 技術選定とリスク/将来拡張の正式記録

### docs/ (ルート)
レビューと設計ナレッジの中核。現時点で以下を整備済み:
- `review_guide.md`: 重大度接頭辞・観点チェックリスト・指摘記法基準
- `review_prompts.md`: 自動レビュー向け統一プロンプト (日本語出力強制ラッパ含む)
- `agent_review_usage.md`: 利用シーン別の投入タイミング / スコープ絞り込み例 / FAQ

今後追加予定:
- 設計パターン (`pattern_*.md`)
- 失敗事例集 / アンチパターン (`anti_pattern_*.md`)
- プロンプト品質評価指標と改善サイクルガイド

## 利用開始フロー (推奨)
1. ポリシー読込: `instructions/role.md` と `instructions/language.md` をエージェントへ提示
2. レビュー基盤理解: `docs/review_guide.md` を通読し接頭辞/観点を把握
3. 自動レビュー準備: `docs/review_prompts.md` の基本プロンプトを PR テンプレ or スニペットへ登録
4. 運用手順習得: `docs/agent_review_usage.md` で投入タイミングとスコープ絞り込みを把握
5. 実行: Draft PR 作成 → 基本プロンプト投入 → 指摘反映 → 観点別追加プロンプト
6. 拡張学習: `mcp-server/README.md` & `mcp_jsonrpc_learning_guide.md` でツール追加方法を理解
7. アーキ背景参照: `architecture_decision_record.md` で設計判断と将来方針を確認
8. 運用改善: 指摘ログを蓄積し頻出/冗長指摘を `review_prompts.md` にフィードバック

## 今後の計画 (Backlog 抜粋)
### ドキュメント/ナレッジ
- [ ] システム設計パターン集 (`docs/pattern_*.md`)
- [ ] アンチパターン / 失敗事例集 (`docs/anti_pattern_*.md`)
- [ ] プロンプト品質評価指標 (再現率 / 過剰指摘率 / 平均修正リードタイム)
- [ ] 自動リンク検証 & 日本語出力ポリシー CI (Markdown lint + regex)

### MCP Server 技術面
- [ ] Vitest 導入 & 基本正常/異常系テスト
- [ ] CI ワークフロー (lint / test / type-check)
- [ ] 観測性: 構造化ログ → 実行時間メトリクス → トレーシング
- [ ] 動的ツールロード & JSON Schema エクスポート
- [ ] Rate limit / エラー分類拡張

### 運用改善
- [ ] プロンプト差分品質レビューの定期集計 (週次)
- [ ] 指摘クラスター分析によるテンプレ最適化
- [ ] フィードバックループ: PR マージ後 post-mortem テンプレ追加

## 貢献方法
1. Issue / PR: 目的 (Problem) / 変更概要 (Change) / 期待効果 (Impact) を簡潔に記述
2. 恒久的な設計判断は `architecture_decision_record.md` に ADR 追記
3. 可能な限りテスト (正常/境界/異常) と再現手順を添付
4. プロンプト/ガイド改善は `[docs]` 接頭辞で PR タイトル開始
5. 大規模変更は分割方針 (Split Plan) を最初のコメントに含める

## ライセンス
このプロジェクトのライセンスは組織ポリシーに従います。個別ライブラリのライセンス衝突が懸念される場合は事前に法務/OSS 担当へ確認してください。
