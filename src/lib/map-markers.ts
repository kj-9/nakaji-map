import type { Category } from './category';

// Related foods share a pictogram; the precise category remains in the picker.
export const categoryIcons = {
	ラーメン: 'noodles',
	うどん: 'noodles',
	そば: 'noodles',
	カレー: 'rice',
	焼肉: 'food-steak',
	寿司: 'fish',
	天ぷら: 'bowl-mix',
	とんかつ: 'food-steak',
	海鮮: 'fish',
	焼き鳥: 'food-drumstick',
	'ステーキ/ハンバーグ': 'food-steak',
	洋食: 'silverware-fork-knife',
	中華: 'bowl-mix',
	イタリアン: 'pasta',
	カフェ: 'coffee',
	スイーツ: 'cake',
	パン: 'bread-slice',
	'定食/食堂': 'rice',
	粉もの: 'pizza',
	うなぎ: 'fish',
	その他: 'silverware-fork-knife'
} satisfies Record<Category, string>;

export function markerImage(category: Category, selected = false) {
	return `${categoryIcons[category]}${selected ? '-selected' : ''}`;
}

const assets = import.meta.glob<string>('../asset/map-markers/*.png', {
	eager: true,
	query: '?url',
	import: 'default'
});
export const markerImages = Object.fromEntries(
	Object.entries(assets).map(([path, url]) => [path.split('/').pop()!.replace('.png', ''), url])
);
