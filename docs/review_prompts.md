# AI Agent レビュー用プロンプト集

> 具体的な操作手順は [./agent_review_usage.md](./agent_review_usage.md) を参照してください。

AI Agent による自動レビューを促進するためのプロンプト例集です。  
プロンプト入力は英語主体ですが、最終出力は常に **自然な日本語** に統一してください。

---
## 出力ラッパ (必ず先頭に付与推奨)
以下の指示文 (または類似表現) を任意プロンプトの先頭に付けることで、日本語の出力を強制し、秘密情報を出力を禁止します。
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
```

---
## 基本 (差分全体レビュー)
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Tasks:
1. List high severity issues with prefix [must].
2. List potential security concerns with prefix [sec].
3. List performance risks with prefix [perf].
4. Suggest test gaps with prefix [test].
5. Use concise bullet points, one issue per line. Avoid style nitpicks. Ignore vendor/, *.lock, and pure formatting changes.
Return sections: MUST, SECURITY, PERFORMANCE, TESTS, OTHERS.
Limit to top 12 findings.
```

## 変更概要の要約生成
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Task focus: Summarize this change for a CHANGELOG entry.
```

## セキュリティ特化
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Application security findings.
Scan for:
- missing input validation
- injection risks (SQL/command/template)
- hard-coded secrets
- improper authZ/authN checks
- unsafe crypto usage
Output bullets prefixed with [sec]. If none: 'No critical security risks detected.'
```

## パフォーマンス特化
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Performance risk identification.
Focus on: N+1 queries, redundant loops, large allocations, blocking sync I/O in hot paths.
Prefix each with [perf] + concrete improvement suggestion.
```

## テストギャップ特化
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Missing / weak test identification.
Categories to check: boundary conditions, error handling, concurrency, large input, regression.
Output: Markdown checklist, each line prefixed with [test].
```

## リファクタ提案
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Refactoring opportunities only (no formatting nits).
Rules: avoid style reformat, target logic simplification, duplication removal, better naming, extract funcs (>40 lines or >3 nest levels).
Prefix each with [imo].
```

## リスク & ロールバック評価
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Deployment risks & rollback.
Return sections: RISKS, ROLLBACK_STRATEGY, MONITORING_METRICS.
If DB/schema irreversible steps: prefix with [must].
```

## ログ・監視改善
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Observability gaps.
Suggest missing logs (level + intent), metrics, traces.
Prefix required production visibility gaps with [must], suggestions with [imo].
```

## 依存関係追加チェック
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Dependency additions / upgrades.
Assess: unnecessary bloat, known vulnerable categories, duplication of existing capability.
Prefix concerns with [must] (blocker) or [sec] (security) as appropriate.
```

## Diff ノイズ削減提案
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Noisy / unrelated changes separation.
Identify format-only, commented-out code, purely unused removals -> list with [nits].
```

## 既存ガイド整合性チェック
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Category alignment matrix.
Output table: Category | Status (OK / Review) | Note.
Mark 'Review' only where actionable feedback exists.
```

## 大規模PR分割提案
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Logical split plan (PR seems large / multi-purpose).
Propose 2-5 parts. For each: Name, Scope, Dependencies, Risk Level.
```

## 英語→日本語要約
```
Always return the final answer strictly in natural Japanese. Keep code identifiers and proper nouns in original language. Do not add extra English commentary. Do not echo secrets, tokens, or credentials.
You are a senior software engineer. Review the diff between the current branch and the base branch HEAD.
Refer to docs/review_guide.md and align wording with its categories.
Task focus: Summarize prefixed review issues into concise Japanese bullets.
Group order: [must], [sec], [perf], [test], others.
```

---
## カスタマイズガイドライン
- プロンプトは "You are ..." で役割を明示すると精度↑
- 出力フォーマット (sections / table / checklist) を具体化
- ノイズ削減: "Ignore code style / formatting differences" を追加可
- 長大 PR の場合は範囲指定: "Focus on files under src/service/" など

## よくある失敗と対策
| 問題 | 対策例 |
|------|--------|
| 過度なnits指摘 | "Avoid stylistic nitpicks" を含める |
| 要点が散漫 | セクション順序を明示 |
| 冗長出力 | 最大件数 / 文字数制限指定 |
| 不正確なセキュリティ指摘 | "Only flag realistically exploitable issues" を追加 |

---
改善提案歓迎: このファイルに対する更新PRでは `[docs]` プレフィックスを付けてください。
