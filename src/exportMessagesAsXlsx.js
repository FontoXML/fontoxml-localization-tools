const xlsx = require('xlsx');

module.exports = function exportMessagesAsXlsx (messages, xlsxPath) {
	const workbook = xlsx.utils.book_new();
	const sheet = xlsx.utils.json_to_sheet(
		messages.map(msg => msg.toSheetRow())
	);
	xlsx.utils.book_append_sheet(workbook, sheet, 'messages');
	xlsx.writeFile(workbook, xlsxPath, {
		bookType: 'xlsx',
		bookSST: false,
		type: 'binary'
	});
};
