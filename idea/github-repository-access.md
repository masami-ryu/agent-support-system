
# GitHub リポジトリ参照によるエージェント設計支援 (MCP 拡張案)

## 1. 目的 / 背景
AI Agent が MCP Server 経由で GitHub リポジトリのナレッジベースを参照して、オンデマンド活用し、ナレッジ資産の再利用最大化を狙う。

## 2. ゴール
- AI Agent がGitHub リポジトリ内ドキュメントを参照してナレッジとして活用する
- 設計質問に対し抜粋＋要約を返す
- 要約を文書で保存する

## 3. MCP 設定手順

本章では VS Code の Copilot Agent mode から GitHub リポジトリ文書・Pull Request 情報を取得し要約/保存するまでの最短パスを整理する。

### 3.1 前提 / ゴール
- 前提: VS Code (>=1.102 推奨), GitHub Copilot 利用可能, 本リポジトリをローカルで開いている
- ゴール: Agent mode で `github` MCP サーバー経由のツール (PR / file 系) を呼び出し、要約結果をローカル Markdown へ保存できる状態

### 3.2 サーバー追加と認証
最小 `mcp.json` 例 (OAuth 推奨):
```jsonc
{
  "servers": {
    "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" }
  }
}
```
保存→VS Code 再読み込み→OAuth 許可ダイアログで Allow。組織ポリシーで OAuth 不可の場合は PAT を headers で注入 (scope: repo / read:org など最小権限)。

PAT 例 (入力プロンプト利用):
```jsonc
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${input:github_token}" }
    }
  },
  "inputs": [
    { "id": "github_token", "type": "promptString", "description": "GitHub PAT", "password": true }
  ]
}
```

### 3.3 ツール有効化
Agent mode チャット右上のツール一覧から必要最小:
| カテゴリ | 代表ツール | 用途 |
|----------|-----------|------|
| PR | pull requests list/get/diff | PR メタ/差分取得 |
| Repo Files | repo list files / get file | Markdown 取得 |
| Issues (任意) | list issues | 文書化対象 Issue 参照 |
| Filesystem (任意) | writeFile/appendFile | 要約自動保存 |

### 3.4 保存戦略
自動保存を行う場合: Filesystem MCP サーバーを追加し書き込み許可を `docs/` または `reports/` に限定。手動運用開始ならコピー & 保存で十分。
