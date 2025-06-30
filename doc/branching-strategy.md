# nishiken-ui ブランチ運用戦略

## 概要

このドキュメントでは、nishiken-uiプロジェクトにおけるブランチ運用戦略について説明します。
業界標準のベストプラクティスに基づき、Ver1系とVer2系を並行して開発・保守するための運用ルールを定めています。

## ブランチ構成

```
main                # 現在の安定版（v1.x）
├── v1.x            # Ver1系の長期サポート（LTS）ブランチ
├── next            # Ver2系の開発ブランチ
├── feature/*       # 機能開発用ブランチ
├── hotfix/v1/*     # Ver1系向け緊急修正
└── hotfix/v2/*     # Ver2系向け緊急修正
```

### 各ブランチの役割

| ブランチ名 | 用途 | バージョン例 | 説明 |
|-----------|------|-------------|------|
| `main` | 現在の安定版 | 1.x.x | 現在はv1.x、将来的にv2.0リリース後はv2.xに切り替え |
| `v1.x` | Ver1系LTS | 1.0.1, 1.1.0等 | Ver1系の長期サポートとバグ修正 |
| `next` | Ver2系開発 | 2.0.0-beta.x | 破壊的変更を含むVer2系の開発 |
| `feature/*` | 機能開発 | - | 新機能の開発用 |
| `hotfix/v1/*` | v1緊急修正 | - | Ver1系の緊急バグ修正 |
| `hotfix/v2/*` | v2緊急修正 | - | Ver2系の緊急バグ修正 |

## ワークフロー

### 1. Ver1系の保守作業

```bash
# Ver1系のバグ修正
git checkout v1.x
git checkout -b hotfix/v1/fix-button-style
# 修正作業を実施
git add .
git commit -m "fix: button style issue in dark mode"
git push origin hotfix/v1/fix-button-style
# PRをv1.xブランチへ作成

# mainブランチへの反映（現在はv1.xが最新）
git checkout main
git merge v1.x
```

### 2. Ver2系の新機能開発

```bash
# Ver2系の新機能開発
git checkout next
git checkout -b feature/new-date-picker
# 開発作業を実施
git add .
git commit -m "feat: add DatePicker component"
git push origin feature/new-date-picker
# PRをnextブランチへ作成
```

#### v2開発中のブランチ命名パターン

v2開発中は、featureブランチ名に`v2-`プレフィックスをつけると分かりやすいです：

- `feature/v2-new-button-api` - 新しいButton APIの実装
- `feature/v2-breaking-theme-system` - 破壊的変更を含むテーマシステム
- `feature/v2-typescript-5-migration` - TypeScript 5への移行

```bash
# 推奨される命名例
git checkout next
git checkout -b feature/v2-new-button-api
```

### 3. Ver1系の修正をVer2系へ反映

```bash
# 重要なバグ修正をVer2系にも適用
git checkout next
git cherry-pick <commit-hash>
# または、コンフリクトが予想される場合は手動で修正
```

## NPMパッケージの配布戦略

### タグ戦略

| タグ名 | 用途 | インストールコマンド |
|--------|------|-------------------|
| `latest` | デフォルト（現在はv1.x） | `npm install nishiken-ui` |
| `next` | v2.x開発版 | `npm install nishiken-ui@next` |
| `v1` | v1.x最新版への明示的参照 | `npm install nishiken-ui@v1` |
| `v2` | v2.x安定版（リリース後） | `npm install nishiken-ui@v2` |

### リリースコマンド

```bash
# Ver1系のリリース
npm version patch  # または minor
npm publish --tag latest --tag v1

# Ver2系のベータリリース
npm version 2.0.0-beta.1
npm publish --tag next

# Ver2.0正式リリース時
npm publish --tag latest --tag v2
# 以降、v1.xは --tag v1 のみで公開
```

### ユーザーのインストール方法

```bash
# デフォルト（現在はv1.x、将来はv2.x）
npm install nishiken-ui

# Ver1系の最新版
npm install nishiken-ui@v1

# Ver2系の開発版
npm install nishiken-ui@next

# 特定バージョン
npm install nishiken-ui@1.0.0
npm install nishiken-ui@2.0.0-beta.1
```

## バージョニングルール

[Semantic Versioning](https://semver.org/)に従います：

- **MAJOR** (x.0.0): 破壊的変更
- **MINOR** (1.x.0): 後方互換性のある機能追加
- **PATCH** (1.0.x): 後方互換性のあるバグ修正

### プレリリース版の命名規則

```
2.0.0-alpha.1   # 初期開発版
2.0.0-beta.1    # 機能完成、バグ修正段階
2.0.0-rc.1      # リリース候補
2.0.0           # 正式リリース
```

## 移行フェーズ

### Phase 1: 準備段階（現在）
- `main` = v1.x最新安定版
- `v1.x` = v1系LTSブランチ
- `next` = v2系開発開始

### Phase 2: v2.0正式リリース時
- `main` = v2.x最新安定版に切り替え
- `v1.x` = v1系メンテナンス継続
- NPMの`latest`タグをv2.xに変更

### Phase 3: 長期運用
- 必要に応じて`v2.x`ブランチを作成
- 新しいメジャーバージョン開発時は再度`next`ブランチを使用

## CI/CD設定例

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main, v1.x, next]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm test
      
      - name: Determine NPM tag
        id: npm-tag
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "tag=latest" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/v1.x" ]]; then
            echo "tag=v1" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/next" ]]; then
            echo "tag=next" >> $GITHUB_OUTPUT
          fi
      
      - name: Publish to NPM
        run: npm publish --tag ${{ steps.npm-tag.outputs.tag }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/)に従います：

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードの意味に影響しない変更
- `refactor:` バグ修正や機能追加を含まないコード変更
- `perf:` パフォーマンス改善
- `test:` テストの追加・修正
- `build:` ビルドシステムや外部依存関係の変更
- `ci:` CI設定ファイルとスクリプトの変更
- `chore:` その他の変更

### スコープの例
```
feat(Button): add loading state
fix(Card): resolve border issue in Safari
docs(migration): add v1 to v2 migration guide
```

## ドキュメント戦略

- `/docs` - 現在の安定版ドキュメント
- `/docs/v1` - v1.xドキュメント（アーカイブ）
- `/docs/next` - v2.x開発版ドキュメント
- `/MIGRATION.md` - バージョン間の移行ガイド

## よくある質問

### Q: いつv2.0を`latest`タグでリリースすべきか？

A: 以下の条件を満たした時：
- すべての計画された破壊的変更が完了
- 十分なテストとベータ期間を経過
- 移行ガイドとツールが準備完了
- 主要な採用者からのフィードバックを反映

### Q: v1.xはいつまでサポートされるか？

A: 最低でもv2.0リリース後6ヶ月〜1年はセキュリティ修正とクリティカルなバグ修正を提供。具体的な日付はコミュニティと相談して決定。

### Q: 両バージョンを同時に使用できるか？

A: 基本的には推奨しませんが、異なるパッケージ名やエイリアスを使用することで技術的には可能：
```json
{
  "dependencies": {
    "nishiken-ui-v1": "npm:nishiken-ui@v1",
    "nishiken-ui-v2": "npm:nishiken-ui@v2"
  }
}
```

## 参考リンク

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [NPM Distribution Tags](https://docs.npmjs.com/cli/v7/commands/npm-dist-tag)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## 連絡先

質問や提案がある場合は、GitHubのIssuesまたはPull Requestでお知らせください。