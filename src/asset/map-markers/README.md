# 地図カテゴリマーカー

Material Design Icons 7.4.47（`@mdi/svg` / Pictogrammers）の絵柄を使用。
ライセンスは同梱の `LICENSE` を参照。元SVGは `source/` に保持する。

- 配布元: https://pictogrammers.com/library/mdi/
- PNGは68×68の透過画像。通常表示は0.5倍、選択時は0.6倍。
- ライブラリの `circle` に背景色を付け、各料理アイコンを合成したもの。
- 通常: 外周 `#24354b`、内側 `#ffffff`、絵柄 `#24354b`。
- 選択: 背景 `#2464ff`、絵柄 `#ffffff`。
- Sharpでcircleを68px/64px、絵柄を38pxにラスタライズし、中心に合成。
- 食材や料理の近いカテゴリで絵柄を共用。対応は `src/lib/map-markers.ts`。

アプリ実行時の追加ライブラリや外部アイコン配信への通信は不要。
