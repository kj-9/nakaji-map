import type { Category } from './category';

// Food illustrations match each category; grilled meats share the steak illustration.
export const categoryIcons = {
	ラーメン: 'generated-ramen',
	うどん: 'generated-udon',
	そば: 'generated-soba',
	カレー: 'generated-curry',
	焼肉: 'generated-steak',
	寿司: 'generated-sushi',
	天ぷら: 'generated-tempura',
	とんかつ: 'generated-tonkatsu',
	海鮮: 'generated-seafood',
	焼き鳥: 'generated-yakitori',
	'ステーキ/ハンバーグ': 'generated-steak',
	洋食: 'generated-omurice',
	中華: 'generated-gyoza',
	イタリアン: 'generated-pasta',
	カフェ: 'generated-coffee',
	スイーツ: 'generated-cake',
	パン: 'generated-bread',
	'定食/食堂': 'generated-teishoku',
	粉もの: 'generated-takoyaki',
	うなぎ: 'generated-unagi',
	その他: 'generated-other'
} satisfies Record<Category, string>;

export function markerImage(category: Category, selected = false) {
	return `${categoryIcons[category]}${selected ? '-selected' : ''}`;
}

const assets = import.meta.glob<string>('../asset/map-markers/generated-*.png', {
	eager: true,
	query: '?url',
	import: 'default'
});
export const markerImages = Object.fromEntries(
	Object.entries(assets).map(([path, url]) => [path.split('/').pop()!.replace('.png', ''), url])
);
