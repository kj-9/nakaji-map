export const formatDateStr = (dateStr: string) => {
	return new Date(dateStr).toLocaleDateString('ja-JP', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
};
