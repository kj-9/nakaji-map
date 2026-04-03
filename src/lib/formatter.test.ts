import { describe, expect, it } from 'vitest';

import { compareDateStrDesc } from './formatter';

describe('compareDateStrDesc', () => {
	it('sorts newer dates before older dates', () => {
		const publishedAtList = [
			'2026-02-27T10:00:37Z',
			'2026-03-10T10:01:15Z',
			'2026-03-03T10:01:02Z'
		];

		expect([...publishedAtList].sort(compareDateStrDesc)).toEqual([
			'2026-03-10T10:01:15Z',
			'2026-03-03T10:01:02Z',
			'2026-02-27T10:00:37Z'
		]);
	});
});
