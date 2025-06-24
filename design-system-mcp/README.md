# nishiken-ui MCP Server

nishiken-ui デザインシステム用のModel Context Protocol (MCP) サーバーです。CursorやClaude Desktopで、デザインシステムのコンポーネントやデザイントークンに直接アクセスできます。

## 概要

このMCPサーバーは以下の機能を提供します：

- **コンポーネント検索** - デザインシステムからコンポーネントを検索
- **コンポーネントコード取得** - 完全なコンポーネントコードの取得
- **デザイントークン取得** - カラー、スペーシングなどのデザイントークン
- **テーマ設定適用** - プロジェクトへのテーマ設定の自動適用
- **コンポーネント統合** - プロジェクトへのコンポーネント統合

## セットアップ

### 1. MCPサーバーのビルド

```bash
cd design-system-mcp
npm install
npm run build
```

### 2. 動作確認

```bash
npm run test
```

正常に動作すると以下のような出力が表示されます：
```
✅ MCPサーバー基本動作
✅ ComponentReader  
✅ TailwindTokenReader
🎯 成功率: 3/3 (100%)
```

## Cursor での設定

### 設定ファイルの作成

`~/.cursor/mcp.json` ファイルを作成または編集して、以下の設定を追加してください：

```json
{
  "mcpServers": {
    "nishiken-ui": {
      "command": "node",
      "args": ["/path/to/nishiken-ui/design-system-mcp/dist/server.js"],
      "env": {}
    }
  }
}
```

**重要**: `/path/to/nishiken-ui/` の部分は、実際のプロジェクトパスに置き換えてください。

### 設定手順

1. **MCPサーバーをビルド**
   ```bash
   cd design-system-mcp
   npm run build
   ```

2. **Cursor設定ディレクトリの確認**
   ```bash
   mkdir -p ~/.cursor
   ```

3. **MCP設定ファイルの編集**
   ```bash
   # 新規作成の場合
   cat > ~/.cursor/mcp.json << 'EOF'
   {
     "mcpServers": {
       "nishiken-ui": {
         "command": "node",
         "args": ["/Users/YOUR_USERNAME/path/to/nishiken-ui/design-system-mcp/dist/server.js"],
         "env": {}
       }
     }
   }
   EOF
   ```

   既存の設定がある場合は、`mcpServers` オブジェクト内に `nishiken-ui` の設定を追加してください。

4. **Cursorを再起動**

5. **動作確認**
   - Cursorでプロジェクトを開く
   - Composer (`Cmd+I` または `Ctrl+I`) を開く
   - 「nishiken-uiのButtonコンポーネントを検索して」と入力
   - MCPサーバーからの応答があれば成功

## 使用可能なツール

### 1. search_components
コンポーネントを検索します。

**パラメータ:**
- `query` (string, optional): 検索キーワード
- `category` (string, optional): コンポーネントカテゴリ (`button`, `input`, `card`, `typography`, `label`)

**使用例:**
```
"Buttonコンポーネントを検索して"
"inputカテゴリのコンポーネントを全て見せて"
```

### 2. get_component_code
指定したコンポーネントの完全なコードを取得します。

**パラメータ:**
- `componentName` (string, required): コンポーネント名
- `includeStories` (boolean, optional): Storybookストーリーを含める
- `includeTypes` (boolean, optional): 型定義ファイルを含める
- `includeIndex` (boolean, optional): index.tsファイルを含める

**使用例:**
```
"Buttonコンポーネントのコードをストーリーも含めて取得して"
"Cardコンポーネントの実装コードを見せて"
```

### 3. get_design_tokens
デザイントークンを取得します。

**パラメータ:**
- `category` (string, optional): トークンカテゴリ (`color`, `spacing`, `border-radius`, `typography`, `shadow`, `animation`)
- `format` (string, optional): 出力形式 (`json`, `css`, `js`)

**使用例:**
```
"カラートークンをCSS形式で取得して"
"全てのデザイントークンをJavaScript形式で出力して"
```

### 4. apply_theme_setup
プロジェクトにテーマ設定を適用します。

**パラメータ:**
- `targetPath` (string, required): 対象プロジェクトのパス
- `framework` (string, optional): フレームワーク (`react`, `next`, `vite`)
- `typescript` (boolean, optional): TypeScript使用
- `setupTailwind` (boolean, optional): Tailwind CSS v4をセットアップ

### 5. integrate_components
コンポーネントをプロジェクトに統合します。

**パラメータ:**
- `components` (array, required): 統合するコンポーネント名の配列
- `targetPath` (string, required): 対象プロジェクトのパス
- `framework` (string, optional): フレームワーク (`react`, `next`, `vite`)
- `setupStorybook` (boolean, optional): Storybookストーリーを含める

## トラブルシューティング

### MCPサーバーが認識されない場合

1. **パスの確認**
   ```bash
   # サーバーファイルが存在するか確認
   ls -la /path/to/nishiken-ui/design-system-mcp/dist/server.js
   ```

2. **ビルドの再実行**
   ```bash
   cd design-system-mcp
   npm run build
   ```

3. **設定ファイルの構文確認**
   ```bash
   # JSON構文をチェック
   cat ~/.cursor/mcp.json | jq .
   ```

4. **Cursorの完全再起動**
   - Cursorを完全に終了
   - macOSの場合: `Cmd+Q`でアプリケーションを終了
   - 再度Cursorを起動

### 動作確認方法

Composerで以下のコマンドを試してください：

```
# 基本的な検索
"nishiken-uiのコンポーネント一覧を表示して"

# 特定のコンポーネント取得
"Buttonコンポーネントのコードを取得して"

# デザイントークン取得
"カラートークンを表示して"
```

### ログの確認

MCPサーバーのデバッグ情報が必要な場合：

```bash
# 直接サーバーを起動してテスト
cd design-system-mcp
node dist/server.js
```

## Claude Desktop での設定

Claude Desktopでも同様に使用できます。`~/Documents/Claude/claude_desktop_config.json` に以下を追加：

```json
{
  "mcpServers": {
    "nishiken-ui": {
      "command": "node",
      "args": ["/path/to/nishiken-ui/design-system-mcp/dist/server.js"]
    }
  }
}
```

## 開発者向け情報

### アーキテクチャ

- **ComponentReader**: コンポーネントファイルの解析とメタデータ抽出
- **TailwindTokenReader**: Tailwind CSS設定からデザイントークンを抽出
- **IntegrationManager**: プロジェクトへの統合処理

### 拡張方法

新しいツールを追加する場合：

1. `src/server.ts` の `ListToolsRequestSchema` ハンドラーに新しいツール定義を追加
2. `CallToolRequestSchema` ハンドラーに処理ロジックを追加
3. 必要に応じてユーティリティクラスを作成

### テスト

```bash
# 全体テスト
npm run test

# 開発モード（ファイル監視）
npm run dev

# 型チェック
npm run typecheck
```

## ライセンス

MIT License