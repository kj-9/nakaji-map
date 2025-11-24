export type Category =
	| 'ラーメン'
	| 'うどん'
	| 'そば'
	| 'カレー'
	| '焼肉'
	| '寿司'
	| '天ぷら'
	| 'とんかつ'
	| '海鮮'
	| '焼き鳥'
	| 'ステーキ/ハンバーグ'
	| '洋食'
	| '中華'
	| 'イタリアン'
	| 'カフェ'
	| 'スイーツ'
	| 'パン'
	| '定食/食堂'
	| '粉もの'
	| 'うなぎ'
	| 'その他';

type CategoryRule = {
	category: Category;
	keywords: string[];
};

export const CATEGORY_RULES: CategoryRule[] = [
	{ category: 'うなぎ', keywords: ['うなぎ', '鰻', 'うな丼', 'うな重'] },
	{
		category: 'ラーメン',
		keywords: ['ラーメン', 'らーめん', 'ramen', '中華そば', '豚骨', 'とんこつ', 'つけ麺', '担々麺']
	},
	{ category: 'うどん', keywords: ['うどん', 'udon'] },
	{ category: 'そば', keywords: ['そば', '蕎麦'] },
	{ category: 'カレー', keywords: ['カレー', 'curry', 'スパイスカレー'] },
	{
		category: '焼肉',
		keywords: ['焼肉', '焼き肉', 'ホルモン', 'カルビ', 'サムギョプサル', 'ジンギスカン']
	},
	{ category: '寿司', keywords: ['寿司', 'すし', '鮨'] },
	{ category: '天ぷら', keywords: ['天ぷら', '天婦羅'] },
	{
		category: 'とんかつ',
		keywords: ['とんかつ', '豚カツ', 'ロースカツ', 'ヒレカツ', 'カツレツ', 'トンカツ']
	},
	{
		category: '海鮮',
		keywords: [
			'海鮮',
			'海鮮丼',
			'刺身',
			'鮮魚',
			'魚介',
			'マグロ',
			'まぐろ',
			'鮪',
			'ゴマサバ',
			'ごまさば'
		]
	},
	{ category: '焼き鳥', keywords: ['焼き鳥', 'やきとり', '串焼', '鳥料理'] },
	{
		category: 'ステーキ/ハンバーグ',
		keywords: ['ステーキ', 'ハンバーグ', 'ローストビーフ']
	},
	{
		category: '中華',
		keywords: [
			'中華',
			'餃子',
			'チャーハン',
			'炒飯',
			'麻婆',
			'小籠包',
			'坦々麺',
			'エビマヨ',
			'海老マヨ',
			'豚まん',
			'肉まん'
		]
	},
	{
		category: 'イタリアン',
		keywords: ['イタリアン', 'パスタ', 'ピザ', 'ピッツァ', 'トラットリア']
	},
	{
		category: '洋食',
		keywords: [
			'洋食',
			'オムライス',
			'ビストロ',
			'グリル',
			'ナポリタン',
			'ビーフシチュー',
			'ハヤシライス',
			'ハッシュドビーフ',
			'カルボナーラ'
		]
	},
	{
		category: 'カフェ',
		keywords: ['カフェ', '喫茶', '珈琲', 'コーヒー', 'tea', 'ティー', '紅茶', 'カフェラテ']
	},
	{
		category: 'スイーツ',
		keywords: [
			'スイーツ',
			'ケーキ',
			'モンブラン',
			'タルト',
			'パフェ',
			'かき氷',
			'ジェラート',
			'クレープ',
			'シュークリーム',
			'和菓子',
			'お菓子',
			'たい焼',
			'たい焼き',
			'どら焼',
			'どらやき',
			'大福',
			'団子'
		]
	},
	{ category: 'パン', keywords: ['パン', 'ベーカリー', 'サンドイッチ', 'ブーランジェリー'] },
	{
		category: '定食/食堂',
		keywords: [
			'定食',
			'食堂',
			'チャンポン',
			'ちゃんぽん',
			'唐揚げ',
			'からあげ',
			'親子丼',
			'カツ丼',
			'豚丼',
			'ぶた丼',
			'牛丼',
			'天丼',
			'アジフライ',
			'フライ',
			'メンチカツ',
			'コロッケ',
			'チキン南蛮',
			'おにぎり',
			'焼飯',
			'焼きめし',
			'焼めし',
			'焼魚',
			'焼き魚',
			'煮魚'
		]
	},
	{
		category: '粉もの',
		keywords: ['お好み焼き', 'たこ焼き', 'タコ焼き', 'もんじゃ', '鉄板焼き']
	},
	{ category: 'その他', keywords: [] }
];

export const CATEGORIES: Category[] = CATEGORY_RULES.map((rule) => rule.category);

export function resolveCategory(source: {
	name?: string;
	title?: string;
	category?: string;
}): Category {
	if (source.category && CATEGORIES.includes(source.category as Category)) {
		return source.category as Category;
	}

	const normalized = `${source.name ?? ''} ${source.title ?? ''}`.toLowerCase();

	for (const rule of CATEGORY_RULES) {
		for (const keyword of rule.keywords) {
			if (normalized.includes(keyword.toLowerCase())) {
				return rule.category;
			}
		}
	}

	return 'その他';
}
