export const compareDateStrDesc = (a: string, b: string) => {
	return new Date(b).getTime() - new Date(a).getTime();
};

export const formatDateStr = (dateStr: string) => {
	return new Date(dateStr).toLocaleDateString('ja-JP', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
};
