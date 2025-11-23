# Repository Guidelines

## プロジェクト構成とモジュール配置

- `src/routes` にページエントリを集約。`+page.svelte` が地図 UI、`+layout.svelte` で共通スタイル、`404` ディレクトリでエラーハンドリング。
- `src/lib` に MapPane・NavBar などの UI コンポーネントと地図ロジック、`store.ts` に地物データと型、`formatter.ts` に整形ユーティリティ。
- `src/asset` は地図関連アセット、`static` は配信したい静的ファイル、`data` は補助データ置き場。`build` は静的出力物。
- Playwright の E2E テストは `tests` に配置。ルート直下に各種設定（ESLint、Prettier、Tailwind、Vite）がある。

## セットアップ・開発・ビルド

- `pnpm install`（preinstall で `pnpm` を強制）。Node は TypeScript + SvelteKit 前提。
- 開発サーバー: `pnpm dev`（デフォルトで http://localhost:5173）。サーバー起動後に地図描画を確認。
- 静的ビルド: `pnpm build`。生成物は `build/` に出力され、`pnpm preview` でローカル確認。
- 型・Lint: `pnpm check`（svelte-check）、`pnpm lint`（Prettier チェック + ESLint）、自動整形は `pnpm format`。
- テスト: `pnpm test` で統合実行、`pnpm test:unit`（Vitest）、`pnpm test:integration`（Playwright；`playwright.config.ts` で `npm run build && npm run preview` を起動）。

## コーディングスタイルと命名

- Prettier 設定: タブインデント、幅 100、シングルクォート、末尾カンマなし、Svelte 用プラグイン有効。
- ESLint は recommended + TypeScript + Svelte + prettier を拡張。`.svelte` は `svelte-eslint-parser` を使用。
- TypeScript での型付けを徹底し、Svelte コンポーネントはロジックと表示を分離（処理は `src/lib` へ）。CSS は Tailwind を優先し、共通スタイルは `src/routes/styles.css` にまとめる。
- ルートやコンポーネント名は役割を明示（例: `MapPane`, `InfoPanel`）。店舗や動画など地物データは `FeatureForPopup` 型に合わせる。

## テスト方針

- UI 変更時は最低限 `pnpm test:integration` でページ読み込みと主要フロー（地図のロード、ポップアップ表示）を確認。負荷を避けたい場合は `pnpm test:integration -- --grep <pattern>` で絞り込み。
- コンポーネントやユーティリティは Vitest の `*.test.ts` で単体検証。Svelte コンポーネントは可能なら分割し、DOM 依存を薄くしてテストしやすくする。
- 破壊的変更やデータ更新時はスクリーンショットや挙動メモを PR に添付し、再現手順を明記。

## コミットと PR

- コミットは git ログに倣い、文頭大文字の平叙文で変更点を具体化（例: “Enhance NavBar and SearchTable components”）。粒度は小さく、セットアップ変更と機能変更を分ける。
- PR には概要、目的、主要変更点、テスト結果（実行コマンド）を記述。UI 変更はスクリーンショットや短い動画を添付し、関連 Issue があればリンクする。
- `.env.*` やデータファイルは秘匿。新規依存追加時は理由を明記し、ビルド・テストが通ることを確認してからレビュー依頼する。
