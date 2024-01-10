export const formatDateStr = (dateStr: string) => {
	return new Date(dateStr).toLocaleDateString('ja-JP', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
};
