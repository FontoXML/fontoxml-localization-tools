const xlsx = require('xlsx');

module.exports = function updateMessagesFromXlsx (messages, xlsxPath) {
	const workbook = xlsx.readFile(xlsxPath);
	const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
	const rows = xlsx.utils.sheet_to_json(firstSheet);
	const byIn = rows.reduce((byIn, row) => {
		byIn[row.in] = row.out;
		return byIn;
	}, {});
	return messages.map(msg =>
		msg.original in byIn ?
			msg.updateLocalization(byIn[msg.original]) :
			msg
	);
};
