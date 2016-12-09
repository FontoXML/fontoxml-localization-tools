module.exports = function roundtripThroughJson (obj) {
	return JSON.parse(JSON.stringify(obj));
};
