# nakaji-map

福岡グルメ 中島浩二チャンネルマップ。

## 開発

Node.js 24 LTS（`.node-version`）と、`package.json` の `packageManager` に指定したpnpmを使用します。
CIとデプロイも同じバージョンを利用します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

地図タイルを表示するには、`.env.local` に `VITE_PROTOMAPS_API_KEY` を設定します。

## 検証

```sh
pnpm check
pnpm lint
pnpm test:unit
pnpm exec playwright install chromium
pnpm test:integration
```

E2Eは外部タイルをスタブ化し、最新データの表示、検索、ポップアップ、動画への直接リンクを検証します。
本番用の静的ファイルは `pnpm build` で `build/` に生成されます。

## 依存更新

`pnpm outdated` で候補を確認し、互換性のある組み合わせで `package.json` と
`pnpm-lock.yaml` を更新します。メジャー更新時は各ライブラリの移行ガイドを確認し、
上記チェックとビルド、地図の表示を検証します。
Nodeの更新時は `.node-version` と `package.json` の `engines` を揃えます。
